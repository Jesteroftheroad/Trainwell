"use server";

import { createClient } from "@/lib/supabase/server";
import type { Side, WeightUnit } from "@/lib/supabase/database.types";
import { revalidatePath } from "next/cache";
import { getExerciseHistory } from "./queries";
import { getTodayIsoInTimezone, toIsoDate } from "@/lib/date";

export interface ExerciseHistoryEntry {
  id: string;
  completedAt: string;
  reps: number | null;
  weight: number | null;
  weightUnit: string | null;
  durationSeconds: number | null;
  side: string;
  isPersonalRecord: boolean;
}

export async function fetchExerciseHistory(exerciseId: string): Promise<ExerciseHistoryEntry[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const rows = await getExerciseHistory(user.id, exerciseId);
  return rows.map((r) => ({
    id: r.id,
    completedAt: r.completed_at,
    reps: r.reps,
    weight: r.weight,
    weightUnit: r.weight_unit,
    durationSeconds: r.duration_seconds,
    side: r.side,
    isPersonalRecord: r.is_personal_record,
  }));
}

export interface StartSessionInput {
  workoutId: string;
  scheduledWorkoutId?: string;
}

export async function startWorkoutSession({
  workoutId,
  scheduledWorkoutId,
}: StartSessionInput): Promise<{ sessionId: string } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  // Resume an in-progress session for the same workout instead of duplicating it.
  const { data: existing } = await supabase
    .from("workout_sessions")
    .select("id")
    .eq("user_id", user.id)
    .eq("workout_id", workoutId)
    .eq("status", "in_progress")
    .maybeSingle();

  if (existing) return { sessionId: existing.id };

  const { data, error } = await supabase
    .from("workout_sessions")
    .insert({
      user_id: user.id,
      workout_id: workoutId,
      scheduled_workout_id: scheduledWorkoutId ?? null,
      status: "in_progress",
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "Could not start workout." };
  return { sessionId: data.id };
}

export interface RecordSetInput {
  sessionId: string;
  workoutExerciseId: string;
  exerciseId: string;
  setIndex: number;
  reps?: number | null;
  weight?: number | null;
  weightUnit?: WeightUnit | null;
  durationSeconds?: number | null;
  distance?: number | null;
  side?: Side;
  skipped?: boolean;
}

function estimatedOneRepMax(weight: number, reps: number): number {
  return weight * (1 + reps / 30);
}

/**
 * A set is a PR if it beats every prior completed set for this exercise on
 * the metric that actually applies to it: estimated 1RM when both weight and
 * reps are logged (so "more reps at a lower weight" isn't a false PR), max
 * reps for bodyweight work, or longest hold for timed sets.
 */
async function isNewPersonalRecord(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  input: RecordSetInput,
): Promise<boolean> {
  if (input.skipped) return false;

  const { data: priorSets } = await supabase
    .from("completed_sets")
    .select("reps, weight, duration_seconds, session_id, workout_exercise_id, set_index, workout_sessions!inner(user_id)")
    .eq("exercise_id", input.exerciseId)
    .eq("workout_sessions.user_id", userId)
    .eq("skipped", false);

  if (!priorSets) return false;

  const priorOthers = priorSets.filter(
    (s) =>
      !(
        s.session_id === input.sessionId &&
        s.workout_exercise_id === input.workoutExerciseId &&
        s.set_index === input.setIndex
      ),
  );

  if (priorOthers.length === 0) return false;

  if (input.durationSeconds != null) {
    const bestDuration = Math.max(0, ...priorOthers.map((s) => s.duration_seconds ?? 0));
    return input.durationSeconds > bestDuration;
  }

  if (input.weight != null && input.reps != null) {
    const bestOneRm = Math.max(
      0,
      ...priorOthers
        .filter((s) => s.weight != null && s.reps != null)
        .map((s) => estimatedOneRepMax(s.weight as number, s.reps as number)),
    );
    return estimatedOneRepMax(input.weight, input.reps) > bestOneRm;
  }

  if (input.reps != null) {
    const bestReps = Math.max(0, ...priorOthers.map((s) => s.reps ?? 0));
    return input.reps > bestReps;
  }

  return false;
}

export async function recordCompletedSet(
  input: RecordSetInput,
): Promise<{ ok: true; isPersonalRecord: boolean } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const isPersonalRecord = await isNewPersonalRecord(supabase, user.id, input);

  const { error } = await supabase.from("completed_sets").upsert(
    {
      session_id: input.sessionId,
      workout_exercise_id: input.workoutExerciseId,
      exercise_id: input.exerciseId,
      set_index: input.setIndex,
      reps: input.reps ?? null,
      weight: input.weight ?? null,
      weight_unit: input.weightUnit ?? null,
      duration_seconds: input.durationSeconds ?? null,
      distance: input.distance ?? null,
      side: input.side ?? "none",
      skipped: input.skipped ?? false,
      is_personal_record: isPersonalRecord,
      completed_at: new Date().toISOString(),
    },
    { onConflict: "session_id,workout_exercise_id,set_index" },
  );

  if (error) return { error: error.message };
  return { ok: true, isPersonalRecord };
}

/**
 * The streak is anchored to a start date rather than fully recomputed from
 * scratch each time. That lets a manually-set starting streak (e.g. "I'm
 * continuing a 100-day streak from before I switched apps") persist across
 * future workouts instead of being silently overwritten back down to only
 * what this app can itself prove — the anchor only moves forward when an
 * actual gap (a missed day, checked against this app's own history from the
 * anchor date onward) is detected.
 */
