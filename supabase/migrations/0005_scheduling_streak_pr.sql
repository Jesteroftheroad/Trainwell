-- Fixes the weekday→workout mapping (it was cycling from signup day instead
-- of anchoring to real calendar weekdays), adds default rest periods between
-- sets/supersets, and adds columns for a durable streak and personal-record
-- tracking. Nothing here deletes or rewrites completed_sets / workout_sessions
-- history — only scheduled_workouts.workout_id (future, not-yet-completed
-- rows) and profiles are touched, plus two new nullable/defaulted columns.

-- ---------------------------------------------------------------------------
-- 1. Correct weekday mapping: Mon=Upper A, Tue=Lower A, Wed=Cardio A,
--    Thu=Upper B, Fri=Lower B, weekends rest.
-- ---------------------------------------------------------------------------
create or replace function seed_demo_schedule(p_user_id uuid)
returns void as $$
declare
  v_day date;
  v_dow integer;
  v_slug text;
  i integer;
begin
  if exists (select 1 from scheduled_workouts where user_id = p_user_id) then
    return;
  end if;

  for i in 0..13 loop
    v_day := current_date + i;
    v_dow := extract(dow from v_day); -- 0 = Sunday .. 6 = Saturday

    v_slug := case v_dow
      when 1 then 'upper-body-a'
      when 2 then 'lower-body-a'
      when 3 then 'cardio-a'
      when 4 then 'upper-body-b'
      when 5 then 'lower-body-b'
      else null
    end;

    if v_slug is not null then
      insert into scheduled_workouts (user_id, workout_id, scheduled_date, slot, status)
      select p_user_id, w.id, v_day, 'main', 'scheduled'
      from workouts w where w.slug = v_slug;
    end if;
  end loop;

  insert into scheduled_workouts (user_id, workout_id, scheduled_date, slot, status)
  select p_user_id, w.id, current_date, 'extra', 'scheduled'
  from workouts w where w.slug = 'cardio-a';

  insert into scheduled_workouts (user_id, workout_id, scheduled_date, slot, status)
  select p_user_id, w.id, current_date + 1, 'backup', 'scheduled'
  from workouts w where w.slug = 'lower-body-b';
end;
$$ language plpgsql security definer set search_path = public;

-- One-time repair: remap every existing user's not-yet-completed main-slot
-- rows to the correct workout for that date's actual weekday. Rows already
-- marked 'completed' are left alone — they reflect what was actually done.
create or replace function fix_scheduled_workout_weekday_mapping(p_user_id uuid)
returns integer as $$
declare
  v_updated integer := 0;
  r record;
  v_correct_slug text;
  v_correct_workout_id uuid;
begin
  for r in
    select sw.id, sw.scheduled_date, sw.workout_id
    from scheduled_workouts sw
    where sw.user_id = p_user_id
      and sw.slot = 'main'
      and sw.status = 'scheduled'
  loop
    v_correct_slug := case extract(dow from r.scheduled_date)
      when 1 then 'upper-body-a'
      when 2 then 'lower-body-a'
      when 3 then 'cardio-a'
      when 4 then 'upper-body-b'
      when 5 then 'lower-body-b'
      else null
    end;

    if v_correct_slug is not null then
      select id into v_correct_workout_id from workouts where slug = v_correct_slug;
      if v_correct_workout_id is not null and v_correct_workout_id is distinct from r.workout_id then
        update scheduled_workouts set workout_id = v_correct_workout_id where id = r.id;
        v_updated := v_updated + 1;
      end if;
    end if;
  end loop;

  return v_updated;
end;
$$ language plpgsql security definer set search_path = public;

do $$
declare
  r record;
begin
  for r in select id from profiles loop
    perform fix_scheduled_workout_weekday_mapping(r.id);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 2. Rest between sets: 65s for regular "set" sections, 10s for supersets.
--    Only fills rows that don't already have a rest period set.
-- ---------------------------------------------------------------------------
update workout_exercises we
set rest_seconds = 65
from workout_sections ws
where we.section_id = ws.id
  and ws.section_type = 'set'
  and we.rest_seconds is null;

