"use server";

import { createClient } from "@/lib/supabase/server";
import type { Side, WeightUnit } from "@/lib/supabase/database.types";
import { revalidatePath } from "next/cache";
import { getExerciseHistory } from "./queries";
import { getTodayIsoInTimezone, toIsoDate } from "@/lib/date";
import { estimateCaloriesBurned, lbToKg } from "./calories";

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
 * scratch each time, so a manually-set starting streak (e.g. "I'm continuing
 * a 100-day streak from before I switched apps") persists across future
 * workouts. `streak_last_confirmed_date` tracks the last day actually known
 * to be unbroken — real (this app has a completed session for it) or
 * grandfathered (it's the first check-in after a manual claim, so there's
 * nothing to verify before it). The anchor only resets when a day strictly
 * between the last confirmed date and today has no completed session.
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("longest_streak, streak_anchor_date, streak_last_confirmed_date")
    .eq("id", userId)
    .maybeSingle();

  let anchorIso = profile?.streak_anchor_date ?? null;
  const lastConfirmedIso = profile?.streak_last_confirmed_date ?? null;

  // This function only runs right after marking today's session complete, so
  // today always belongs to the streak. Confirm every day is checked instead
  // of only "yesterday", so multi-day gaps aren't missed.
  const brokenByGap =
    lastConfirmedIso != null && dayHasGapBefore(lastConfirmedIso, todayIso, completedDays);

  if (anchorIso == null || brokenByGap) {
    anchorIso = todayIso;
  }

  const [aYear, aMonth, aDay] = anchorIso.split("-").map(Number);
  const [tYear, tMonth, tDay] = todayIso.split("-").map(Number);
  const anchorDate = new Date(aYear, aMonth - 1, aDay);
  const todayDate = new Date(tYear, tMonth - 1, tDay);
  const streak = Math.round((todayDate.getTime() - anchorDate.getTime()) / 86_400_000) + 1;

  await supabase
    .from("profiles")
    .update({
      current_streak: streak,
      longest_streak: Math.max(streak, profile?.longest_streak ?? 0),
      streak_anchor_date: anchorIso,
      streak_last_confirmed_date: todayIso,
    })
    .eq("id", userId);
}

/** True if any day strictly between `fromIso` (exclusive) and `toIso` (exclusive) has no completed session. */
function dayHasGapBefore(fromIso: string, toIso: string, completedDays: Set<string>): boolean {
  const [fYear, fMonth, fDay] = fromIso.split("-").map(Number);
  const cursor = new Date(fYear, fMonth - 1, fDay);
  cursor.setDate(cursor.getDate() + 1);

  while (toIsoDate(cursor) < toIso) {
    if (!completedDays.has(toIsoDate(cursor))) return true;
    cursor.setDate(cursor.getDate() + 1);
  }

  return false;
}

export interface WorkoutSessionSummary {
  durationMinutes: number;
  caloriesEstimate: number;
}

export async function completeWorkoutSession(
  sessionId: string,
): Promise<({ ok: true } & WorkoutSessionSummary) | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { data: session, error: fetchError } = await supabase
    .from("workout_sessions")
    .select("started_at, scheduled_workout_id, workouts(workout_type)")
    .eq("id", sessionId)
    .maybeSingle();

  if (fetchError || !session) return { error: fetchError?.message ?? "Session not found." };

  const startedAt = new Date(session.started_at);
  const totalDurationSeconds = Math.max(0, Math.round((Date.now() - startedAt.getTime()) / 1000));
  const durationMinutes = Math.max(1, Math.round(totalDurationSeconds / 60));

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

  const [{ data: profile }, { data: latestWeight }] = await Promise.all([
    supabase.from("profiles").select("timezone").eq("id", user.id).maybeSingle(),
    supabase
      .from("progress_metrics")
      .select("value, unit")
      .eq("user_id", user.id)
      .eq("metric_type", "body_weight")
      .order("recorded_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  await recalculateStreak(user.id, profile?.timezone ?? "UTC");

  revalidatePath("/today");
  revalidatePath("/workouts");
  revalidatePath("/progress");

  const bodyWeightKg = latestWeight
    ? latestWeight.unit === "kg"
      ? latestWeight.value
      : lbToKg(latestWeight.value)
    : null;

  const caloriesEstimate = estimateCaloriesBurned(
    session.workouts?.workout_type ?? "full_body",
    durationMinutes,
    bodyWeightKg,
  );

  return { ok: true, durationMinutes, caloriesEstimate };
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

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function rescheduleWorkout(
  scheduledWorkoutId: string,
  targetDateIso: string,
): Promise<{ ok: true; swappedWith?: string } | { error: string }> {
  if (!ISO_DATE_RE.test(targetDateIso)) return { error: "Invalid date." };

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
  if (targetDateIso === row.scheduled_date) return { ok: true };

  // If something's already scheduled in this slot on the target date, swap
  // the two dates instead of silently overwriting it.
  const { data: conflict } = await supabase
    .from("scheduled_workouts")
    .select("id, workouts(name)")
    .eq("user_id", user.id)
    .eq("slot", row.slot)
    .eq("scheduled_date", targetDateIso)
    .neq("id", row.id)
    .maybeSingle();

  if (conflict) {
    const { error: swapError } = await supabase
      .from("scheduled_workouts")
      .update({ scheduled_date: row.scheduled_date })
      .eq("id", conflict.id);
    if (swapError) return { error: swapError.message };
  }

  const { error } = await supabase
    .from("scheduled_workouts")
    .update({ scheduled_date: targetDateIso })
    .eq("id", row.id);

  if (error) return { error: error.message };

  revalidatePath("/today");
  revalidatePath("/workouts");
  revalidatePath(`/workouts/${scheduledWorkoutId}`);

  return { ok: true, swappedWith: conflict?.workouts?.name };
}
