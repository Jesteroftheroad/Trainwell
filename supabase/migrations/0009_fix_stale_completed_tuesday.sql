-- Follow-up to 0008 for roysamrat216@gmail.com.
--
-- 0008 deliberately left any scheduled_workouts row already marked
-- 'completed' untouched (except the explicit 09-14 case), as a guard against
-- overwriting real workout history. That guard backfired for 2026-09-15: the
-- main-slot row for that date was already sitting in the table marked
-- 'completed' / lower-body-a from before 0008 ran (stale/bogus data, not an
-- actual completed workout — confirmed the workout hasn't been done yet), so
-- 0008's update was skipped and the bad row survived.
--
-- This corrects that one row to what 0008 intended: upper-body-a, scheduled.
do $$
declare
  v_user_id uuid;
  v_workout_id uuid;
begin
  select id into v_user_id from auth.users where email = 'roysamrat216@gmail.com';
  if v_user_id is null then
    return;
  end if;

  select id into v_workout_id from workouts where slug = 'upper-body-a';
  if v_workout_id is null then
    return;
  end if;

  update scheduled_workouts
  set workout_id = v_workout_id, status = 'scheduled'
  where user_id = v_user_id
    and slot = 'main'
    and scheduled_date = '2026-09-15';
end $$;
