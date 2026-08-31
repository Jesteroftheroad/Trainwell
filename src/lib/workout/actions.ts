"use server";

import { createClient } from "@/lib/supabase/server";
import type { Side, WeightUnit } from "@/lib/supabase/database.types";
import { revalidatePath } from "next/cache";
import { getExerciseHistory } from "./queries";

export interface ExerciseHistoryEntry {
  id: string;
  completedAt: string;
  reps: number | null;
  weight: number | null;
  weightUnit: string | null;
  durationSeconds: number | null;
  side: string;
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

export async function recordCompletedSet(input: RecordSetInput): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

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
      completed_at: new Date().toISOString(),
    },
    { onConflict: "session_id,workout_exercise_id,set_index" },
  );

  if (error) return { error: error.message };
  return { ok: true };
}

async function recalculateStreak(userId: string): Promise<void> {
  const supabase = await createClient();
  const { data: sessions } = await supabase
    .from("workout_sessions")
    .select("completed_at")
    .eq("user_id", userId)
    .eq("status", "completed")
    .order("completed_at", { ascending: false });

  if (!sessions) return;

  const completedDays = new Set(
    sessions.filter((s) => s.completed_at).map((s) => (s.completed_at as string).slice(0, 10)),
  );

  let streak = 0;
  const cursor = new Date();
  // Today may not have a completed session yet if this runs mid-day before
  // finishing a workout; only start counting from today if it's present,
  // otherwise start from yesterday so an already-open streak isn't zeroed.
  if (!completedDays.has(cursor.toISOString().slice(0, 10))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (completedDays.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("longest_streak")
    .eq("id", userId)
    .maybeSingle();

  await supabase
    .from("profiles")
    .update({
      current_streak: streak,
      longest_streak: Math.max(streak, profile?.longest_streak ?? 0),
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

  await recalculateStreak(user.id);

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
