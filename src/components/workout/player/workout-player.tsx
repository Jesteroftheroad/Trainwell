"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CloudOff, SkipForward, Undo2, Volume2, VolumeX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { recordCompletedSet, type RecordSetInput } from "@/lib/workout/actions";
import { formatSetLine } from "@/lib/workout/format";
import { announceSet } from "@/lib/workout/speech";
import { useSpeech } from "@/lib/workout/use-speech";
import { enqueueOfflineSet, flushOfflineQueue, getQueuedSetCount } from "@/lib/workout/offline-queue";
import { RestTimerOverlay } from "./rest-timer-overlay";
import { TimedSetView } from "./timed-set-view";
import { RepsWeightSetView } from "./reps-weight-set-view";
import { SessionCompleteView } from "./session-complete-view";
import { SwapExerciseButton } from "./swap-exercise-button";
import type { ExerciseSummary, PlayerQueueItem } from "@/lib/workout/types";

function setKey(workoutExerciseId: string, setIndex: number): string {
  return `${workoutExerciseId}:${setIndex}`;
}

export function WorkoutPlayer({
  sessionId,
  workoutName,
  queue,
  initiallyCompletedKeys,
}: {
  sessionId: string;
  workoutName: string;
  queue: PlayerQueueItem[];
  initiallyCompletedKeys: string[];
}) {
  const router = useRouter();
  const { enabled: voiceEnabled, setEnabled: setVoiceEnabled, speak } = useSpeech();

  const startIndex = useMemo(() => {
    const done = new Set(initiallyCompletedKeys);
    const idx = queue.findIndex(
      (item) => !done.has(setKey(item.workoutExerciseId, item.set.setIndex)),
    );
    return idx === -1 ? queue.length : idx;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [index, setIndex] = useState(startIndex);
  const [resting, setResting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedReps, setEditedReps] = useState<number | null>(null);
  const [editedWeight, setEditedWeight] = useState<number | null>(null);
  const [editedDuration, setEditedDuration] = useState<number | null>(null);
  const [trackedKey, setTrackedKey] = useState<string | null>(null);
  const [prHits, setPrHits] = useState<string[]>([]);
  const [pendingSyncCount, setPendingSyncCount] = useState(getQueuedSetCount);
  // Exercise swaps only affect this playthrough — keyed by workoutExerciseId
  // so every set of that slot uses the substitute for the rest of the session.
  const [exerciseOverrides, setExerciseOverrides] = useState<Record<string, ExerciseSummary>>({});
  const lastAnnouncedExerciseId = useRef<string | null>(null);

  const rawCurrent = index < queue.length ? queue[index] : null;
  const rawNext = index + 1 < queue.length ? queue[index + 1] : null;
  const current = applyOverride(rawCurrent, exerciseOverrides);
  const next = applyOverride(rawNext, exerciseOverrides);

  // Reset the editable reps/weight/duration whenever the active set changes.
  const currentKey = current ? setKey(current.workoutExerciseId, current.set.setIndex) : null;
  if (currentKey !== trackedKey) {
    setTrackedKey(currentKey);
    setEditedReps(current?.set.reps ?? null);
    setEditedWeight(current?.set.weight ?? null);
    setEditedDuration(current?.set.durationSeconds ?? null);
  }

  useEffect(() => {
    if (!current || resting) return;
    const isNewExercise = lastAnnouncedExerciseId.current !== current.exercise.id;
    lastAnnouncedExerciseId.current = current.exercise.id;
    speak(announceSet(current, isNewExercise));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentKey, current?.exercise.id, resting]);

  // Sync anything logged while offline as soon as we're back, and once on mount.
  useEffect(() => {
    function flush() {
      flushOfflineQueue(recordCompletedSet).then((synced) => {
        if (synced > 0) setPendingSyncCount(getQueuedSetCount());
      });
    }
    flush();
    window.addEventListener("online", flush);
    return () => window.removeEventListener("online", flush);
  }, []);

  async function persistSet(item: PlayerQueueItem, skipped: boolean): Promise<boolean> {
    const isTimedItem = item.set.durationSeconds != null;
    const input: RecordSetInput = {
      sessionId,
      workoutExerciseId: item.workoutExerciseId,
      exerciseId: item.exercise.id,
      setIndex: item.set.setIndex,
      reps: isTimedItem ? null : (editedReps ?? item.set.reps),
      weight: isTimedItem ? null : (editedWeight ?? item.set.weight),
      weightUnit: item.set.weightUnit,
      durationSeconds: isTimedItem ? (editedDuration ?? item.set.durationSeconds) : null,
      distance: item.set.distance,
      side: item.set.side,
      skipped,
    };

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      enqueueOfflineSet(input);
      setPendingSyncCount(getQueuedSetCount());
      return false;
    }

    try {
      const result = await recordCompletedSet(input);
      if ("error" in result) throw new Error(result.error);
      return result.isPersonalRecord;
    } catch {
      enqueueOfflineSet(input);
      setPendingSyncCount(getQueuedSetCount());
      return false;
    }
  }

  function advance() {
    if (current?.restSecondsAfter && next) {
      setResting(true);
      return;
    }
    setIndex((i) => i + 1);
  }

  async function handleComplete(skipped = false) {
    if (!current || isSaving) return;
    setIsSaving(true);
    const isPersonalRecord = await persistSet(current, skipped);
    setIsSaving(false);

    if (isPersonalRecord) {
      setPrHits((prev) => [...prev, current.exercise.name]);
      speak("New personal record!");
      setTimeout(advance, 1400);
    } else {
      advance();
    }
  }

  function handleRestDone() {
    setResting(false);
    setIndex((i) => i + 1);
  }

  function handleBack() {
    setIndex((i) => Math.max(0, i - 1));
  }

  function handleSwap(exercise: ExerciseSummary) {
    if (!rawCurrent) return;
    setExerciseOverrides((prev) => ({ ...prev, [rawCurrent.workoutExerciseId]: exercise }));
    lastAnnouncedExerciseId.current = null;
  }

  function handleListenHowTo() {
    if (!current) return;
    speak(current.exercise.instructions ? current.exercise.instructions : current.exercise.name);
  }

  if (!current) {
    return (
      <SessionCompleteView
        sessionId={sessionId}
        workoutName={workoutName}
        prHits={prHits}
        speak={speak}
      />
    );
  }

  if (resting && current.restSecondsAfter && next) {
    return (
      <RestTimerOverlay
        seconds={current.restSecondsAfter}
        nextExerciseName={next.exercise.name}
        onDone={handleRestDone}
        speak={speak}
      />
    );
  }

  const isTimed = current.set.durationSeconds != null;
  const progressPct = Math.round((index / queue.length) * 100);

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex items-center gap-3 px-4 pt-4">
        <button
          aria-label="Pause and exit"
          onClick={() => router.push("/today")}
          className="flex size-9 items-center justify-center rounded-full hover:bg-muted"
        >
          <X className="size-5" />
        </button>
        <Progress value={progressPct} className="flex-1" />
        {pendingSyncCount > 0 && (
          <span
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground"
            title={`${pendingSyncCount} set${pendingSyncCount === 1 ? "" : "s"} will sync once you're back online`}
          >
            <CloudOff className="size-4" />
            {pendingSyncCount}
          </span>
        )}
        <button
          aria-label={voiceEnabled ? "Mute coach voice" : "Unmute coach voice"}
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
        >
          {voiceEnabled ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
        </button>
      </header>

      <div className="flex flex-1 flex-col px-6 pb-8 pt-6">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {current.sectionTitle}
          {current.repeatCount > 1 ? ` · Round ${current.repeatIndex + 1}/${current.repeatCount}` : ""}
        </p>
        <h1 className="mt-1 text-center text-2xl font-black">{current.exercise.name}</h1>
        <p className="mt-1 text-center text-sm font-medium text-muted-foreground">
          Set {current.setNumberInExercise} of {current.totalSetsInExercise}
          {" · "}
          {formatSetLine(current.set)}
        </p>

        <div className="mt-2 flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
            onClick={handleListenHowTo}
          >
            <Volume2 className="size-4" />
            How to
          </Button>
          <SwapExerciseButton exerciseId={current.exercise.id} onSwap={handleSwap} />
        </div>

        {isTimed ? (
          <TimedSetView
            key={currentKey}
            seconds={editedDuration ?? current.set.durationSeconds!}
            side={current.set.side}
            onComplete={() => handleComplete(false)}
            onSecondsChange={setEditedDuration}
            speak={speak}
          />
        ) : (
          <RepsWeightSetView
            key={currentKey}
            reps={editedReps}
            weight={editedWeight}
            weightUnit={current.set.weightUnit}
            onRepsChange={setEditedReps}
            onWeightChange={setEditedWeight}
          />
        )}

        {next && (
          <p className="mt-auto pt-4 text-center text-xs font-medium text-muted-foreground">
            Up next: {next.exercise.name}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 border-t border-border bg-card p-4">
        <Button variant="outline" size="icon" aria-label="Previous set" onClick={handleBack}>
          <Undo2 className="size-5" />
        </Button>
        <Button
          variant="ghost"
          className="gap-2 text-muted-foreground"
          disabled={isSaving}
          onClick={() => handleComplete(true)}
        >
          <SkipForward className="size-4" />
          Skip
        </Button>
        {!isTimed && (
          <Button size="lg" className="flex-1" disabled={isSaving} onClick={() => handleComplete(false)}>
            {isSaving ? "Saving…" : "Mark Complete"}
          </Button>
        )}
      </div>
    </div>
  );
}

function applyOverride(
  item: PlayerQueueItem | null,
  overrides: Record<string, ExerciseSummary>,
): PlayerQueueItem | null {
  if (!item) return null;
  const override = overrides[item.workoutExerciseId];
  return override ? { ...item, exercise: override } : item;
}
