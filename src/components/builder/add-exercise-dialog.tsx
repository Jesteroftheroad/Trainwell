"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { addExerciseToSection, fetchExerciseLibrary } from "@/lib/builder/actions";
import type { ExerciseLibraryItem } from "@/lib/builder/queries";

export function AddExerciseDialog({ workoutId, sectionId }: { workoutId: string; sectionId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [exercises, setExercises] = useState<ExerciseLibraryItem[] | null>(null);
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next && exercises === null) {
      startTransition(async () => {
        setExercises(await fetchExerciseLibrary());
      });
    }
  }

  function handlePick(exerciseId: string) {
    startTransition(async () => {
      await addExerciseToSection(workoutId, sectionId, exerciseId);
      setOpen(false);
      router.refresh();
    });
  }

  const q = query.trim().toLowerCase();
  const filtered = (exercises ?? []).filter(
    (e) => !q || e.name.toLowerCase().includes(q) || e.category.includes(q),
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleOpenChange(true)}>
        <Plus className="size-4" />
        Add exercise
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add an exercise</DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Search the library…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mb-3"
        />

        {exercises === null && <p className="text-sm text-muted-foreground">Loading…</p>}

        <div className="flex max-h-[50vh] flex-col gap-1.5 overflow-y-auto">
          {filtered.map((ex) => (
            <button
              key={ex.id}
              type="button"
              disabled={isPending}
              onClick={() => handlePick(ex.id)}
              className="flex flex-col rounded-xl border border-border p-3 text-left transition-colors hover:bg-muted disabled:opacity-50"
            >
              <span className="text-sm font-bold">{ex.name}</span>
              <span className="text-xs text-muted-foreground">
                {ex.category} · {ex.primaryMuscles.join(", ")}
              </span>
            </button>
          ))}
          {exercises !== null && filtered.length === 0 && (
            <p className="text-sm text-muted-foreground">No exercises match — add one to the library first.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
