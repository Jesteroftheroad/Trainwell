-- Adds a new "Elliptical + Row" workout (60 min elliptical, then 5 min
-- rowing) and schedules it as an EXTRA-slot alternate for the next 2 weeks
-- (2026-10-06 through 2026-10-19), alongside the existing regular main-slot
-- training — nothing in the main slot is touched. Shows up under the
-- "Extras" tab on /workouts for each of those days.

-- ---------------------------------------------------------------------------
-- New exercise
-- ---------------------------------------------------------------------------
insert into exercises (name, slug, category, equipment, primary_muscles, secondary_muscles, instructions, default_unit)
values
  ('Rowing Machine', 'rowing-machine', 'cardio', '{rowing machine}', '{back,legs,cardio}', '{arms}', 'Drive through your legs, lean back slightly, then pull the handle to your sternum before reversing the motion smoothly.', 'time')
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Alternate workout
-- ---------------------------------------------------------------------------
select seed_workout_template(
  'elliptical-and-row', 'Elliptical + Row', 'cardio', 65, 'Alternate cardio option: steady elliptical finished with a short rowing machine burst.',
  $$[{"type":"cardio","title":"Elliptical","order":1,"exercises":[{"slug":"elliptical","order":1,"sets":[{"set_index":1,"duration_seconds":3600}],"notes":"Hands on the static handles, steady pace."}]},{"type":"cardio","title":"Rowing","order":2,"exercises":[{"slug":"rowing-machine","order":1,"sets":[{"set_index":1,"duration_seconds":300}],"notes":"Steady pace to finish."}]}]$$::jsonb
);

update workouts
set created_by = (select id from auth.users where email = 'roysamrat216@gmail.com')
where slug = 'elliptical-and-row';

-- ---------------------------------------------------------------------------
-- Schedule as an extra every day for the next 2 weeks
-- ---------------------------------------------------------------------------
do $$
declare
  v_user_id uuid;
  v_workout_id uuid;
  v_day date;
begin
  select id into v_user_id from auth.users where email = 'roysamrat216@gmail.com';
  select id into v_workout_id from workouts where slug = 'elliptical-and-row';
  if v_user_id is null or v_workout_id is null then
    return;
  end if;

  for v_day in select generate_series('2026-10-06'::date, '2026-10-19'::date, '1 day'::interval)::date
  loop
    if not exists (
      select 1 from scheduled_workouts
      where user_id = v_user_id and slot = 'extra' and scheduled_date = v_day and workout_id = v_workout_id
    ) then
      insert into scheduled_workouts (user_id, workout_id, scheduled_date, slot, status)
      values (v_user_id, v_workout_id, v_day, 'extra', 'scheduled');
    end if;
  end loop;
end $$;
