import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  DefaultUnit,
  EnrollmentStatus,
  ExerciseCategory,
  ExerciseSide,
  SectionType,
  WeightUnit,
  WorkoutType,
} from "@/lib/supabase/database.types";

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
  coachId: string | null;
  name: string;
  description: string | null;
  isPublished: boolean;
  weeks: ProgramWeekDetail[];
}

export interface ActivationCodeSummary {
  id: string;
  code: string;
  redeemed: boolean;
  redeemedAt: string | null;
  createdAt: string;
}

export async function getActivationCodesForProgram(programId: string): Promise<ActivationCodeSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activation_codes")
    .select("id, code, redeemed_by, redeemed_at, created_at")
    .eq("program_id", programId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map((c) => ({
    id: c.id,
    code: c.code,
    redeemed: c.redeemed_by !== null,
    redeemedAt: c.redeemed_at,
    createdAt: c.created_at,
  }));
}

export async function getProgramDetail(programId: string): Promise<ProgramDetail | null> {
  const supabase = await createClient();
  const { data: program, error } = await supabase
    .from("programs")
    .select("id, coach_id, name, description, is_published")
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
    coachId: program.coach_id,
    name: program.name,
    description: program.description,
    isPublished: program.is_published,
    weeks: weekDetails,
  };
}

export interface RosterEntry {
  userId: string;
  fullName: string | null;
  status: EnrollmentStatus;
  startedOn: string;
}

export async function getProgramRoster(programId: string): Promise<RosterEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("program_enrollments")
    .select("user_id, status, started_on, profiles ( full_name )")
    .eq("program_id", programId)
    .order("started_on", { ascending: false });

  if (error || !data) return [];
  return data.map((e) => ({
    userId: e.user_id,
    fullName: e.profiles?.full_name ?? null,
    status: e.status,
    startedOn: e.started_on,
  }));
}

const EXERCISE_LIBRARY_SELECT =
  "id, name, slug, category, equipment, primary_muscles, secondary_muscles, instructions, common_mistakes, media_url, thumbnail_url, default_unit";

export interface ExerciseLibraryItem {
  id: string;
  name: string;
  slug: string;
  category: ExerciseCategory;
  equipment: string[];
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string | null;
  commonMistakes: string | null;
  mediaUrl: string | null;
  thumbnailUrl: string | null;
  defaultUnit: DefaultUnit;
}

function mapExerciseLibraryRow(row: {
  id: string;
  name: string;
  slug: string;
  category: ExerciseCategory;
  equipment: string[];
  primary_muscles: string[];
  secondary_muscles: string[];
  instructions: string | null;
  common_mistakes: string | null;
  media_url: string | null;
  thumbnail_url: string | null;
  default_unit: DefaultUnit;
}): ExerciseLibraryItem {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    equipment: row.equipment,
    primaryMuscles: row.primary_muscles,
    secondaryMuscles: row.secondary_muscles,
    instructions: row.instructions,
    commonMistakes: row.common_mistakes,
    mediaUrl: row.media_url,
    thumbnailUrl: row.thumbnail_url,
    defaultUnit: row.default_unit,
  };
}

export async function getExerciseLibrary(): Promise<ExerciseLibraryItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("exercises").select(EXERCISE_LIBRARY_SELECT).order("name");

  if (error || !data) return [];
  return data.map(mapExerciseLibraryRow);
}

export async function getExerciseById(exerciseId: string): Promise<ExerciseLibraryItem | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exercises")
    .select(EXERCISE_LIBRARY_SELECT)
    .eq("id", exerciseId)
    .maybeSingle();

  if (error || !data) return null;
  return mapExerciseLibraryRow(data);
}

// ---------------------------------------------------------------------------
// Workout composer
// ---------------------------------------------------------------------------

export interface ComposerSet {
  id: string;
  setIndex: number;
  reps: number | null;
  weight: number | null;
  weightUnit: WeightUnit;
  durationSeconds: number | null;
  distance: number | null;
  distanceUnit: string | null;
  isWarmup: boolean;
}

export interface ComposerExercise {
  id: string;
  orderIndex: number;
  exerciseId: string;
  exerciseName: string;
  side: ExerciseSide;
  restSeconds: number | null;
  notes: string | null;
  sets: ComposerSet[];
}

export interface ComposerSection {
  id: string;
  type: SectionType;
  title: string;
  orderIndex: number;
  repeatCount: number;
  exercises: ComposerExercise[];
}

export interface WorkoutComposerDetail {
  id: string;
  name: string;
  slug: string;
  workoutType: WorkoutType;
  estimatedDurationMinutes: number | null;
  description: string | null;
  createdBy: string | null;
  sections: ComposerSection[];
}

export interface CoachWorkoutSummary {
  id: string;
  name: string;
  workoutType: WorkoutType;
  estimatedDurationMinutes: number | null;
}

export async function getCoachWorkouts(coachId: string): Promise<CoachWorkoutSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workouts")
    .select("id, name, workout_type, estimated_duration_minutes")
    .eq("created_by", coachId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map((w) => ({
    id: w.id,
    name: w.name,
    workoutType: w.workout_type,
    estimatedDurationMinutes: w.estimated_duration_minutes,
  }));
}

const COMPOSER_SELECT = `
  id, name, slug, workout_type, estimated_duration_minutes, description, created_by,
  workout_sections (
    id, section_type, title, order_index, repeat_count,
    workout_exercises (
      id, order_index, side, rest_seconds, notes,
      exercise_id, exercise:exercises ( id, name ),
      exercise_sets ( id, set_index, reps, weight, weight_unit, duration_seconds, distance, distance_unit, is_warmup )
    )
  )
`;

export async function getWorkoutComposerDetail(workoutId: string): Promise<WorkoutComposerDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workouts")
    .select(COMPOSER_SELECT)
    .eq("id", workoutId)
    .maybeSingle();

  if (error || !data) return null;

  const sections: ComposerSection[] = [...data.workout_sections]
    .sort((a, b) => a.order_index - b.order_index)
    .map((section) => ({
      id: section.id,
      type: section.section_type,
      title: section.title,
      orderIndex: section.order_index,
      repeatCount: section.repeat_count,
      exercises: [...section.workout_exercises]
        .sort((a, b) => a.order_index - b.order_index)
        .map((we) => ({
          id: we.id,
          orderIndex: we.order_index,
          exerciseId: we.exercise_id,
          exerciseName: we.exercise?.name ?? "Unknown exercise",
          side: we.side,
          restSeconds: we.rest_seconds,
          notes: we.notes,
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
              isWarmup: s.is_warmup,
            })),
        })),
    }));

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    workoutType: data.workout_type,
    estimatedDurationMinutes: data.estimated_duration_minutes,
    description: data.description,
    createdBy: data.created_by,
    sections,
  };
}
