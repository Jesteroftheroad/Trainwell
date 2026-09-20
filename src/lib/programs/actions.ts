"use server";

import { addDays, addMonths, differenceInCalendarDays, differenceInCalendarWeeks, startOfWeek } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { getProgramDetail, type ProgramDetail } from "@/lib/builder/queries";
import { getTodayIsoInTimezone, toIsoDate } from "@/lib/date";
import { revalidatePath } from "next/cache";

function isoToLocalDate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Fills scheduled_workouts forward from `startedOnIso` through 3 calendar
 * months later, cycling through the program's weeks (in week_number order)
 * against each date's actual weekday and repeating from week 1 once the
 * cycle runs out. Never overwrites a date that already has a main-slot row
 * — on first activation there won't be one, but switching plans later would
 * leave any already-scheduled days from the old plan in place rather than
 * replacing them (a gap worth closing if plan-switching becomes a real flow).
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
  const totalDays = differenceInCalendarDays(addMonths(startDate, 3), startDate);

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

  for (let i = 0; i < totalDays; i++) {
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

/**
 * Records that a client wants a plan, but doesn't schedule anything yet —
 * the coach hands them an activation code separately (e.g. once they've
 * paid), and redeeming it is what actually activates the enrollment.
 */
export async function enrollInProgram(programId: string): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const program = await getProgramDetail(programId);
  if (!program || !program.isPublished) return { error: "This plan isn't available." };

  const { data: profile } = await supabase.from("profiles").select("timezone").eq("id", user.id).maybeSingle();
  const startedOn = getTodayIsoInTimezone(profile?.timezone ?? "UTC");

  const { error } = await supabase
    .from("program_enrollments")
    .upsert(
      { user_id: user.id, program_id: programId, started_on: startedOn, status: "pending", activated_at: null },
      { onConflict: "user_id" },
    );
  if (error) return { error: error.message };

  // Best-effort: lets the coach see this client as "pending" on their
  // roster before a code is redeemed. Not fatal if it fails — the roster
  // just won't show them by name until they activate.
  if (program.coachId) {
    await supabase
      .from("coach_clients")
      .upsert({ coach_id: program.coachId, client_id: user.id, status: "pending" }, { onConflict: "coach_id,client_id" });
  }

  revalidatePath("/plans");
  revalidatePath("/profile");
  return { ok: true };
}

/**
 * Redeems a coach-issued activation code via the redeem_activation_code()
 * SECURITY DEFINER function (a client can't be granted RLS access to browse
 * or match arbitrary rows in activation_codes, only to redeem one by value).
 * On success, materializes 3 months of scheduled_workouts for the code's
 * program starting today.
 */
export async function redeemCode(code: string): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const trimmed = code.trim();
  if (!trimmed) return { error: "Enter a code." };

  const { data, error } = await supabase.rpc("redeem_activation_code", { p_code: trimmed });
  if (error) return { error: error.message };
  if ("error" in data) return { error: data.error };

  const program = await getProgramDetail(data.program_id);
  if (!program) return { error: "Activated, but couldn't load the plan — refresh and check Today." };

  const { data: profile } = await supabase.from("profiles").select("timezone").eq("id", user.id).maybeSingle();
  const startedOn = getTodayIsoInTimezone(profile?.timezone ?? "UTC");

  const materializeError = await materializeSchedule(supabase, user.id, program, startedOn);
  if (materializeError) return { error: materializeError };

  revalidatePath("/today");
  revalidatePath("/workouts");
  revalidatePath("/plans");
  revalidatePath("/profile");
  return { ok: true };
}
