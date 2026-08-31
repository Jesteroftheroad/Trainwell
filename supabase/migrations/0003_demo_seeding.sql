-- Demo auto-scheduling: as soon as a new user signs up, give them a live
-- two-week rotation of the seeded workout templates plus a welcome message,
-- so "Today" and "Chat" are populated with real DB-backed data immediately —
-- there is no coach dashboard yet to assign a program by hand.
--
-- IMPORTANT: run supabase/seed.sql (workout templates) before any user signs
-- up, otherwise this trigger silently finds no workouts to schedule.

create or replace function seed_demo_schedule(p_user_id uuid)
returns void as $$
declare
  v_cycle text[] := array['upper-body-a', 'lower-body-a', 'cardio-a', 'upper-body-b', 'lower-body-b'];
  v_weekday_count integer := 0;
  v_day date;
  v_dow integer;
  i integer;
begin
  -- Skip if this user already has a schedule (idempotent / re-runnable).
  if exists (select 1 from scheduled_workouts where user_id = p_user_id) then
    return;
  end if;

  for i in 0..13 loop
    v_day := current_date + i;
    v_dow := extract(dow from v_day); -- 0 = Sunday, 6 = Saturday

    if v_dow = 0 or v_dow = 6 then
      continue; -- rest on weekends
    end if;

    insert into scheduled_workouts (user_id, workout_id, scheduled_date, slot, status)
    select p_user_id, w.id, v_day, 'main', 'scheduled'
    from workouts w
    where w.slug = v_cycle[(v_weekday_count % array_length(v_cycle, 1)) + 1];

    v_weekday_count := v_weekday_count + 1;
  end loop;

  -- A couple of optional/backup slots so the Extras and Backups tabs aren't empty.
  insert into scheduled_workouts (user_id, workout_id, scheduled_date, slot, status)
  select p_user_id, w.id, current_date, 'extra', 'scheduled'
  from workouts w where w.slug = 'cardio-a';

  insert into scheduled_workouts (user_id, workout_id, scheduled_date, slot, status)
  select p_user_id, w.id, current_date + 1, 'backup', 'scheduled'
  from workouts w where w.slug = 'lower-body-b';
end;
$$ language plpgsql security definer set search_path = public;

create or replace function seed_demo_conversation(p_user_id uuid)
returns void as $$
declare
  v_conversation_id uuid;
begin
  if exists (select 1 from conversations where client_id = p_user_id and type = 'system') then
    return;
  end if;

  insert into conversations (client_id, coach_id, type)
  values (p_user_id, null, 'system')
  returning id into v_conversation_id;

  insert into messages (conversation_id, sender_id, body)
  values (
    v_conversation_id,
    null,
    'Welcome! Your first two weeks are on the schedule under Today and Workouts. Complete a set during a session and it will show up here in Progress.'
  );
end;
$$ language plpgsql security definer set search_path = public;

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;

  perform seed_demo_schedule(new.id);
  perform seed_demo_conversation(new.id);

  return new;
end;
$$ language plpgsql security definer set search_path = public;
