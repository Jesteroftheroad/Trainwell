-- Fixes a real bug in the streak-anchor design from migration 0005: once an
-- anchor was set further back than "yesterday", the very next real workout
-- found no session recorded for "yesterday" (there isn't one — those days
-- were claimed, not tracked) and reset the streak back to 1. This adds a
-- second column that tracks the last date actually confirmed unbroken (real
-- or grandfathered-on-first-check-in) instead of re-deriving purely from
-- anchor-vs-yesterday every time.

alter table profiles add column if not exists streak_last_confirmed_date date;

-- Push notification subscriptions (Web Push / VAPID), one per browser/device
-- the user has enabled reminders on.
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create index if not exists push_subscriptions_user_idx on push_subscriptions (user_id);

alter table push_subscriptions enable row level security;

create policy "push_subscriptions_owner_all" on push_subscriptions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- One-time re-fix for the streak that just got reset by the bug above.
-- EDIT THE EMAIL AND STARTING COUNT BELOW IF THEY'VE CHANGED, then run this
-- block once. It sets the anchor so today counts as day N of the streak, and
-- marks today as already-confirmed so tomorrow's workout continues normally
-- instead of re-triggering the same reset.
-- ---------------------------------------------------------------------------
do $$
declare
  v_user_id uuid;
  v_streak_length int := 101; -- total streak length as of today, inclusive
begin
  select id into v_user_id from auth.users where email = 'roysamrat216@gmail.com';

  if v_user_id is not null then
    update profiles
    set streak_anchor_date = current_date - (v_streak_length - 1),
        streak_last_confirmed_date = current_date,
        current_streak = v_streak_length,
        longest_streak = greatest(longest_streak, v_streak_length)
    where id = v_user_id;
  end if;
end $$;
