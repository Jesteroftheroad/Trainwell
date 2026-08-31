import type { SetPrescription } from "./types";
import { formatSeconds } from "@/lib/utils";

export function formatSetLine(set: SetPrescription): string {
  const sideSuffix = set.side !== "none" ? ` ${set.side}` : "";

  if (set.durationSeconds != null) {
    return `${formatSeconds(set.durationSeconds)}${sideSuffix}`;
  }

  if (set.distance != null) {
    return `${set.distance} ${set.distanceUnit ?? "mi"}${sideSuffix}`;
  }

  if (set.reps != null && set.weight != null) {
    const weight = Number.isInteger(set.weight) ? set.weight : set.weight.toFixed(1);
    return `${set.reps} reps with ${weight} ${set.weightUnit}${sideSuffix}`;
  }

  if (set.reps != null) {
    return `${set.reps} reps${sideSuffix}`;
  }

  return sideSuffix.trim() || "—";
}
