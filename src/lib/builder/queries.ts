import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { WorkoutType } from "@/lib/supabase/database.types";

export interface ProgramSummary {
  id: string;
  name: string;
  description: string | null;
  isPublished: boolean;
  createdAt: string;
}

export async function getCoachPrograms(coachId: string): Promise<ProgramSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("programs")
    .select("id, name, description, is_published, created_at")
    .eq("coach_id", coachId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    isPublished: p.is_published,
    createdAt: p.created_at,
  }));
}

export interface WorkoutOption {
  id: string;
  name: string;
  workoutType: WorkoutType;
}

export async function getWorkoutOptions(): Promise<WorkoutOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workouts")
    .select("id, name, workout_type")
    .eq("is_template", true)
    .order("name");

  if (error || !data) return [];
  return data.map((w) => ({ id: w.id, name: w.name, workoutType: w.workout_type }));
}

export interface ProgramDayDetail {
  /** program_days.id for an existing row, or `${weekId}:${dayOfWeek}` for a day that has no row yet. */
  key: string;
  rowId: string | null;
  dayOfWeek: number;
  workoutId: string | null;
  workoutName: string | null;
}

export interface ProgramWeekDetail {
  id: string;
  weekNumber: number;
  days: ProgramDayDetail[];
}

export interface ProgramDetail {
  id: string;
  name: string;
  description: string | null;
  isPublished: boolean;
  weeks: ProgramWeekDetail[];
}

export async function getProgramDetail(programId: string): Promise<ProgramDetail | null> {
  const supabase = await createClient();
  const { data: program, error } = await supabase
    .from("programs")
    .select("id, name, description, is_published")
    .eq("id", programId)
    .maybeSingle();

  if (error || !program) return null;

  const { data: weeks } = await supabase
    .from("program_weeks")
    .select("id, week_number, program_days ( id, day_of_week, workout_id, workouts ( name ) )")
    .eq("program_id", programId)
    .order("week_number", { ascending: true });

  const weekDetails: ProgramWeekDetail[] = (weeks ?? []).map((w) => {
    const byDay = new Map(w.program_days.map((d) => [d.day_of_week, d]));
    const days: ProgramDayDetail[] = Array.from({ length: 7 }, (_, dayOfWeek) => {
      const row = byDay.get(dayOfWeek);
      return {
        key: row ? row.id : `${w.id}:${dayOfWeek}`,
        rowId: row?.id ?? null,
        dayOfWeek,
        workoutId: row?.workout_id ?? null,
        workoutName: row?.workouts?.name ?? null,
      };
    });
    return { id: w.id, weekNumber: w.week_number, days };
  });

  return {
    id: program.id,
    name: program.name,
    description: program.description,
    isPublished: program.is_published,
    weeks: weekDetails,
  };
}
