-- Two unrelated fixes bundled together:
--
-- 1. Corrects this week's schedule for roysamrat216@gmail.com. Monday
--    (2026-09-14) was wrongly showing Lower Body B — it's recorded here as
--    completed anyway since that's what was actually done. The rest of the
--    current week (Tue 09/15 - Sat 09/20) is set to the one-off order given
--    to get back on track, then from Monday 2026-09-21 through the last day
--    of October the recurring Mon-Fri split (Upper A / Lower A / Cardio A /
--    Upper B / Lower B) is (re)applied every week, overwriting any
--    not-yet-completed main-slot row that doesn't already match. Already
--    'completed' rows are never touched.
--
-- 2. Fixes the root cause of "closing the browser mid-workout resets my
--    progress": startWorkoutSession looked up the in-progress session for a
--    workout with .maybeSingle(), which errors out (silently, since the
--    error wasn't checked) if more than one in-progress row exists for the
--    same user+workout — e.g. a double-tap on "Start Workout", or a retry
--    fired right as the browser closed. When that lookup errored, the code
--    fell through and inserted a brand-new session, which has no
--    completed_sets yet — hence "start from the beginning". A partial unique
--    index now makes that race impossible to create going forward, and any
--    duplicates already sitting in the table are cleaned up (newest kept
--    in_progress, older ones marked abandoned — their completed_sets rows
--    are untouched, only the session status changes).

-- ---------------------------------------------------------------------------
-- 1. Schedule correction
-- ---------------------------------------------------------------------------
do $$
declare
  v_user_id uuid;
  v_day date;
  v_dow integer;
  v_slug text;
  v_slot text;
  v_status text;
  v_workout_id uuid;
begin
  select id into v_user_id from auth.users where email = 'roysamrat216@gmail.com';
  if v_user_id is null then
    return;
  end if;

  for v_day in select generate_series('2026-09-14'::date, '2026-10-31'::date, '1 day'::interval)::date
  loop
    v_dow := extract(dow from v_day);
    v_slug := null;
    v_slot := 'main';
    v_status := 'scheduled';

    if v_day = '2026-09-14' then
      v_slug := 'lower-body-b';
      v_status := 'completed';
    elsif v_day = '2026-09-15' then
      v_slug := 'upper-body-a';
    elsif v_day = '2026-09-16' then
      v_slug := 'lower-body-a';
    elsif v_day = '2026-09-17' then
      v_slug := 'upper-body-b';
    elsif v_day = '2026-09-18' then
      v_slug := 'lower-body-b';
    elsif v_day = '2026-09-19' then
      v_slug := 'cardio-a';
      v_slot := 'extra';
    elsif v_day >= '2026-09-21' then
      v_slug := case v_dow
        when 1 then 'upper-body-a'
        when 2 then 'lower-body-a'
        when 3 then 'cardio-a'
        when 4 then 'upper-body-b'
        when 5 then 'lower-body-b'
        else null
      end;
    end if;

    if v_slug is null then
      continue;
    end if;

    select id into v_workout_id from workouts where slug = v_slug;
    if v_workout_id is null then
      continue;
    end if;

    if exists (
      select 1 from scheduled_workouts
      where user_id = v_user_id and slot = v_slot and scheduled_date = v_day
    ) then
      -- Monday (2026-09-14) is the one case deliberately overwritten even if
      -- already marked complete, to correct its workout to what actually
      -- happened. Every other day only touches not-yet-completed rows.
      update scheduled_workouts
      set workout_id = v_workout_id, status = v_status
      where user_id = v_user_id
        and slot = v_slot
        and scheduled_date = v_day
        and (v_day = '2026-09-14' or status <> 'completed');
    else
      insert into scheduled_workouts (user_id, workout_id, scheduled_date, slot, status)
      values (v_user_id, v_workout_id, v_day, v_slot, v_status);
    end if;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 2. Duplicate in-progress session repair + guard
-- ---------------------------------------------------------------------------
do $$
declare
  r record;
begin
  for r in
    select ws.id
    from workout_sessions ws
    where ws.status = 'in_progress'
      and ws.id not in (
        select distinct on (user_id, workout_id) id
        from workout_sessions
        where status = 'in_progress'
        order by user_id, workout_id, started_at desc
      )
  loop
    update workout_sessions
    set status = 'abandoned', completed_at = now()
    where id = r.id;
  end loop;
end $$;

create unique index if not exists workout_sessions_one_in_progress_per_workout
  on workout_sessions (user_id, workout_id)
  where status = 'in_progress';