async function recalculateStreak(userId: string, timezone: string): Promise<void> {
  const supabase = await createClient();
  const { data: sessions } = await supabase
    .from("workout_sessions")
    .select("completed_at")
    .eq("user_id", userId)
    .eq("status", "completed")
    .order("completed_at", { ascending: false });

  if (!sessions) return;

  // Bucket each completion into the user's local calendar day, not the
  // server's (UTC on Vercel) — otherwise a late-evening workout can land on
  // the "wrong" day and break the streak.
  const dayFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: timezone });
  const completedDays = new Set(
    sessions
      .filter((s) => s.completed_at)
      .map((s) => dayFormatter.format(new Date(s.completed_at as string))),
  );

  const todayIso = getTodayIsoInTimezone(timezone);
  const [year, month, day] = todayIso.split("-").map(Number);
  const yesterday = new Date(year, month - 1, day);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayIso = toIsoDate(yesterday);

  const { data: profile } = await supabase
    .from("profiles")
    .select("longest_streak, streak_anchor_date")
    .eq("id", userId)
    .maybeSingle();

  let anchorIso = profile?.streak_anchor_date;

  // This function only runs right after marking today's session complete, so
  // today is always in completedDays here. The streak continues if there was
  // also a completion yesterday, or if yesterday predates the anchor (nothing
  // to check that far back — grandfathered in); otherwise a real gap broke
  // it and the streak restarts today.
  const continuing = anchorIso != null && (completedDays.has(yesterdayIso) || yesterdayIso < anchorIso);

  if (!continuing) {
    anchorIso = todayIso;
  }

  const [aYear, aMonth, aDay] = (anchorIso as string).split("-").map(Number);
  const anchorDate = new Date(aYear, aMonth - 1, aDay);
  const todayDate = new Date(year, month - 1, day);
  const streak = Math.round((todayDate.getTime() - anchorDate.getTime()) / 86_400_000) + 1;

  await supabase
    .from("profiles")
    .update({
      current_streak: streak,
      longest_streak: Math.max(streak, profile?.longest_streak ?? 0),
      streak_anchor_date: anchorIso,
    })
    .eq("id", userId);
}

export async function completeWorkoutSession(
  sessionId: string,
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { data: session, error: fetchError } = await supabase
    .from("workout_sessions")
    .select("started_at, scheduled_workout_id")
    .eq("id", sessionId)
    .maybeSingle();

  if (fetchError || !session) return { error: fetchError?.message ?? "Session not found." };

  const startedAt = new Date(session.started_at);
  const totalDurationSeconds = Math.max(0, Math.round((Date.now() - startedAt.getTime()) / 1000));

  const { error } = await supabase
    .from("workout_sessions")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      total_duration_seconds: totalDurationSeconds,
    })
    .eq("id", sessionId);

  if (error) return { error: error.message };

  if (session.scheduled_workout_id) {
    await supabase
      .from("scheduled_workouts")
      .update({ status: "completed" })
      .eq("id", session.scheduled_workout_id);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("timezone")
    .eq("id", user.id)
    .maybeSingle();

  await recalculateStreak(user.id, profile?.timezone ?? "UTC");

  revalidatePath("/today");
  revalidatePath("/workouts");
  revalidatePath("/progress");

  return { ok: true };
}

export async function abandonWorkoutSession(sessionId: string): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("workout_sessions")
    .update({ status: "abandoned", completed_at: new Date().toISOString() })
    .eq("id", sessionId)
    .eq("status", "in_progress");

  if (error) return { error: error.message };
  revalidatePath("/today");
  return { ok: true };
}

const MAX_FREE_DAY_SEARCH_DAYS = 60;

export async function moveWorkoutToNextFreeDay(
  scheduledWorkoutId: string,
): Promise<{ ok: true; movedToIso: string } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { data: row, error: fetchError } = await supabase
    .from("scheduled_workouts")
    .select("id, user_id, scheduled_date, slot, status")
    .eq("id", scheduledWorkoutId)
    .maybeSingle();

  if (fetchError || !row) return { error: fetchError?.message ?? "Workout not found." };
  if (row.user_id !== user.id) return { error: "Not your workout." };
  if (row.status !== "scheduled") return { error: "Only upcoming workouts can be moved." };

  const { data: busyRows } = await supabase
    .from("scheduled_workouts")
    .select("scheduled_date")
    .eq("user_id", user.id)
    .eq("slot", row.slot);

  const busyDates = new Set((busyRows ?? []).map((r) => r.scheduled_date));

  const [year, month, day] = row.scheduled_date.split("-").map(Number);
  const cursor = new Date(year, month - 1, day);

  let targetIso: string | null = null;
  for (let i = 1; i <= MAX_FREE_DAY_SEARCH_DAYS; i++) {
    cursor.setDate(cursor.getDate() + 1);
    const candidate = toIsoDate(cursor);
    if (!busyDates.has(candidate)) {
      targetIso = candidate;
      break;
    }
  }

  if (!targetIso) return { error: "No free day found in the next two months." };

  const { error } = await supabase
    .from("scheduled_workouts")
    .update({ scheduled_date: targetIso })
    .eq("id", row.id);

  if (error) return { error: error.message };

  revalidatePath("/today");
  revalidatePath("/workouts");
  revalidatePath(`/workouts/${scheduledWorkoutId}`);

  return { ok: true, movedToIso: targetIso };
}
