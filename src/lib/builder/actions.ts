"use server";

import { randomInt } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { parseTagList, slugify } from "@/lib/utils";
import { getExerciseLibrary, type ExerciseLibraryItem } from "./queries";
import type {
  DefaultUnit,
  ExerciseCategory,
  SectionType,
  WorkoutType,
} from "@/lib/supabase/database.types";

type CoachContext = { supabase: Awaited<ReturnType<typeof createClient>>; userId: string };

async function uniqueSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: "exercises" | "workouts",
  base: string,
): Promise<string> {
  const baseSlug = slugify(base) || "item";
  let candidate = baseSlug;
  let suffix = 2;
  for (;;) {
    const { data } = await supabase.from(table).select("id").eq("slug", candidate).maybeSingle();
    if (!data) return candidate;
    candidate = `${baseSlug}-${suffix++}`;
  }
}

async function requireCoach(): Promise<CoachContext | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "coach") return { error: "Only coaches can do this." };

  return { supabase, userId: user.id };
}

export async function createProgram(name: string): Promise<{ programId: string } | { error: string }> {
  const auth = await requireCoach();
  if ("error" in auth) return auth;
  const { supabase, userId } = auth;

  const trimmed = name.trim();
  if (!trimmed) return { error: "Name is required." };

  const { data: program, error } = await supabase
    .from("programs")
    .insert({ coach_id: userId, name: trimmed })
    .select("id")
    .single();

  if (error || !program) return { error: error?.message ?? "Could not create plan." };

  const { error: weekError } = await supabase
    .from("program_weeks")
    .insert({ program_id: program.id, week_number: 1 });

  if (weekError) return { error: weekError.message };

  revalidatePath("/builder");
  return { programId: program.id };
}

export async function updateProgramMeta(
  programId: string,
  input: { name: string; description: string },
): Promise<{ ok: true } | { error: string }> {
  const auth = await requireCoach();
  if ("error" in auth) return auth;
  const { supabase } = auth;

  const name = input.name.trim();
  if (!name) return { error: "Name is required." };

  const { error } = await supabase
    .from("programs")
    .update({ name, description: input.description.trim() || null })
    .eq("id", programId);

  if (error) return { error: error.message };

  revalidatePath("/builder");
  revalidatePath(`/builder/${programId}`);
  return { ok: true };
}

export async function setProgramPublished(
  programId: string,
  published: boolean,
): Promise<{ ok: true } | { error: string }> {
  const auth = await requireCoach();
  if ("error" in auth) return auth;
  const { supabase } = auth;

  const { error } = await supabase.from("programs").update({ is_published: published }).eq("id", programId);
  if (error) return { error: error.message };

  revalidatePath("/builder");
  revalidatePath(`/builder/${programId}`);
  return { ok: true };
}

export async function deleteProgram(programId: string): Promise<{ ok: true } | { error: string }> {
  const auth = await requireCoach();
  if ("error" in auth) return auth;
  const { supabase } = auth;

  const { error } = await supabase.from("programs").delete().eq("id", programId);
  if (error) return { error: error.message };

  revalidatePath("/builder");
  return { ok: true };
}

export async function addProgramWeek(programId: string): Promise<{ ok: true } | { error: string }> {
  const auth = await requireCoach();
  if ("error" in auth) return auth;
  const { supabase } = auth;

  const { data: lastWeek } = await supabase
    .from("program_weeks")
    .select("week_number")
    .eq("program_id", programId)
    .order("week_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase
    .from("program_weeks")
    .insert({ program_id: programId, week_number: (lastWeek?.week_number ?? 0) + 1 });

  if (error) return { error: error.message };

  revalidatePath(`/builder/${programId}`);
  return { ok: true };
}

export async function setProgramDay(
  programId: string,
  weekId: string,
  dayOfWeek: number,
  workoutId: string | null,
): Promise<{ ok: true } | { error: string }> {
  const auth = await requireCoach();
  if ("error" in auth) return auth;
  const { supabase } = auth;

  if (workoutId === null) {
    const { error } = await supabase
      .from("program_days")
      .delete()
      .eq("program_week_id", weekId)
      .eq("day_of_week", dayOfWeek);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("program_days")
      .upsert(
        { program_week_id: weekId, day_of_week: dayOfWeek, workout_id: workoutId },
        { onConflict: "program_week_id,day_of_week" },
      );
    if (error) return { error: error.message };
  }

  revalidatePath(`/builder/${programId}`);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Activation codes
// ---------------------------------------------------------------------------

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I — avoids ambiguity when typed by hand

function generateCode(length = 8): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  }
  return code;
}

