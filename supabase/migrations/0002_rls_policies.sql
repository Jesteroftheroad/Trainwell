-- Row Level Security
-- Content tables (exercises, workouts, sections, exercises-in-workout, sets,
-- programs) are readable by any signed-in user and are otherwise only
-- mutated by the service role (coach/admin tooling lands in a later phase).
-- User-owned tables restrict all access to the owning user.

alter table profiles enable row level security;
alter table coach_clients enable row level security;
alter table exercises enable row level security;
alter table programs enable row level security;
alter table program_weeks enable row level security;
alter table program_days enable row level security;
alter table workouts enable row level security;
alter table workout_sections enable row level security;
alter table workout_exercises enable row level security;
alter table exercise_sets enable row level security;
alter table scheduled_workouts enable row level security;
alter table workout_sessions enable row level security;
alter table completed_sets enable row level security;
alter table progress_metrics enable row level security;
alter table progress_photos enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table notifications enable row level security;

-- profiles ------------------------------------------------------------------
create policy "profiles_select_own_or_coach" on profiles
  for select using (
    id = auth.uid()
    or exists (
      select 1 from coach_clients cc
      where cc.client_id = profiles.id and cc.coach_id = auth.uid()
    )
  );

create policy "profiles_update_own" on profiles
  for update using (id = auth.uid());

create policy "profiles_insert_own" on profiles
  for insert with check (id = auth.uid());

-- coach_clients ---------------------------------------------------------------
create policy "coach_clients_select_participant" on coach_clients
  for select using (coach_id = auth.uid() or client_id = auth.uid());

-- content: readable by any authenticated user --------------------------------
create policy "exercises_read_all" on exercises
  for select to authenticated using (true);

create policy "programs_read_all" on programs
  for select to authenticated using (true);

create policy "program_weeks_read_all" on program_weeks
  for select to authenticated using (true);

create policy "program_days_read_all" on program_days
  for select to authenticated using (true);

create policy "workouts_read_all" on workouts
  for select to authenticated using (true);

create policy "workout_sections_read_all" on workout_sections
  for select to authenticated using (true);

create policy "workout_exercises_read_all" on workout_exercises
  for select to authenticated using (true);

create policy "exercise_sets_read_all" on exercise_sets
  for select to authenticated using (true);

-- scheduled_workouts ----------------------------------------------------------
create policy "scheduled_workouts_owner_select" on scheduled_workouts
  for select using (user_id = auth.uid());

create policy "scheduled_workouts_owner_update" on scheduled_workouts
  for update using (user_id = auth.uid());

create policy "scheduled_workouts_owner_insert" on scheduled_workouts
  for insert with check (user_id = auth.uid());

-- workout_sessions --------------------------------------------------------------
create policy "workout_sessions_owner_all" on workout_sessions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- completed_sets: ownership derived through the parent session -------------
create policy "completed_sets_owner_select" on completed_sets
  for select using (
    exists (
      select 1 from workout_sessions ws
      where ws.id = completed_sets.session_id and ws.user_id = auth.uid()
    )
  );

create policy "completed_sets_owner_insert" on completed_sets
  for insert with check (
    exists (
      select 1 from workout_sessions ws
      where ws.id = completed_sets.session_id and ws.user_id = auth.uid()
    )
  );

create policy "completed_sets_owner_update" on completed_sets
  for update using (
    exists (
      select 1 from workout_sessions ws
      where ws.id = completed_sets.session_id and ws.user_id = auth.uid()
    )
  );

-- progress_metrics / progress_photos ------------------------------------------
create policy "progress_metrics_owner_all" on progress_metrics
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "progress_photos_owner_all" on progress_photos
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- conversations / messages ----------------------------------------------------
create policy "conversations_participant_select" on conversations
  for select using (client_id = auth.uid() or coach_id = auth.uid());

create policy "conversations_participant_insert" on conversations
  for insert with check (client_id = auth.uid() or coach_id = auth.uid());

create policy "messages_participant_select" on messages
  for select using (
    exists (
      select 1 from conversations c
      where c.id = messages.conversation_id
        and (c.client_id = auth.uid() or c.coach_id = auth.uid())
    )
  );

create policy "messages_participant_insert" on messages
  for insert with check (
    sender_id = auth.uid()
    and exists (
      select 1 from conversations c
      where c.id = messages.conversation_id
        and (c.client_id = auth.uid() or c.coach_id = auth.uid())
    )
  );

-- notifications -----------------------------------------------------------------
create policy "notifications_owner_all" on notifications
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
