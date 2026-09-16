"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type CoachContext = { supabase: Awaited<ReturnType<typeof createClient>>; userId: string };

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
