import type {
  ExerciseCategory,
  ExerciseRow,
  ExerciseSide,
  ScheduledSlot,
  ScheduledStatus,
  SectionType,
  Side,
  WeightUnit,
  WorkoutType,
} from "@/lib/supabase/database.types";

export interface SetPrescription {
  id: string;
  setIndex: number;
  reps: number | null;
  weight: number | null;
  weightUnit: WeightUnit;
  durationSeconds: number | null;
  distance: number | null;
  distanceUnit: string | null;
  side: Side;
  isWarmup: boolean;
  notes: string | null;
}

export interface ExerciseSummary {
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
}

export interface WorkoutExerciseInstance {
  id: string;
  order: number;
  side: ExerciseSide;
  tempo: string | null;
  restSeconds: number | null;
  notes: string | null;
  exercise: ExerciseSummary;
  sets: SetPrescription[];
}

export interface WorkoutSection {
  id: string;
  type: SectionType;
  title: string;
  order: number;
  repeatCount: number;
  notes: string | null;
  exercises: WorkoutExerciseInstance[];
}

export interface WorkoutDetail {
  id: string;
  name: string;
  slug: string;
  workoutType: WorkoutType;
  estimatedDurationMinutes: number | null;
  description: string | null;
  sections: WorkoutSection[];
}

export interface ScheduledWorkoutSummary {
  scheduledWorkoutId: string;
  scheduledDate: string;
  slot: ScheduledSlot;
  status: ScheduledStatus;
  workoutId: string;
  workoutName: string;
  workoutType: WorkoutType;
  estimatedDurationMinutes: number | null;
}

export function exerciseRowToSummary(row: ExerciseRow): ExerciseSummary {
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
  };
}

/** Flattens a workout's ordered set prescriptions into a single play-through queue for the workout player. */
export interface PlayerQueueItem {
  sectionId: string;
  sectionType: SectionType;
  sectionTitle: string;
  repeatIndex: number;
  repeatCount: number;
  workoutExerciseId: string;
  exercise: ExerciseSummary;
  set: SetPrescription;
  setNumberInExercise: number;
  totalSetsInExercise: number;
  restSecondsAfter: number | null;
}

export function buildPlayerQueue(sections: WorkoutSection[]): PlayerQueueItem[] {
  const queue: PlayerQueueItem[] = [];

  for (const section of sections) {
    for (let repeatIndex = 0; repeatIndex < section.repeatCount; repeatIndex++) {
      for (const exerciseInstance of section.exercises) {
        exerciseInstance.sets.forEach((set, setIdx) => {
          queue.push({
            sectionId: section.id,
            sectionType: section.type,
            sectionTitle: section.title,
            repeatIndex,
            repeatCount: section.repeatCount,
            workoutExerciseId: exerciseInstance.id,
            exercise: exerciseInstance.exercise,
            set,
            setNumberInExercise: setIdx + 1,
            totalSetsInExercise: exerciseInstance.sets.length,
            restSecondsAfter: exerciseInstance.restSeconds,
          });
        });
      }
    }
  }

  return queue;
}
