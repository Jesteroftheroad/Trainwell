import type { PlayerQueueItem } from "./types";

function unitWord(unit: string): string {
  return unit === "kg" ? "kilograms" : "pounds";
}

/**
 * Builds a short spoken announcement for a queue item — plain words, no
 * abbreviations, easy for TTS to read. The how-to instructions are only
 * included the first time a given exercise comes up (pass
 * `includeInstructions: true`) — repeating them on every set of the same
 * exercise would make a multi-set exercise unbearable to listen through.
 */
export function announceSet(item: PlayerQueueItem, includeInstructions = false): string {
  const { exercise, set } = item;
  const sideSuffix = set.side !== "none" ? `, ${set.side} side` : "";
  const howTo = includeInstructions && exercise.instructions ? ` ${exercise.instructions}` : "";

  if (set.durationSeconds != null) {
    return `${exercise.name}${sideSuffix}.${howTo} ${set.durationSeconds} seconds.`;
  }

  if (set.reps != null && set.weight != null) {
    const weight = Number.isInteger(set.weight) ? set.weight : set.weight.toFixed(1);
    return `${exercise.name}${sideSuffix}.${howTo} ${set.reps} reps with ${weight} ${unitWord(set.weightUnit)}.`;
  }

  if (set.reps != null) {
    return `${exercise.name}${sideSuffix}.${howTo} ${set.reps} reps.`;
  }

  return `${exercise.name}${sideSuffix}.${howTo}`;
}
