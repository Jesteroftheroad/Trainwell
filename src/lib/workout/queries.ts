import "server-only";
import { createClient } from "@/lib/supabase/server";
import {
  buildPlayerQueue,
  exerciseRowToSummary,
  type ScheduledWorkoutSummary,
  type WorkoutDetail,
  type WorkoutSection,
} from "./types";
import type {
  ExerciseRow,
  ExerciseSetRow,
  ScheduledSlot,
  WorkoutExerciseRow,
  WorkoutRow,
  WorkoutSectionRow,
  WorkoutType,
} from "@/lib/supabase/database.types";

type WorkoutExerciseJoined = WorkoutExerciseRow & {
  exercise: ExerciseRow;
  exercise_sets: ExerciseSetRow[];
};

type WorkoutSectionJoined = WorkoutSectionRow & {
  workout_exercises: WorkoutExerciseJoined[];
};

type WorkoutJoined = WorkoutRow & {
  workout_sections: WorkoutSectionJoined[];
};

const WORKOUT_DETAIL_SELECT = `
  id, name, slug, workout_type, estimated_duration_minutes, description,
  workout_sections (
    id, workout_id, section_type, title, order_index, repeat_count, notes,
    workout_exercises (
      id, section_id, exercise_id, order_index, side, tempo, rest_seconds, notes,
      exercise:exercises ( id, name, slug, category, equipment, primary_muscles, secondary_muscles, instructions, common_mistakes, media_url, thumbnail_url, default_unit, created_at ),
      exercise_sets ( id, workout_exercise_id, set_index, reps, weight, weight_unit, duration_seconds, distance, distance_unit, side, is_warmup, notes )
    )
  )
`;

function mapWorkoutJoined(row: WorkoutJoined): WorkoutDetail {
  const sections: WorkoutSection[] = [...row.workout_sections]
    .sort((a, b) => a.order_index - b.order_index)
    .map((section) => ({
      id: section.id,
      type: section.section_type,
      title: section.title,
      order: section.order_index,
      repeatCount: section.repeat_count,
      notes: section.notes,
      exercises: [...section.workout_exercises]
        .sort((a, b) => a.order_index - b.order_index)
        .map((we) => ({
          id: we.id,
          order: we.order_index,
          side: we.side,
          tempo: we.tempo,
          restSeconds: we.rest_seconds,
          notes: we.notes,
          exercise: exerciseRowToSummary(we.exercise),
          sets: [...we.exercise_sets]
            .sort((a, b) => a.set_index - b.set_index)
            .map((s) => ({
              id: s.id,
              setIndex: s.set_index,
              reps: s.reps,
              weight: s.weight,
              weightUnit: s.weight_unit,
              durationSeconds: s.duration_seconds,
              distance: s.distance,
              distanceUnit: s.distance_unit,
              side: s.side,
              isWarmup: s.is_warmup,
              notes: s.notes,
            })),
        })),
    }));

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    workoutType: row.workout_type,
    estimatedDurationMinutes: row.estimated_duration_minutes,
    description: row.description,
    sections,
  };
}

export async function getWorkoutDetail(workoutId: string): Promise<WorkoutDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workouts")
    .select(WORKOUT_DETAIL_SELECT)
    .eq("id", workoutId)
    .maybeSingle<WorkoutJoined>();

  if (error || !data) return null;
  return mapWorkoutJoined(data);
}

export interface ScheduledWorkoutWithDetail {
  scheduledWorkoutId: string;
  scheduledDate: string;
  slot: ScheduledSlot;
  status: string;
  workout: WorkoutDetail;
}

export async function getScheduledWorkoutDetail(
  scheduledWorkoutId: string,
): Promise<ScheduledWorkoutWithDetail | null> {
  const supabase = await createClient();
  const { data: scheduled, error } = await supabase
    .from("scheduled_workouts")
    .select("id, scheduled_date, slot, status, workout_id")
    .eq("id", scheduledWorkoutId)
    .maybeSingle();

  if (error || !scheduled) return null;

  const workout = await getWorkoutDetail(scheduled.workout_id);
  if (!workout) return null;

  return {
    scheduledWorkoutId: scheduled.id,
    scheduledDate: scheduled.scheduled_date,
    slot: scheduled.slot,
    status: scheduled.status,
    workout,
  };
}

export { buildPlayerQueue };

