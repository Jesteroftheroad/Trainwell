# Ascend

A mobile-first fitness coaching web app / PWA: structured workout programs, a
set-by-set workout player, progress tracking, and a basic coaching chat.
Built with Next.js (App Router), TypeScript, Tailwind, and Supabase.

This is a foundation for a future multi-user commercial coaching platform —
the schema and data layer are designed with coach/client relationships,
programs, and scheduling in mind, even though the coach-facing UI isn't built
yet (see [Roadmap](#roadmap)).

## Stack

- **Frontend**: Next.js 16 (App Router, Turbopack), TypeScript (strict), React 19, Tailwind CSS v4
- **Backend**: Supabase (Postgres, Auth, Row Level Security)
- **Charts**: Recharts
- **Icons**: lucide-react

## Getting started

### 1. Create a Supabase project

Create a project at [supabase.com](https://supabase.com) (or run one locally
with the Supabase CLI). You'll need the project URL and anon key from
Settings → API.

### 2. Run the database migrations

In the Supabase SQL editor (or via `supabase db push` / `psql`), run the
files in `supabase/migrations/` **in order**:

```
0001_init_schema.sql       — tables
0002_rls_policies.sql      — row level security policies
0003_demo_seeding.sql      — auto-schedules a demo program for new signups
0004_add_constraints.sql   — supporting unique index
```

### 3. Seed the exercise library and workout templates

Run `supabase/seed.sql`. This seeds ~60 exercises and the five workout
templates (Upper Body A/B, Lower Body A/B, Cardio A) described in the product
spec, as ordered sections → exercises → prescribed sets — never as a JSON
blob; everything is normalized relational data.

**Run the migrations and the seed before anyone signs up.** When a new user
signs up, a database trigger (`handle_new_user`) automatically schedules a
two-week rotation of the seeded workouts for them (skipping weekends) and
creates a welcome message — this is what makes "Today" and "Chat" populated
immediately for a new account. If the seed hasn't run yet, the trigger finds
no workouts and the user just gets an empty schedule (harmless, but re-run
`seed_demo_schedule('<user-id>')` manually afterwards if that happens).

### 4. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### 5. Install and run

```bash
npm install
npm run dev
```

Visit `/signup` to create an account — you'll land on `/today` with a live,
database-backed two-week workout schedule.

## Project structure

```
src/app/
  (auth)/login, (auth)/signup        — unauthenticated routes
  (app)/today, workouts, progress,   — authenticated routes, shared
       chat, workouts/[id]             sidebar/bottom-nav layout
  session/[sessionId]                — full-screen workout player (no nav chrome)

src/components/
  ui/            — small design-system primitives (button, card, tabs, dialog, ...)
  nav/           — bottom nav (mobile) + sidebar (desktop)
  today/ workout/ progress/ chat/   — feature UI, one concern per file

src/lib/
  supabase/      — typed client (browser + server) and the hand-written Database type
  workout/       — domain types, data queries, server actions, formatting helpers
  progress/ chat/ profile/          — same pattern: queries.ts (reads) + actions.ts (writes)

supabase/
  migrations/    — schema + RLS, applied in order
  seed.sql       — exercise library + workout templates
```

Reads (`queries.ts`, marked `server-only`) and writes (`actions.ts`, marked
`"use server"`) are kept in separate files per feature area so server/client
boundaries stay explicit. Client components that need a mutation import the
server action directly; components that need read access to something not
already passed down as a prop call a thin server action wrapper (e.g.
exercise history, strength progression) rather than talking to Supabase from
the browser.

## Data model

A workout is not a flat exercise list — it's ordered sections
(`warmup` / `set` / `superset` / `circuit` / `cardio` / `cooldown` /
`stretching`), each with one or more exercise instances, each with one or
more prescribed sets (reps, weight, duration, distance, side, rest). See
`supabase/migrations/0001_init_schema.sql` for the full relational schema:

```
workouts → workout_sections → workout_exercises → exercise_sets
scheduled_workouts → workouts
workout_sessions → scheduled_workouts, → completed_sets → exercises
```

Completing a workout writes real rows to `completed_sets` and
`workout_sessions`; Progress, workout history, and the exercise detail
modal's "your last sets" are all computed from that data, not hardcoded.

## What's implemented

- Auth (Supabase email/password), protected routes via `src/proxy.ts`
- Today: streak, editable goal, weekly day selector, today's workout
- Workouts: Upcoming / Extras / Backups / Completed tabs, grouped by date
- Workout Preview: sections, supersets/circuits with repeat counts, exercise
  detail modal (instructions, muscles, your last sets)
- Workout Player: one set at a time, adjustable reps/weight, rest timer,
  countdown timer for timed/stretch sets, skip/back, resumable if you close
  the tab (progress is read back from the DB, not just local state)
- Progress: consistency stats, strength progression chart with estimated 1RM,
  body-metric logging + chart
- Chat: conversation list + thread, a system welcome message seeded per user
- Basic PWA: manifest, service worker caching the app shell

## What's intentionally not built yet

- Coach/admin dashboard (schema supports it — `coach_clients`/`programs`
  tables — but there's no UI to author or assign programs yet)
- Full offline set-completion + background sync (the service worker caches
  the shell and falls back to it when offline; it does not yet queue set
  completions made while offline)
- Progress photos, message attachments
- Original exercise photography/video — exercise rows have `media_url` /
  `thumbnail_url` columns ready to populate; the UI falls back to a generic
  icon until real media is produced

## Roadmap

The schema already has room for `programs`, `program_weeks`, `program_days`,
and `coach_clients` so a future coach dashboard can author programs and
assign/schedule them per client without a schema migration.
