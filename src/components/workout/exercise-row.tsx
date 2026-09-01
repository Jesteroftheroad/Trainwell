"use client";

import { useState, useTransition } from "react";
import { ChevronRight, Dumbbell, Trophy, Volume2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatSetLine } from "@/lib/workout/format";
import { fetchExerciseHistory, type ExerciseHistoryEntry } from "@/lib/workout/actions";
import { useSpeech } from "@/lib/workout/use-speech";
import { titleCase } from "@/lib/utils";
import type { WorkoutExerciseInstance } from "@/lib/workout/types";

export function ExerciseRow({ instance }: { instance: WorkoutExerciseInstance }) {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<ExerciseHistoryEntry[] | null>(null);
  const [isPending, startTransition] = useTransition();
  const { speak } = useSpeech();

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next && history === null) {
      startTransition(async () => {
        const result = await fetchExerciseHistory(instance.exercise.id);
        setHistory(result);
      });
    }
  }

  function handleListen(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    const description = instance.exercise.instructions
      ? `${instance.exercise.name}. ${instance.exercise.instructions}`
      : instance.exercise.name;
    speak(description);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <div className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-colors hover:bg-muted/60">
        <DialogTrigger asChild>
          <button className="flex min-w-0 flex-1 items-center gap-3 text-left">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Dumbbell className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">
                {instance.exercise.name}
                {instance.side !== "none" && instance.side !== "alternating" && (
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    ({instance.side})
                  </span>
                )}
              </p>
              {instance.notes && <p className="text-xs italic text-primary">{instance.notes}</p>}
              <div className="mt-0.5 flex flex-col text-xs text-muted-foreground">
                {instance.sets.map((set, idx) => (
                  <span key={set.id ?? idx}>{formatSetLine(set)}</span>
                ))}
              </div>
            </div>
          </button>
        </DialogTrigger>
        <button
          onClick={handleListen}
          aria-label={`Listen to how to perform ${instance.exercise.name}`}
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Volume2 className="size-5" />
        </button>
        <DialogTrigger asChild>
          <button aria-label={`View ${instance.exercise.name} details`} className="shrink-0">
            <ChevronRight className="size-5 text-muted-foreground" />
          </button>
        </DialogTrigger>
      </div>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{instance.exercise.name}</DialogTitle>
          <DialogDescription>{titleCase(instance.exercise.category)}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-1.5">
          {instance.exercise.equipment.map((eq) => (
            <Badge key={eq} variant="muted">
              {titleCase(eq)}
            </Badge>
          ))}
          {instance.exercise.primaryMuscles.map((m) => (
            <Badge key={m}>{titleCase(m)}</Badge>
          ))}
        </div>

        {instance.exercise.instructions && (
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                How to perform it
              </h4>
              <Button variant="ghost" size="sm" className="gap-1.5 text-primary" onClick={handleListen}>
                <Volume2 className="size-4" />
                Listen
              </Button>
            </div>
            <p className="mt-1 text-sm">{instance.exercise.instructions}</p>
          </div>
        )}

        {instance.exercise.commonMistakes && (
          <div className="mt-4">
            <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Common mistakes
            </h4>
            <p className="mt-1 text-sm">{instance.exercise.commonMistakes}</p>
          </div>
        )}

        <div className="mt-4">
          <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Prescribed today
          </h4>
          <div className="mt-1 flex flex-col text-sm">
            {instance.sets.map((set, idx) => (
              <span key={set.id ?? idx}>{formatSetLine(set)}</span>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Your last sets
          </h4>
          {isPending && <p className="mt-1 text-sm text-muted-foreground">Loading…</p>}
          {!isPending && history && history.length === 0 && (
            <p className="mt-1 text-sm text-muted-foreground">
              No history yet — this will fill in after your first session.
            </p>
          )}
          {!isPending && history && history.length > 0 && (
            <div className="mt-1 flex flex-col text-sm">
              {history.slice(0, 6).map((h) => (
                <span key={h.id} className="flex items-center gap-1.5">
                  {h.isPersonalRecord && (
                    <Trophy className="size-3.5 shrink-0 text-warning" aria-label="Personal record" />
                  )}
                  {h.weight != null && h.reps != null
                    ? `${h.reps} reps with ${h.weight} ${h.weightUnit}`
                    : h.durationSeconds != null
                      ? `${h.durationSeconds}s`
                      : h.reps != null
                        ? `${h.reps} reps`
                        : "—"}
                  <span className="ml-1 text-xs text-muted-foreground">
                    {new Date(h.completedAt).toLocaleDateString()}
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
