"use client";

import { useState, useTransition } from "react";
import { Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { titleCase } from "@/lib/utils";
import { fetchAlternativeExercises } from "@/lib/workout/actions";
import type { ExerciseSummary } from "@/lib/workout/types";

export function SwapExerciseButton({
  exerciseId,
  onSwap,
}: {
  exerciseId: string;
  onSwap: (exercise: ExerciseSummary) => void;
}) {
  const [open, setOpen] = useState(false);
  const [alternatives, setAlternatives] = useState<ExerciseSummary[] | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setAlternatives(null);
      startTransition(async () => {
        setAlternatives(await fetchAlternativeExercises(exerciseId));
      });
    }
  }

  function handlePick(exercise: ExerciseSummary) {
    onSwap(exercise);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 text-muted-foreground"
        onClick={() => handleOpenChange(true)}
      >
        <Repeat className="size-4" />
        Swap
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Swap this exercise</DialogTitle>
          <DialogDescription>
            Same target muscles, in case you need a different setup — for the rest of this
            session only.
          </DialogDescription>
        </DialogHeader>

        {isPending && <p className="text-sm text-muted-foreground">Finding alternatives…</p>}
        {!isPending && alternatives && alternatives.length === 0 && (
          <p className="text-sm text-muted-foreground">No alternatives found for this exercise yet.</p>
        )}
        {!isPending && alternatives && alternatives.length > 0 && (
          <div className="flex flex-col gap-2">
            {alternatives.map((alt) => (
              <button
                key={alt.id}
                onClick={() => handlePick(alt)}
                className="flex flex-col rounded-xl border border-border p-3 text-left transition-colors hover:bg-muted"
              >
                <span className="text-sm font-bold">{alt.name}</span>
                <span className="text-xs text-muted-foreground">
                  {alt.equipment.map(titleCase).join(", ") || "Bodyweight"}
                </span>
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
