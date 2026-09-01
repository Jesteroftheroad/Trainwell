import type { WorkoutType } from "@/lib/supabase/database.types";

// Rough MET (metabolic equivalent) values per workout type — enough for a
// ballpark estimate, not a medical-grade calculation.
const MET_BY_WORKOUT_TYPE: Record<WorkoutType, number> = {
  upper_body: 5,
  lower_body: 6,
  full_body: 6,
  cardio: 7,
  core: 4,
  mobility: 2.5,
};

const DEFAULT_BODY_WEIGHT_KG = 70; // ~154 lb, used when no body weight has been logged

export function estimateCaloriesBurned(
  workoutType: WorkoutType,
  durationMinutes: number,
  bodyWeightKg: number | null,
): number {
  const met = MET_BY_WORKOUT_TYPE[workoutType] ?? 5;
  const weightKg = bodyWeightKg ?? DEFAULT_BODY_WEIGHT_KG;
  const hours = durationMinutes / 60;
  return Math.round(met * weightKg * hours);
}

export function lbToKg(pounds: number): number {
  return pounds * 0.453592;
}
