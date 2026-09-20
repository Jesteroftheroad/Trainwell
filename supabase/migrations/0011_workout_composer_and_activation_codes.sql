-- Builder app, phase 2: lets a coach maintain the exercise library and
-- compose brand-new workouts (sections -> exercises -> sets, with rest time)
-- from scratch, instead of only assigning the pre-seeded templates to a
-- program's days. Also adds activation codes: a client now picks a plan
-- without their schedule populating immediately — the coach hands them a
-- code afterward (e.g. once they've paid), and redeeming it is what
-- activates the enrollment and materializes 3 months of scheduled_workouts.

-- ---------------------------------------------------------------------------
-- 1. Exercise library: any coach can add/edit any exercise. There's exactly
--    one coach today; a per-coach "owns this exercise" model would just be
--    friction for no benefit yet, so the library stays a single shared pool.
-- ---------------------------------------------------------------------------
create policy "exercises_coach_insert" on exercises
  for insert with check (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'coach')
  );

create policy "exercises_coach_update" on exercises
  for update using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'coach')
  )
  with check (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'coach')
  );

-- ---------------------------------------------------------------------------
-- 2. Workout composer: a coach can create/edit/delete workouts they created
--    (workouts.created_by), and their sections/exercises/sets by extension.
--    The pre-seeded templates (created_by is null) stay read-only to
--    everyone, same as before — nothing here changes their visibility.
-- ---------------------------------------------------------------------------
create policy "workouts_coach_insert" on workouts
  for insert with check (
    created_by = auth.uid()
    and exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'coach')
  );

create policy "workouts_coach_update" on workouts
  for update using (created_by = auth.uid()) with check (created_by = auth.uid());

create policy "workouts_coach_delete" on workouts
  for delete using (created_by = auth.uid());

create policy "workout_sections_coach_all" on workout_sections
  for all using (
    exists (select 1 from workouts w where w.id = workout_sections.workout_id and w.created_by = auth.uid())
  )
  with check (
    exists (select 1 from workouts w where w.id = workout_sections.workout_id and w.created_by = auth.uid())
  );

create policy "workout_exercises_coach_all" on workout_exercises
  for all using (
    exists (
      select 1 from workout_sections ws
      join workouts w on w.id = ws.workout_id
      where ws.id = workout_exercises.section_id and w.created_by = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from workout_sections ws
      join workouts w on w.id = ws.workout_id
      where ws.id = workout_exercises.section_id and w.created_by = auth.uid()
    )
  );

create policy "exercise_sets_coach_all" on exercise_sets
  for all using (
    exists (
      select 1 from workout_exercises we
      join workout_sections ws on ws.id = we.section_id
      join workouts w on w.id = ws.workout_id
      where we.id = exercise_sets.workout_exercise_id and w.created_by = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from workout_exercises we
      join workout_sections ws on ws.id = we.section_id
      join workouts w on w.id = ws.workout_id
      where we.id = exercise_sets.workout_exercise_id and w.created_by = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- 3. program_enrollments gains a pending/active split: picking a plan on
--    /plans now only records intent (status = 'pending'); nothing is
--    scheduled until an activation code is redeemed.
-- ---------------------------------------------------------------------------
alter table program_enrollments
  add column if not exists status text not null default 'active' check (status in ('pending', 'active')),
  add column if not exists activated_at timestamptz;

-- Existing rows (from before this column existed) already had their
-- schedule materialized — leave them as the 'active' default.

-- ---------------------------------------------------------------------------
-- 4. Activation codes: a coach generates one (optionally tied to a specific
--    program) and hands it to a client outside the app. Redeeming looks the
--    code up and activates the enrollment via a SECURITY DEFINER function,
--    the same pattern this schema already uses (seed_demo_schedule, etc.)
--    for controlled cross-row writes a plain RLS policy can't express —
--    a client needs to find one specific code by its value without being
--    able to list or browse every code in the table.
-- ---------------------------------------------------------------------------
create table if not exists activation_codes (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references profiles (id) on delete cascade,
  program_id uuid references programs (id) on delete set null,
  code text not null unique,
  redeemed_by uuid references profiles (id) on delete set null,
  redeemed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists activation_codes_coach_idx on activation_codes (coach_id);

alter table activation_codes enable row level security;

create policy "activation_codes_coach_all" on activation_codes
  for all using (coach_id = auth.uid()) with check (coach_id = auth.uid());

create or replace function redeem_activation_code(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code activation_codes%rowtype;
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    return jsonb_build_object('error', 'Not signed in.');
  end if;

  select * into v_code from activation_codes where code = upper(trim(p_code)) for update;

  if v_code.id is null then
    return jsonb_build_object('error', 'That code doesn''t look right.');
  end if;

  if v_code.redeemed_by is not null then
    return jsonb_build_object('error', 'This code has already been used.');
  end if;

  if v_code.program_id is null then
    return jsonb_build_object('error', 'This code isn''t linked to a plan yet.');
  end if;

  update activation_codes set redeemed_by = v_user_id, redeemed_at = now() where id = v_code.id;

  insert into program_enrollments (user_id, program_id, started_on, status, activated_at)
  values (v_user_id, v_code.program_id, current_date, 'active', now())
  on conflict (user_id) do update
    set program_id = excluded.program_id,
        started_on = excluded.started_on,
        status = 'active',
        activated_at = now();

  return jsonb_build_object('ok', true, 'program_id', v_code.program_id);
end;
$$;

grant execute on function redeem_activation_code(text) to authenticated;
