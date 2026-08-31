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
