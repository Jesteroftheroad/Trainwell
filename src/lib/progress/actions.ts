"use server";

import { createClient } from "@/lib/supabase/server";
import type { MetricType } from "@/lib/supabase/database.types";
import { revalidatePath } from "next/cache";
import { getBodyMetrics, getStrengthProgression, type BodyMetricPoint, type StrengthPoint } from "./queries";

export async function fetchStrengthProgression(exerciseId: string): Promise<StrengthPoint[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  return getStrengthProgression(user.id, exerciseId);
}

export async function fetchBodyMetrics(metricType: MetricType): Promise<BodyMetricPoint[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  return getBodyMetrics(user.id, metricType);
}

export async function logBodyMetric(input: {
  metricType: MetricType;
  value: number;
  unit: string;
  recordedAt?: string;
}): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { error } = await supabase.from("progress_metrics").insert({
    user_id: user.id,
    metric_type: input.metricType,
    value: input.value,
    unit: input.unit,
    recorded_at: input.recordedAt ?? new Date().toISOString().slice(0, 10),
  });

  if (error) return { error: error.message };
  revalidatePath("/progress");
  return { ok: true };
}
