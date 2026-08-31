import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { MetricType } from "@/lib/supabase/database.types";
import { getWeekIsoDatesInTimezone } from "@/lib/date";

export interface ConsistencyStats {
  totalCompletedWorkouts: number;
  currentStreak: number;
  longestStreak: number;
  weekScheduled: number;
  weekCompleted: number;
}

export interface LifetimeStats {
  totalWorkouts: number;
  totalHoursExercised: number;
}

export async function getLifetimeStats(userId: string): Promise<LifetimeStats> {
  const supabase = await createClient();
  const { data, count } = await supabase
    .from("workout_sessions")
    .select("total_duration_seconds", { count: "exact" })
    .eq("user_id", userId)
    .eq("status", "completed");

  const totalSeconds = (data ?? []).reduce((sum, row) => sum + (row.total_duration_seconds ?? 0), 0);

  return {
    totalWorkouts: count ?? 0,
    totalHoursExercised: Math.round((totalSeconds / 3600) * 10) / 10,
  };
}

export async function getConsistencyStats(userId: string, timezone = "UTC"): Promise<ConsistencyStats> {
  const supabase = await createClient();

  const weekDates = getWeekIsoDatesInTimezone(timezone);
  const weekStartIso = weekDates[0];
  const weekEndIso = weekDates[weekDates.length - 1];

  const [{ data: profile }, { count: totalCompleted }, { data: weekRows }] = await Promise.all([
    supabase.from("profiles").select("current_streak, longest_streak").eq("id", userId).maybeSingle(),
    supabase
      .from("workout_sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "completed"),
    supabase
      .from("scheduled_workouts")
      .select("status")
      .eq("user_id", userId)
      .eq("slot", "main")
      .gte("scheduled_date", weekStartIso)
      .lte("scheduled_date", weekEndIso),
  ]);

  return {
    totalCompletedWorkouts: totalCompleted ?? 0,
    currentStreak: profile?.current_streak ?? 0,
    longestStreak: profile?.longest_streak ?? 0,
    weekScheduled: weekRows?.length ?? 0,
    weekCompleted: weekRows?.filter((r) => r.status === "completed").length ?? 0,
  };
}

export interface TrainedExercise {
  exerciseId: string;
  name: string;
}

export async function getTrainedExercises(userId: string): Promise<TrainedExercise[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("completed_sets")
    .select("exercise_id, exercises(name), workout_sessions!inner(user_id)")
    .eq("workout_sessions.user_id", userId)
    .eq("skipped", false)
    .not("weight", "is", null);

  if (error || !data) return [];

  const seen = new Map<string, string>();
  for (const row of data) {
    if (row.exercises?.name) seen.set(row.exercise_id, row.exercises.name);
  }

  return Array.from(seen.entries()).map(([exerciseId, name]) => ({ exerciseId, name }));
}

export interface StrengthPoint {
  date: string;
  maxWeight: number;
  topSetReps: number | null;
}

export async function getStrengthProgression(userId: string, exerciseId: string): Promise<StrengthPoint[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("completed_sets")
    .select("weight, reps, completed_at, workout_sessions!inner(user_id)")
    .eq("exercise_id", exerciseId)
    .eq("workout_sessions.user_id", userId)
    .eq("skipped", false)
    .not("weight", "is", null)
    .order("completed_at", { ascending: true });

  if (error || !data) return [];

  const byDate = new Map<string, { maxWeight: number; topSetReps: number | null }>();
  for (const row of data) {
    const date = (row.completed_at as string).slice(0, 10);
    const weight = row.weight ?? 0;
    const existing = byDate.get(date);
    if (!existing || weight > existing.maxWeight) {
      byDate.set(date, { maxWeight: weight, topSetReps: row.reps });
    }
  }

  return Array.from(byDate.entries()).map(([date, v]) => ({ date, ...v }));
}

export interface BodyMetricPoint {
  id: string;
  recordedAt: string;
  value: number;
  unit: string;
}

export async function getBodyMetrics(userId: string, metricType: MetricType): Promise<BodyMetricPoint[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("progress_metrics")
    .select("id, recorded_at, value, unit")
    .eq("user_id", userId)
    .eq("metric_type", metricType)
    .order("recorded_at", { ascending: true });

  if (error || !data) return [];
  return data.map((d) => ({ id: d.id, recordedAt: d.recorded_at, value: d.value, unit: d.unit }));
}
