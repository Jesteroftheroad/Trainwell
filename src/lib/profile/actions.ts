"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateGoal(goalText: string): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { error } = await supabase
    .from("profiles")
    .update({ goal_text: goalText.trim() || null })
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/today");
  return { ok: true };
}

export async function completeOnboarding(input: {
  fullName: string;
  goalText: string;
}): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const fullName = input.fullName.trim();
  if (!fullName) return { error: "Let us know what to call you." };

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, goal_text: input.goalText.trim() || null })
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/today");
  revalidatePath("/profile");
  return { ok: true };
}

export async function updateTimezone(timezone: string): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { error } = await supabase.from("profiles").update({ timezone }).eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/today");
  revalidatePath("/workouts");
  return { ok: true };
}
