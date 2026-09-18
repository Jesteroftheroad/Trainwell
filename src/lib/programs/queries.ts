import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { EnrollmentStatus } from "@/lib/supabase/database.types";

export interface PublishedProgramSummary {
  id: string;
  name: string;
  description: string | null;
}

export async function getPublishedPrograms(): Promise<PublishedProgramSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("programs")
    .select("id, name, description")
    .eq("is_published", true)
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return data;
}

export interface CurrentEnrollment {
  programId: string;
  programName: string;
  status: EnrollmentStatus;
}

export async function getCurrentEnrollment(userId: string): Promise<CurrentEnrollment | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("program_enrollments")
    .select("program_id, status, programs ( name )")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return { programId: data.program_id, programName: data.programs?.name ?? "Your plan", status: data.status };
}