function mapScheduledRow(row: {
  id: string;
  scheduled_date: string;
  slot: ScheduledSlot;
  status: string;
  workouts: Pick<WorkoutRow, "id" | "name" | "workout_type" | "estimated_duration_minutes">;
}): ScheduledWorkoutSummary {
  return {
    scheduledWorkoutId: row.id,
    scheduledDate: row.scheduled_date,
    slot: row.slot,
    status: row.status as ScheduledWorkoutSummary["status"],
    workoutId: row.workouts.id,
    workoutName: row.workouts.name,
    workoutType: row.workouts.workout_type,
    estimatedDurationMinutes: row.workouts.estimated_duration_minutes,
  };
}

const SCHEDULED_SELECT =
  "id, scheduled_date, slot, status, workouts ( id, name, workout_type, estimated_duration_minutes )";

export async function getTodaysMainWorkout(
  userId: string,
  isoDate: string,
): Promise<ScheduledWorkoutSummary | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("scheduled_workouts")
    .select(SCHEDULED_SELECT)
    .eq("user_id", userId)
    .eq("scheduled_date", isoDate)
    .eq("slot", "main")
    .maybeSingle();

  if (error || !data) return null;
  return mapScheduledRow(data);
}

/** One main-slot scheduled workout per date in `weekDates`, in the same order (null = rest day). */
export async function getWeekMainWorkouts(
  userId: string,
  weekDates: string[],
): Promise<(ScheduledWorkoutSummary | null)[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("scheduled_workouts")
    .select(SCHEDULED_SELECT)
    .eq("user_id", userId)
    .eq("slot", "main")
    .in("scheduled_date", weekDates);

  if (error || !data) return weekDates.map(() => null);

  return weekDates.map((isoDate) => {
    const row = data.find((d) => d.scheduled_date === isoDate);
    return row ? mapScheduledRow(row) : null;
  });
}

export async function getUpcomingScheduled(
  userId: string,
  slot: ScheduledSlot,
  todayIso: string,
): Promise<ScheduledWorkoutSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("scheduled_workouts")
    .select(SCHEDULED_SELECT)
    .eq("user_id", userId)
    .eq("slot", slot)
    .neq("status", "completed")
    .gte("scheduled_date", slot === "main" ? todayIso : "1900-01-01")
    .order("scheduled_date", { ascending: true });

  if (error || !data) return [];
  return data.map(mapScheduledRow);
}

export interface CompletedWorkoutSummary {
  sessionId: string;
  completedAt: string;
  workoutId: string;
  workoutName: string;
  workoutType: WorkoutType;
  totalDurationSeconds: number | null;
}

export async function getCompletedSessions(userId: string): Promise<CompletedWorkoutSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workout_sessions")
    .select("id, completed_at, total_duration_seconds, workouts ( id, name, workout_type )")
    .eq("user_id", userId)
    .eq("status", "completed")
    .order("completed_at", { ascending: false });

  if (error || !data) return [];

  return data
    .filter((row) => row.completed_at && row.workouts)
    .map((row) => ({
      sessionId: row.id,
      completedAt: row.completed_at as string,
      workoutId: row.workouts!.id,
      workoutName: row.workouts!.name,
      workoutType: row.workouts!.workout_type,
      totalDurationSeconds: row.total_duration_seconds,
    }));
}

export interface SessionForPlayer {
  sessionId: string;
  workout: WorkoutDetail;
  completedKeys: string[];
}

export async function getSessionForPlayer(
  sessionId: string,
  userId: string,
): Promise<SessionForPlayer | null> {
  const supabase = await createClient();
  const { data: session, error } = await supabase
    .from("workout_sessions")
    .select("id, workout_id, user_id, status")
    .eq("id", sessionId)
    .maybeSingle();

  if (error || !session || session.user_id !== userId) return null;

  const workout = await getWorkoutDetail(session.workout_id);
  if (!workout) return null;

  const { data: completed } = await supabase
    .from("completed_sets")
    .select("workout_exercise_id, set_index")
    .eq("session_id", sessionId);

  return {
    sessionId: session.id,
    workout,
    completedKeys: (completed ?? []).map((c) => `${c.workout_exercise_id}:${c.set_index}`),
  };
}

export async function getExerciseHistory(userId: string, exerciseId: string, limit = 10) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("completed_sets")
    .select(
      "id, set_index, reps, weight, weight_unit, duration_seconds, distance, side, is_personal_record, completed_at, workout_sessions!inner(user_id)",
    )
    .eq("exercise_id", exerciseId)
    .eq("workout_sessions.user_id", userId)
    .eq("skipped", false)
    .order("completed_at", { ascending: false })
    .limit(limit * 6);

  if (error || !data) return [];
  return data;
}