update workout_exercises we
set rest_seconds = 10
from workout_sections ws
where we.section_id = ws.id
  and ws.section_type = 'superset'
  and we.rest_seconds is null;

-- Keep the template-seeding function consistent for any future re-seed or
-- coach-authored workout — same defaults, only applied when a workout_exercise
-- doesn't explicitly specify its own rest_seconds.
create or replace function seed_workout_template(
  p_slug text,
  p_name text,
  p_workout_type text,
  p_duration_minutes integer,
  p_description text,
  p_sections jsonb
) returns uuid as $$
declare
  v_workout_id uuid;
  v_section jsonb;
  v_section_id uuid;
  v_exercise jsonb;
  v_workout_exercise_id uuid;
  v_exercise_id uuid;
  v_set jsonb;
  v_default_rest integer;
begin
  insert into workouts (name, slug, workout_type, estimated_duration_minutes, description, is_template)
  values (p_name, p_slug, p_workout_type, p_duration_minutes, p_description, true)
  on conflict (slug) do update set
    name = excluded.name,
    workout_type = excluded.workout_type,
    estimated_duration_minutes = excluded.estimated_duration_minutes,
    description = excluded.description
  returning id into v_workout_id;

  -- Re-seeding: wipe previous sections (cascades to exercises/sets) so this stays idempotent.
  delete from workout_sections where workout_id = v_workout_id;

  for v_section in select * from jsonb_array_elements(p_sections)
  loop
    insert into workout_sections (workout_id, section_type, title, order_index, repeat_count, notes)
    values (
      v_workout_id,
      v_section ->> 'type',
      v_section ->> 'title',
      (v_section ->> 'order')::int,
      coalesce((v_section ->> 'repeat')::int, 1),
      v_section ->> 'notes'
    )
    returning id into v_section_id;

    v_default_rest := case v_section ->> 'type'
      when 'set' then 65
      when 'superset' then 10
      else null
    end;

    for v_exercise in select * from jsonb_array_elements(v_section -> 'exercises')
    loop
      select id into v_exercise_id from exercises where slug = v_exercise ->> 'slug';
      if v_exercise_id is null then
        raise exception 'Unknown exercise slug: %', v_exercise ->> 'slug';
      end if;

      insert into workout_exercises (section_id, exercise_id, order_index, side, tempo, rest_seconds, notes)
      values (
        v_section_id,
        v_exercise_id,
        (v_exercise ->> 'order')::int,
        coalesce(v_exercise ->> 'side', 'none'),
        v_exercise ->> 'tempo',
        coalesce((v_exercise ->> 'rest_seconds')::int, v_default_rest),
        v_exercise ->> 'notes'
      )
      returning id into v_workout_exercise_id;

      for v_set in select * from jsonb_array_elements(v_exercise -> 'sets')
      loop
        insert into exercise_sets (
          workout_exercise_id, set_index, reps, weight, weight_unit,
          duration_seconds, distance, distance_unit, side, is_warmup, notes
        )
        values (
          v_workout_exercise_id,
          (v_set ->> 'set_index')::int,
          (v_set ->> 'reps')::int,
          (v_set ->> 'weight')::numeric,
          coalesce(v_set ->> 'weight_unit', 'lb'),
          (v_set ->> 'duration_seconds')::int,
          (v_set ->> 'distance')::numeric,
          v_set ->> 'distance_unit',
          coalesce(v_set ->> 'side', 'none'),
          coalesce((v_set ->> 'is_warmup')::boolean, false),
          v_set ->> 'notes'
        );
      end loop;
    end loop;
  end loop;

  return v_workout_id;
end;
$$ language plpgsql;

-- ---------------------------------------------------------------------------
-- 3. Durable streak: an anchor date instead of a plain recomputed counter, so
--    a manually-set starting streak survives future recalculation instead of
--    being overwritten back down to whatever this app alone can prove.
-- ---------------------------------------------------------------------------
alter table profiles add column if not exists streak_anchor_date date;

-- ---------------------------------------------------------------------------
-- 4. Personal records: flag a completed set as a PR at the time it's recorded.
-- ---------------------------------------------------------------------------
alter table completed_sets add column if not exists is_personal_record boolean not null default false;
