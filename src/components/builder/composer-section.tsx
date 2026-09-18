"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { moveSection, removeSection, updateSection } from "@/lib/builder/actions";
import { sectionTypeLabel } from "@/lib/workout/display";
import { AddExerciseDialog } from "./add-exercise-dialog";
import { ComposerExerciseRow } from "./composer-exercise-row";
import type { ComposerSection as ComposerSectionType } from "@/lib/builder/queries";

export function ComposerSection({
  workoutId,
  section,
  isFirst,
  isLast,
}: {
  workoutId: string;
  section: ComposerSectionType;
  isFirst: boolean;
  isLast: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(section.title);
  const [repeatCount, setRepeatCount] = useState(section.repeatCount);

  function run(action: () => Promise<unknown>) {
    startTransition(async () => {
      await action();
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-border p-4">
      <div className="flex items-center gap-2">
        <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          {sectionTypeLabel(section.type)}
        </span>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => run(() => updateSection(workoutId, section.id, { title, repeatCount }))}
          className="h-9 flex-1"
        />
        <Button
          variant="ghost"
          size="icon"
          aria-label="Move section up"
          disabled={isFirst || isPending}
          onClick={() => run(() => moveSection(workoutId, section.id, "up"))}
        >
          <ArrowUp className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Move section down"
          disabled={isLast || isPending}
          onClick={() => run(() => moveSection(workoutId, section.id, "down"))}
        >
          <ArrowDown className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Remove section"
          className="text-danger"
          disabled={isPending}
          onClick={() => run(() => removeSection(workoutId, section.id))}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <label className="text-xs font-semibold text-muted-foreground" htmlFor={`repeat-${section.id}`}>
          Repeat
        </label>
        <Input
          id={`repeat-${section.id}`}
          type="number"
          min={1}
          value={repeatCount}
          onChange={(e) => setRepeatCount(Number(e.target.value))}
          onBlur={() => run(() => updateSection(workoutId, section.id, { title, repeatCount }))}
          className="h-8 w-16"
        />
        <span className="text-xs text-muted-foreground">round(s)</span>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {section.exercises.map((ex, i) => (
          <ComposerExerciseRow
            key={ex.id}
            workoutId={workoutId}
            sectionId={section.id}
            exercise={ex}
            isFirst={i === 0}
            isLast={i === section.exercises.length - 1}
          />
        ))}
      </div>

      <div className="mt-3">
        <AddExerciseDialog workoutId={workoutId} sectionId={section.id} />
      </div>
    </div>
  );
}
