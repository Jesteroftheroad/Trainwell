-- Trainwell-style fitness coaching platform — initial schema
-- Conventions:
--   * All primary keys are uuid, default gen_random_uuid()
--   * All user-owned tables have RLS enabled
--   * Workout content (exercises, workouts, sections, ...) is readable by any
--     authenticated user and writable only by coaches/admins (service role for now)

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  role text not null default 'client' check (role in ('client', 'coach', 'admin')),
  timezone text not null default 'UTC',
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  goal_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists coach_clients (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references profiles (id) on delete cascade,
  client_id uuid not null references profiles (id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'pending', 'ended')),
  created_at timestamptz not null default now(),
  unique (coach_id, client_id)
);

-- ---------------------------------------------------------------------------
-- Exercise library
-- ---------------------------------------------------------------------------
create table if not exists exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category text not null check (
    category in ('strength', 'mobility', 'warmup', 'cardio', 'stretching', 'core')
  ),
  equipment text[] not null default '{}',
  primary_muscles text[] not null default '{}',
  secondary_muscles text[] not null default '{}',
  instructions text,
  common_mistakes text,
  media_url text,
  thumbnail_url text,
  default_unit text not null default 'lb' check (
    default_unit in ('lb', 'kg', 'bodyweight', 'time', 'distance')
  ),
  created_at timestamptz not null default now()
);

create index if not exists exercises_category_idx on exercises (category);

-- ---------------------------------------------------------------------------
-- Programs (future coach-authored multi-week plans)
-- ---------------------------------------------------------------------------
create table if not exists programs (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid references profiles (id) on delete set null,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists program_weeks (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references programs (id) on delete cascade,
  week_number integer not null,
  unique (program_id, week_number)
);

-- ---------------------------------------------------------------------------
-- Workouts (templates) → sections → exercise instances → prescribed sets
-- ---------------------------------------------------------------------------
create table if not exists workouts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  workout_type text not null check (
    workout_type in ('upper_body', 'lower_body', 'full_body', 'cardio', 'core', 'mobility')
  ),
  estimated_duration_minutes integer,
  description text,
  created_by uuid references profiles (id) on delete set null,
  is_template boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists program_days (
  id uuid primary key default gen_random_uuid(),
  program_week_id uuid not null references program_weeks (id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  workout_id uuid references workouts (id) on delete set null
);

create table if not exists workout_sections (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references workouts (id) on delete cascade,
  section_type text not null check (
    section_type in ('warmup', 'set', 'superset', 'circuit', 'cardio', 'cooldown', 'stretching')
  ),
  title text not null,
  order_index integer not null,
  repeat_count integer not null default 1,
  notes text
);

create index if not exists workout_sections_workout_idx on workout_sections (workout_id, order_index);

create table if not exists workout_exercises (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references workout_sections (id) on delete cascade,
  exercise_id uuid not null references exercises (id) on delete restrict,
  order_index integer not null,
  side text not null default 'none' check (side in ('none', 'left', 'right', 'alternating')),
  tempo text,
  rest_seconds integer,
  notes text
);

create index if not exists workout_exercises_section_idx on workout_exercises (section_id, order_index);

create table if not exists exercise_sets (
  id uuid primary key default gen_random_uuid(),
  workout_exercise_id uuid not null references workout_exercises (id) on delete cascade,
  set_index integer not null,
  reps integer,
  weight numeric(6, 2),
  weight_unit text not null default 'lb' check (weight_unit in ('lb', 'kg')),
  duration_seconds integer,
  distance numeric(8, 2),
  distance_unit text check (distance_unit in ('mi', 'km', 'm', 'yd')),
  side text not null default 'none' check (side in ('none', 'left', 'right')),
  is_warmup boolean not null default false,
  notes text
);

create index if not exists exercise_sets_workout_exercise_idx on exercise_sets (workout_exercise_id, set_index);

-- ---------------------------------------------------------------------------
-- Scheduling
-- ---------------------------------------------------------------------------
create table if not exists scheduled_workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  workout_id uuid not null references workouts (id) on delete restrict,
  scheduled_date date not null,
  slot text not null default 'main' check (slot in ('main', 'extra', 'backup')),
  status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'skipped')),
  created_at timestamptz not null default now()
);

create index if not exists scheduled_workouts_user_date_idx on scheduled_workouts (user_id, scheduled_date);

-- ---------------------------------------------------------------------------
-- Live sessions + recorded performance
-- ---------------------------------------------------------------------------
create table if not exists workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  scheduled_workout_id uuid references scheduled_workouts (id) on delete set null,
  workout_id uuid not null references workouts (id) on delete restrict,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed', 'abandoned')),
  total_duration_seconds integer
);

create index if not exists workout_sessions_user_idx on workout_sessions (user_id, started_at desc);

create table if not exists completed_sets (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references workout_sessions (id) on delete cascade,
  workout_exercise_id uuid not null references workout_exercises (id) on delete cascade,
  exercise_id uuid not null references exercises (id) on delete restrict,
  set_index integer not null,
  reps integer,
  weight numeric(6, 2),
  weight_unit text check (weight_unit in ('lb', 'kg')),
  duration_seconds integer,
  distance numeric(8, 2),
  side text not null default 'none' check (side in ('none', 'left', 'right')),
  skipped boolean not null default false,
  completed_at timestamptz not null default now()
);

create index if not exists completed_sets_session_idx on completed_sets (session_id);
create index if not exists completed_sets_exercise_idx on completed_sets (exercise_id, completed_at desc);

-- ---------------------------------------------------------------------------
-- Progress
-- ---------------------------------------------------------------------------
create table if not exists progress_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  metric_type text not null check (
    metric_type in ('body_weight', 'waist', 'chest', 'hips', 'arm', 'thigh', 'body_fat_pct')
  ),
  value numeric(7, 2) not null,
  unit text not null,
  recorded_at date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists progress_metrics_user_idx on progress_metrics (user_id, metric_type, recorded_at desc);

create table if not exists progress_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  photo_url text not null,
  taken_at date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Chat
-- ---------------------------------------------------------------------------
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles (id) on delete cascade,
  coach_id uuid references profiles (id) on delete set null,
  type text not null default 'coach' check (type in ('coach', 'system')),
  created_at timestamptz not null default now(),
  unique (client_id, coach_id, type)
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations (id) on delete cascade,
  sender_id uuid references profiles (id) on delete set null,
  body text not null,
  attachment_url text,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists messages_conversation_idx on messages (conversation_id, created_at);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  type text not null,
  payload jsonb not null default '{}',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at trigger for profiles
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_set_updated_at on profiles;
create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
