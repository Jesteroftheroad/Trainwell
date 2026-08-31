import type { PlayerQueueItem } from "./types";

function unitWord(unit: string): string {
  return unit === "kg" ? "kilograms" : "pounds";
}

/** Builds a short spoken announcement for a queue item — plain words, no abbreviations, easy for TTS to read. */
export function announceSet(item: PlayerQueueItem): string {
  const { exercise, set } = item;
  const sideSuffix = set.side !== "none" ? `, ${set.side} side` : "";

  if (set.durationSeconds != null) {
    return `${exercise.name}${sideSuffix}. ${set.durationSeconds} seconds.`;
  }

  if (set.reps != null && set.weight != null) {
    const weight = Number.isInteger(set.weight) ? set.weight : set.weight.toFixed(1);
    return `${exercise.name}${sideSuffix}. ${set.reps} reps with ${weight} ${unitWord(set.weightUnit)}.`;
  }

  if (set.reps != null) {
    return `${exercise.name}${sideSuffix}. ${set.reps} reps.`;
  }

  return `${exercise.name}${sideSuffix}.`;
}
