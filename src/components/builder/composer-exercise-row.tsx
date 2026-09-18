"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addSet, moveExercise, removeExercise, removeSet, setExerciseRest, updateSet } from "@/lib/builder/actions";
import type { ComposerExercise } from "@/lib/builder/queries";

export function ComposerExerciseRow({
  workoutId,
  sectionId,
  exercise,
  isFirst,
  isLast,
}: {
  workoutId: string;
  sectionId: string;
  exercise: ComposerExercise;
  isFirst: boolean;
  isLast: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rest, setRest] = useState(exercise.restSeconds ?? 0);

  function run(action: () => Promise<unknown>) {
    startTransition(async () => {
      await action();
      router.refresh();
    });
  }

  return (
    <div className="rounded-xl border border-border p-3">
      <div className="flex items-center gap-1">
        <p className="min-w-0 flex-1 truncate text-sm font-bold">{exercise.exerciseName}</p>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Move up"
          disabled={isFirst || isPending}
          onClick={() => run(() => moveExercise(workoutId, sectionId, exercise.id, "up"))}
        >
          <ArrowUp className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Move down"
          disabled={isLast || isPending}
          onClick={() => run(() => moveExercise(workoutId, sectionId, exercise.id, "down"))}
        >
          <ArrowDown className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Remove exercise"
          className="text-danger"
          disabled={isPending}
          onClick={() => run(() => removeExercise(workoutId, exercise.id))}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <label className="text-xs font-semibold text-muted-foreground" htmlFor={`rest-${exercise.id}`}>
          Rest between sets (sec)
        </label>
        <Input
          id={`rest-${exercise.id}`}
          type="number"
          min={0}
          className="h-8 w-20"
          value={rest}
          onChange={(e) => setRest(Number(e.target.value))}
          onBlur={() => run(() => setExerciseRest(workoutId, exercise.id, rest || null))}
        />
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <div className="flex items-center gap-2 pl-6 text-[11px] font-semibold uppercase text-muted-foreground">
          <span className="w-20">Reps</span>
          <span className="w-20">Weight</span>
          <span className="w-24">Seconds</span>
        </div>
        {exercise.sets.map((set, i) => (
          <div key={set.id} className="flex items-center gap-2">
            <span className="w-5 shrink-0 text-xs font-bold text-muted-foreground">{i + 1}</span>
            <Input
              type="number"
              placeholder="Reps"
              defaultValue={set.reps ?? ""}
              className="h-8 w-20"
              onBlur={(e) =>
                run(() =>
                  updateSet(workoutId, set.id, {
                    reps: e.target.value === "" ? null : Number(e.target.value),
                    weight: set.weight,
                    durationSeconds: set.durationSeconds,
                  }),
                )
              }
            />
            <Input
              type="number"
              placeholder="Weight"
              defaultValue={set.weight ?? ""}
              className="h-8 w-20"
              onBlur={(e) =>
                run(() =>
                  updateSet(workoutId, set.id, {
                    reps: set.reps,
                    weight: e.target.value === "" ? null : Number(e.target.value),
                    durationSeconds: set.durationSeconds,
                  }),
                )
              }
            />
            <Input
              type="number"
              placeholder="Seconds"
              defaultValue={set.durationSeconds ?? ""}
              className="h-8 w-24"
              onBlur={(e) =>
                run(() =>
                  updateSet(workoutId, set.id, {
                    reps: set.reps,
                    weight: set.weight,
                    durationSeconds: e.target.value === "" ? null : Number(e.target.value),
                  }),
                )
              }
            />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Remove set"
              className="text-danger"
              disabled={isPending}
              onClick={() => run(() => removeSet(workoutId, set.id))}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        ))}
        <Button
          variant="ghost"
          size="sm"
          className="w-fit gap-1.5 text-muted-foreground"
          disabled={isPending}
          onClick={() => run(() => addSet(workoutId, exercise.id))}
        >
          <Plus className="size-3.5" />
          Add set
        </Button>
      </div>
    </div>
  );
}
