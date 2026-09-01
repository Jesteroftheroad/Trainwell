"use client";

import type { RecordSetInput, recordCompletedSet } from "./actions";

const STORAGE_KEY = "ascend:offline-set-queue";

function readQueue(): RecordSetInput[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RecordSetInput[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: RecordSetInput[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

function sameSet(a: RecordSetInput, b: RecordSetInput): boolean {
  return (
    a.sessionId === b.sessionId &&
    a.workoutExerciseId === b.workoutExerciseId &&
    a.setIndex === b.setIndex
  );
}

/** Replaces any queued entry for the same set (e.g. re-submitted after editing) rather than duplicating it. */
export function enqueueOfflineSet(input: RecordSetInput): void {
  const queue = readQueue().filter((q) => !sameSet(q, input));
  queue.push(input);
  writeQueue(queue);
}

export function getQueuedSetCount(): number {
  return readQueue().length;
}

/** Replays every queued set through `record`, keeping only the ones that still fail. Returns how many synced. */
export async function flushOfflineQueue(
  record: typeof recordCompletedSet,
): Promise<number> {
  const queue = readQueue();
  if (queue.length === 0) return 0;

  const remaining: RecordSetInput[] = [];
  let synced = 0;

  for (const item of queue) {
    try {
      const result = await record(item);
      if ("error" in result) {
        remaining.push(item);
      } else {
        synced += 1;
      }
    } catch {
      remaining.push(item);
    }
  }

  writeQueue(remaining);
  return synced;
}
