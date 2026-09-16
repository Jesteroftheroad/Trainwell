"use server";

import { addDays, differenceInCalendarWeeks, startOfWeek } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { getProgramDetail, type ProgramDetail } from "@/lib/builder/queries";
import { getTodayIsoInTimezone, toIsoDate } from "@/lib/date";
import { revalidatePath } from "next/cache";

const MATERIALIZE_DAYS = 90;

function isoToLocalDate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Fills scheduled_workouts forward from `startedOnIso` by cycling through
 * the program's weeks (in week_number order) against each date's actual
 * weekday, repeating from week 1 once the cycle runs out. Never overwrites a
 * date that already has a main-slot row — on first enrollment there won't be
 * one, but switching plans later would leave any already-scheduled days from
 * the old plan in place rather than replacing them (a gap worth closing if
 * plan-switching becomes a real flow).
 */
async function materializeSchedule(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  program: ProgramDetail,
  startedOnIso: string,
): Promise<string | null> {
  const totalWeeks = program.weeks.length;
  if (totalWeeks === 0) return null;

  const startDate = isoToLocalDate(startedOnIso);
  const anchor = startOfWeek(startDate);

  const { data: existingRows } = await supabase
    .from("scheduled_workouts")
    .select("scheduled_date")
    .eq("user_id", userId)
    .eq("slot", "main")
    .gte("scheduled_date", startedOnIso);

  const existingDates = new Set((existingRows ?? []).map((r) => r.scheduled_date));

  const rows: {
    user_id: string;
    workout_id: string;
    scheduled_date: string;
    slot: "main";
    status: "scheduled";
  }[] = [];

  for (let i = 0; i < MATERIALIZE_DAYS; i++) {
    const day = addDays(startDate, i);
    const iso = toIsoDate(day);
    if (existingDates.has(iso)) continue;

    const weekIndex = differenceInCalendarWeeks(day, anchor) % totalWeeks;
    const workoutId = program.weeks[weekIndex]?.days.find((d) => d.dayOfWeek === day.getDay())?.workoutId;
    if (!workoutId) continue;

    rows.push({ user_id: userId, workout_id: workoutId, scheduled_date: iso, slot: "main", status: "scheduled" });
  }

  if (rows.length === 0) return null;

  const { error } = await supabase.from("scheduled_workouts").insert(rows);
  return error?.message ?? null;
}

export async function enrollInProgram(programId: string): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const program = await getProgramDetail(programId);
  if (!program || !program.isPublished) return { error: "This plan isn't available." };

  const hasAnyWorkout = program.weeks.some((w) => w.days.some((d) => d.workoutId));
  if (!hasAnyWorkout) return { error: "This plan doesn't have any workouts scheduled yet." };

  const { data: profile } = await supabase.from("profiles").select("timezone").eq("id", user.id).maybeSingle();
  const startedOn = getTodayIsoInTimezone(profile?.timezone ?? "UTC");

  const { error: enrollError } = await supabase
    .from("program_enrollments")
    .upsert({ user_id: user.id, program_id: programId, started_on: startedOn }, { onConflict: "user_id" });
  if (enrollError) return { error: enrollError.message };

  const materializeError = await materializeSchedule(supabase, user.id, program, startedOn);
  if (materializeError) return { error: materializeError };

  revalidatePath("/today");
  revalidatePath("/workouts");
  return { ok: true };
}