export async function generateActivationCode(programId: string): Promise<{ code: string } | { error: string }> {
  const auth = await requireCoach();
  if ("error" in auth) return auth;
  const { supabase, userId } = auth;

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCode();
    const { error } = await supabase
      .from("activation_codes")
      .insert({ coach_id: userId, program_id: programId, code });

    if (!error) {
      revalidatePath(`/builder/${programId}`);
      return { code };
    }
    if (error.code !== "23505") return { error: error.message };
  }

  return { error: "Could not generate a unique code — try again." };
}

export async function revokeActivationCode(
  programId: string,
  codeId: string,
): Promise<{ ok: true } | { error: string }> {
  const auth = await requireCoach();
  if ("error" in auth) return auth;
  const { supabase } = auth;

  const { error } = await supabase.from("activation_codes").delete().eq("id", codeId).is("redeemed_by", null);
  if (error) return { error: error.message };

  revalidatePath(`/builder/${programId}`);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Exercise library
// ---------------------------------------------------------------------------

export interface ExerciseInput {
  name: string;
  category: ExerciseCategory;
  equipment: string;
  primaryMuscles: string;
  secondaryMuscles: string;
  instructions: string;
  commonMistakes: string;
  defaultUnit: DefaultUnit;
  mediaUrl: string;
  thumbnailUrl: string;
}

export async function createExercise(input: ExerciseInput): Promise<{ exerciseId: string } | { error: string }> {
  const auth = await requireCoach();
  if ("error" in auth) return auth;
  const { supabase } = auth;

  const name = input.name.trim();
  if (!name) return { error: "Name is required." };

  const primaryMuscles = parseTagList(input.primaryMuscles);
  if (primaryMuscles.length === 0) return { error: "Add at least one primary muscle." };

  const slug = await uniqueSlug(supabase, "exercises", name);

  const { data, error } = await supabase
    .from("exercises")
    .insert({
      name,
      slug,
      category: input.category,
      equipment: parseTagList(input.equipment),
      primary_muscles: primaryMuscles,
      secondary_muscles: parseTagList(input.secondaryMuscles),
      instructions: input.instructions.trim() || null,
      common_mistakes: input.commonMistakes.trim() || null,
      default_unit: input.defaultUnit,
      media_url: input.mediaUrl.trim() || null,
      thumbnail_url: input.thumbnailUrl.trim() || null,
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "Could not create exercise." };

  revalidatePath("/builder/exercises");
  return { exerciseId: data.id };
}

export async function updateExercise(
  exerciseId: string,
  input: ExerciseInput,
): Promise<{ ok: true } | { error: string }> {
  const auth = await requireCoach();
  if ("error" in auth) return auth;
  const { supabase } = auth;

  const name = input.name.trim();
  if (!name) return { error: "Name is required." };

  const primaryMuscles = parseTagList(input.primaryMuscles);
  if (primaryMuscles.length === 0) return { error: "Add at least one primary muscle." };

  const { error } = await supabase
    .from("exercises")
    .update({
      name,
      category: input.category,
      equipment: parseTagList(input.equipment),
      primary_muscles: primaryMuscles,
      secondary_muscles: parseTagList(input.secondaryMuscles),
      instructions: input.instructions.trim() || null,
      common_mistakes: input.commonMistakes.trim() || null,
      default_unit: input.defaultUnit,
      media_url: input.mediaUrl.trim() || null,
      thumbnail_url: input.thumbnailUrl.trim() || null,
    })
    .eq("id", exerciseId);

  if (error) return { error: error.message };

  revalidatePath("/builder/exercises");
  revalidatePath(`/builder/exercises/${exerciseId}`);
  return { ok: true };
}

export async function fetchExerciseLibrary(): Promise<ExerciseLibraryItem[]> {
  const auth = await requireCoach();
  if ("error" in auth) return [];
  return getExerciseLibrary();
}

// ---------------------------------------------------------------------------
// Workout composer
// ---------------------------------------------------------------------------

const SECTION_TITLE_DEFAULTS: Record<SectionType, string> = {
  warmup: "Warm-up",
  set: "Set",
  superset: "Superset",
  circuit: "Circuit",
  cardio: "Cardio",
  cooldown: "Cool-down",
  stretching: "Stretching",
};

export interface WorkoutMetaInput {
  name: string;
  workoutType: WorkoutType;
  estimatedDurationMinutes: number | null;
  description: string;
}

export async function createWorkout(input: WorkoutMetaInput): Promise<{ workoutId: string } | { error: string }> {
  const auth = await requireCoach();
  if ("error" in auth) return auth;
  const { supabase, userId } = auth;

  const name = input.name.trim();
  if (!name) return { error: "Name is required." };

  const slug = await uniqueSlug(supabase, "workouts", name);

  const { data, error } = await supabase
    .from("workouts")
    .insert({
      name,
      slug,
      workout_type: input.workoutType,
      estimated_duration_minutes: input.estimatedDurationMinutes,
      description: input.description.trim() || null,
      created_by: userId,
      is_template: true,
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "Could not create workout." };

  revalidatePath("/builder/workouts");
  return { workoutId: data.id };
}

export async function updateWorkoutMeta(
  workoutId: string,
  input: WorkoutMetaInput,
): Promise<{ ok: true } | { error: string }> {
  const auth = await requireCoach();
  if ("error" in auth) return auth;
  const { supabase } = auth;

  const name = input.name.trim();
  if (!name) return { error: "Name is required." };

  const { error } = await supabase
    .from("workouts")
    .update({
      name,
      workout_type: input.workoutType,
      estimated_duration_minutes: input.estimatedDurationMinutes,
      description: input.description.trim() || null,
    })
    .eq("id", workoutId);

  if (error) return { error: error.message };

  revalidatePath("/builder/workouts");
  revalidatePath(`/builder/workouts/${workoutId}`);
  return { ok: true };
}

export async function deleteWorkout(workoutId: string): Promise<{ ok: true } | { error: string }> {
  const auth = await requireCoach();
  if ("error" in auth) return auth;
  const { supabase } = auth;

  const { error } = await supabase.from("workouts").delete().eq("id", workoutId);
  if (error) return { error: "Could not delete — it may still be assigned in a plan or someone's schedule." };

  revalidatePath("/builder/workouts");
  return { ok: true };
}

export async function addSection(
  workoutId: string,
  sectionType: SectionType,
): Promise<{ ok: true } | { error: string }> {
  const auth = await requireCoach();
  if ("error" in auth) return auth;
  const { supabase } = auth;

  const { data: last } = await supabase
    .from("workout_sections")
    .select("order_index")
    .eq("workout_id", workoutId)
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("workout_sections").insert({
    workout_id: workoutId,
    section_type: sectionType,
    title: SECTION_TITLE_DEFAULTS[sectionType],
    order_index: (last?.order_index ?? 0) + 1,
    repeat_count: 1,
  });

  if (error) return { error: error.message };
  revalidatePath(`/builder/workouts/${workoutId}`);
  return { ok: true };
}

export async function updateSection(
  workoutId: string,
  sectionId: string,
  input: { title: string; repeatCount: number },
): Promise<{ ok: true } | { error: string }> {
  const auth = await requireCoach();
  if ("error" in auth) return auth;
  const { supabase } = auth;

  const { error } = await supabase
    .from("workout_sections")
    .update({ title: input.title.trim() || "Section", repeat_count: Math.max(1, input.repeatCount) })
    .eq("id", sectionId);

  if (error) return { error: error.message };
  revalidatePath(`/builder/workouts/${workoutId}`);
  return { ok: true };
}

export async function removeSection(workoutId: string, sectionId: string): Promise<{ ok: true } | { error: string }> {
  const auth = await requireCoach();
  if ("error" in auth) return auth;
  const { supabase } = auth;

  const { error } = await supabase.from("workout_sections").delete().eq("id", sectionId);
  if (error) return { error: error.message };

  revalidatePath(`/builder/workouts/${workoutId}`);
  return { ok: true };
}

function findSwap<T extends { id: string; order_index: number }>(
  rows: T[],
  rowId: string,
  direction: "up" | "down",
): [T, T] | null {
  const index = rows.findIndex((r) => r.id === rowId);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapWith < 0 || swapWith >= rows.length) return null;
  return [rows[index], rows[swapWith]];
}

export async function moveSection(
  workoutId: string,
  sectionId: string,
  direction: "up" | "down",
): Promise<{ ok: true } | { error: string }> {
  const auth = await requireCoach();
  if ("error" in auth) return auth;
  const { supabase } = auth;

  const { data: rows } = await supabase
    .from("workout_sections")
    .select("id, order_index")
    .eq("workout_id", workoutId)
    .order("order_index", { ascending: true });

  if (!rows) return { error: "Could not load sections." };

  const swap = findSwap(rows, sectionId, direction);
  if (!swap) return { ok: true };
  const [a, b] = swap;

  const [{ error: e1 }, { error: e2 }] = await Promise.all([
    supabase.from("workout_sections").update({ order_index: b.order_index }).eq("id", a.id),
    supabase.from("workout_sections").update({ order_index: a.order_index }).eq("id", b.id),
  ]);

  if (e1 || e2) return { error: e1?.message ?? e2?.message ?? "Could not reorder." };
  revalidatePath(`/builder/workouts/${workoutId}`);
  return { ok: true };
}

export async function moveExercise(
  workoutId: string,
  sectionId: string,
  workoutExerciseId: string,
  direction: "up" | "down",
): Promise<{ ok: true } | { error: string }> {
  const auth = await requireCoach();
  if ("error" in auth) return auth;
  const { supabase } = auth;

  const { data: rows } = await supabase
    .from("workout_exercises")
    .select("id, order_index")
    .eq("section_id", sectionId)
    .order("order_index", { ascending: true });

  if (!rows) return { error: "Could not load exercises." };

  const swap = findSwap(rows, workoutExerciseId, direction);
  if (!swap) return { ok: true };
  const [a, b] = swap;

  const [{ error: e1 }, { error: e2 }] = await Promise.all([
    supabase.from("workout_exercises").update({ order_index: b.order_index }).eq("id", a.id),
    supabase.from("workout_exercises").update({ order_index: a.order_index }).eq("id", b.id),
  ]);

  if (e1 || e2) return { error: e1?.message ?? e2?.message ?? "Could not reorder." };
  revalidatePath(`/builder/workouts/${workoutId}`);
  return { ok: true };
}

export async function addExerciseToSection(
  workoutId: string,
  sectionId: string,
  exerciseId: string,
): Promise<{ ok: true } | { error: string }> {
  const auth = await requireCoach();
  if ("error" in auth) return auth;
  const { supabase } = auth;

  const { data: last } = await supabase
    .from("workout_exercises")
    .select("order_index")
    .eq("section_id", sectionId)
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: workoutExercise, error } = await supabase
    .from("workout_exercises")
    .insert({
      section_id: sectionId,
      exercise_id: exerciseId,
      order_index: (last?.order_index ?? 0) + 1,
      side: "none",
      rest_seconds: 60,
    })
    .select("id")
    .single();

  if (error || !workoutExercise) return { error: error?.message ?? "Could not add exercise." };

  const { error: setError } = await supabase
    .from("exercise_sets")
    .insert({ workout_exercise_id: workoutExercise.id, set_index: 1 });

  if (setError) return { error: setError.message };

  revalidatePath(`/builder/workouts/${workoutId}`);
  return { ok: true };
}

export async function removeExercise(
  workoutId: string,
  workoutExerciseId: string,
): Promise<{ ok: true } | { error: string }> {
  const auth = await requireCoach();
  if ("error" in auth) return auth;
  const { supabase } = auth;

  const { error } = await supabase.from("workout_exercises").delete().eq("id", workoutExerciseId);
  if (error) return { error: error.message };

  revalidatePath(`/builder/workouts/${workoutId}`);
  return { ok: true };
}

export async function setExerciseRest(
  workoutId: string,
  workoutExerciseId: string,
  restSeconds: number | null,
): Promise<{ ok: true } | { error: string }> {
  const auth = await requireCoach();
  if ("error" in auth) return auth;
  const { supabase } = auth;

  const { error } = await supabase
    .from("workout_exercises")
    .update({ rest_seconds: restSeconds })
    .eq("id", workoutExerciseId);

  if (error) return { error: error.message };
  revalidatePath(`/builder/workouts/${workoutId}`);
  return { ok: true };
}

export async function addSet(workoutId: string, workoutExerciseId: string): Promise<{ ok: true } | { error: string }> {
  const auth = await requireCoach();
  if ("error" in auth) return auth;
  const { supabase } = auth;

  const { data: last } = await supabase
    .from("exercise_sets")
    .select("set_index")
    .eq("workout_exercise_id", workoutExerciseId)
    .order("set_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase
    .from("exercise_sets")
    .insert({ workout_exercise_id: workoutExerciseId, set_index: (last?.set_index ?? 0) + 1 });

  if (error) return { error: error.message };
  revalidatePath(`/builder/workouts/${workoutId}`);
  return { ok: true };
}

export async function updateSet(
  workoutId: string,
  setId: string,
  input: { reps: number | null; weight: number | null; durationSeconds: number | null },
): Promise<{ ok: true } | { error: string }> {
  const auth = await requireCoach();
  if ("error" in auth) return auth;
  const { supabase } = auth;

  const { error } = await supabase
    .from("exercise_sets")
    .update({ reps: input.reps, weight: input.weight, duration_seconds: input.durationSeconds })
    .eq("id", setId);

  if (error) return { error: error.message };
  revalidatePath(`/builder/workouts/${workoutId}`);
  return { ok: true };
}

export async function removeSet(workoutId: string, setId: string): Promise<{ ok: true } | { error: string }> {
  const auth = await requireCoach();
  if ("error" in auth) return auth;
  const { supabase } = auth;

  const { error } = await supabase.from("exercise_sets").delete().eq("id", setId);
  if (error) return { error: error.message };

  revalidatePath(`/builder/workouts/${workoutId}`);
  return { ok: true };
}
