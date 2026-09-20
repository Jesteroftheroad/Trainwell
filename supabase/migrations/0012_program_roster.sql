-- Builder app, phase 3: program management basics — duplicate a plan, delete
-- an exercise, and a per-plan client roster (who's enrolled/pending) with the
-- ability to revoke an unused activation code.
--
-- The roster needs two pieces of read/write access that don't exist yet:
--   1. A coach currently has no way to read program_enrollments rows at all
--      (the only policy scopes to user_id = auth.uid(), i.e. the enrolled
--      client themselves) — add a coach-read policy scoped to their own
--      programs.
--   2. Reading an enrolled client's name via `profiles` requires a
--      coach_clients row (the existing profiles_select_own_or_coach policy
--      from 0002 already grants that) — coach_clients had no insert/update
--      policy at all, so nothing could ever create one. A client can now
--      upsert their own row (client_id = auth.uid() only, so they can't
--      touch anyone else's relationships): 'pending' when they pick a plan
--      on /plans, 'active' when they redeem a code (added inside
--      redeem_activation_code, which is SECURITY DEFINER and so doesn't need
--      its own RLS grant).

create policy "program_enrollments_coach_read" on program_enrollments
  for select using (
    exists (select 1 from programs pr where pr.id = program_enrollments.program_id and pr.coach_id = auth.uid())
  );

create policy "coach_clients_client_insert" on coach_clients
  for insert with check (client_id = auth.uid());

create policy "coach_clients_client_update" on coach_clients
  for update using (client_id = auth.uid()) with check (client_id = auth.uid());

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

  insert into coach_clients (coach_id, client_id, status)
  values (v_code.coach_id, v_user_id, 'active')
  on conflict (coach_id, client_id) do update set status = 'active';

  return jsonb_build_object('ok', true, 'program_id', v_code.program_id);
end;
$$;
