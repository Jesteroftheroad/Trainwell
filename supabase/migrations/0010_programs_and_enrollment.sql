-- Builder app, phase 1: lets a coach assemble named multi-week plans out of
-- the existing workout template catalog (programs / program_weeks /
-- program_days already existed in the schema but nothing used them), and
-- lets any signed-up user enroll in one published plan to have their
-- schedule generated from it. Composing brand-new workouts from individual
-- exercises is a later phase — for now a "day" in a plan points at one of
-- the existing `workouts` rows.

-- ---------------------------------------------------------------------------
-- 1. programs: only publish a plan when the coach is ready for clients to
--    see and pick it. Drafts stay visible only to the authoring coach.
-- ---------------------------------------------------------------------------
alter table programs add column if not exists is_published boolean not null default false;

-- ---------------------------------------------------------------------------
-- 2. program_days: prevent two workouts from being assigned to the same
--    weekday within one program week (the builder UI upserts one row per day).
-- ---------------------------------------------------------------------------
alter table program_days
  add constraint program_days_week_day_unique unique (program_week_id, day_of_week);

-- ---------------------------------------------------------------------------
-- 3. program_enrollments: which plan a client picked and when they started
--    it, so scheduled_workouts can be materialized from program_days on a
--    repeating weekly cycle. One active enrollment per user for now —
--    switching plans later replaces this row rather than keeping history.
-- ---------------------------------------------------------------------------
create table if not exists program_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references profiles (id) on delete cascade,
  program_id uuid not null references programs (id) on delete restrict,
  started_on date not null,
  created_at timestamptz not null default now()
);

create index if not exists program_enrollments_program_idx on program_enrollments (program_id);

alter table program_enrollments enable row level security;

create policy "program_enrollments_owner_all" on program_enrollments
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 4. RLS: replace the old "read-only for everyone" policies on programs /
--    program_weeks / program_days with coach-authored, client-readable ones.
--    A coach (profiles.role = 'coach') manages only their own programs;
--    everyone else can read a program (and its weeks/days) once published.
-- ---------------------------------------------------------------------------
drop policy if exists "programs_read_all" on programs;
drop policy if exists "program_weeks_read_all" on program_weeks;
drop policy if exists "program_days_read_all" on program_days;

create policy "programs_read_published_or_own" on programs
  for select using (is_published or coach_id = auth.uid());

create policy "programs_coach_insert" on programs
  for insert with check (
    coach_id = auth.uid()
    and exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'coach')
  );

create policy "programs_coach_update" on programs
  for update using (coach_id = auth.uid()) with check (coach_id = auth.uid());

create policy "programs_coach_delete" on programs
  for delete using (coach_id = auth.uid());

create policy "program_weeks_read_via_program" on program_weeks
  for select using (
    exists (
      select 1 from programs pr
      where pr.id = program_weeks.program_id
        and (pr.is_published or pr.coach_id = auth.uid())
    )
  );

create policy "program_weeks_coach_all" on program_weeks
  for all using (
    exists (select 1 from programs pr where pr.id = program_weeks.program_id and pr.coach_id = auth.uid())
  )
  with check (
    exists (select 1 from programs pr where pr.id = program_weeks.program_id and pr.coach_id = auth.uid())
  );

create policy "program_days_read_via_program" on program_days
  for select using (
    exists (
      select 1 from program_weeks pw
      join programs pr on pr.id = pw.program_id
      where pw.id = program_days.program_week_id
        and (pr.is_published or pr.coach_id = auth.uid())
    )
  );

create policy "program_days_coach_all" on program_days
  for all using (
    exists (
      select 1 from program_weeks pw
      join programs pr on pr.id = pw.program_id
      where pw.id = program_days.program_week_id and pr.coach_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from program_weeks pw
      join programs pr on pr.id = pw.program_id
      where pw.id = program_days.program_week_id and pr.coach_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- 5. New signups no longer get the old hardcoded 2-week demo rotation
--    (seed_demo_schedule) — they now pick a published plan on the /plans
--    screen right after signing up, which materializes their real schedule.
--    The welcome system message still gets seeded. This only affects users
--    created from here on; nobody's existing scheduled_workouts are touched.
-- ---------------------------------------------------------------------------
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;

  perform seed_demo_conversation(new.id);

  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- ---------------------------------------------------------------------------
-- 6. Make roysamrat216@gmail.com a coach so the builder UI is reachable.
-- ---------------------------------------------------------------------------
update profiles
set role = 'coach'
where id = (select id from auth.users where email = 'roysamrat216@gmail.com');
