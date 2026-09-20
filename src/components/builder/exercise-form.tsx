"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { createExercise, deleteExercise, updateExercise, type ExerciseInput } from "@/lib/builder/actions";
import type { ExerciseLibraryItem } from "@/lib/builder/queries";
import type { DefaultUnit, ExerciseCategory } from "@/lib/supabase/database.types";

const CATEGORY_OPTIONS: ExerciseCategory[] = ["strength", "mobility", "warmup", "cardio", "stretching", "core"];
const UNIT_OPTIONS: DefaultUnit[] = ["lb", "kg", "bodyweight", "time", "distance"];

function toFormState(exercise?: ExerciseLibraryItem): ExerciseInput {
  return {
    name: exercise?.name ?? "",
    category: exercise?.category ?? "strength",
    equipment: exercise?.equipment.join(", ") ?? "",
    primaryMuscles: exercise?.primaryMuscles.join(", ") ?? "",
    secondaryMuscles: exercise?.secondaryMuscles.join(", ") ?? "",
    instructions: exercise?.instructions ?? "",
    commonMistakes: exercise?.commonMistakes ?? "",
    defaultUnit: exercise?.defaultUnit ?? "lb",
    mediaUrl: exercise?.mediaUrl ?? "",
    thumbnailUrl: exercise?.thumbnailUrl ?? "",
  };
}

export function ExerciseForm({ exerciseId, exercise }: { exerciseId?: string; exercise?: ExerciseLibraryItem }) {
  const router = useRouter();
  const [form, setForm] = useState<ExerciseInput>(() => toFormState(exercise));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function set<K extends keyof ExerciseInput>(key: K, value: ExerciseInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = exerciseId ? await updateExercise(exerciseId, form) : await createExercise(form);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.push("/builder/exercises");
      router.refresh();
    });
  }

  function handleDelete() {
    if (!exerciseId) return;
    if (!confirm("Delete this exercise? This can't be undone.")) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteExercise(exerciseId);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.push("/builder/exercises");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ex-name">Name</Label>
        <Input id="ex-name" value={form.name} onChange={(e) => set("name", e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ex-category">Category</Label>
          <select
            id="ex-category"
            value={form.category}
            onChange={(e) => set("category", e.target.value as ExerciseCategory)}
            className="h-11 w-full rounded-xl border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ex-unit">Default unit</Label>
          <select
            id="ex-unit"
            value={form.defaultUnit}
            onChange={(e) => set("defaultUnit", e.target.value as DefaultUnit)}
            className="h-11 w-full rounded-xl border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {UNIT_OPTIONS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ex-primary">Primary muscles (comma separated)</Label>
        <Input
          id="ex-primary"
          placeholder="e.g. chest, triceps"
          value={form.primaryMuscles}
          onChange={(e) => set("primaryMuscles", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ex-secondary">Secondary muscles (optional)</Label>
        <Input
          id="ex-secondary"
          placeholder="e.g. shoulders"
          value={form.secondaryMuscles}
          onChange={(e) => set("secondaryMuscles", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ex-equipment">Equipment (comma separated)</Label>
        <Input
          id="ex-equipment"
          placeholder="e.g. dumbbell, bench"
          value={form.equipment}
          onChange={(e) => set("equipment", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ex-instructions">Instructions</Label>
        <textarea
          id="ex-instructions"
          rows={3}
          value={form.instructions}
          onChange={(e) => set("instructions", e.target.value)}
          className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ex-mistakes">Common mistakes (optional)</Label>
        <textarea
          id="ex-mistakes"
          rows={2}
          value={form.commonMistakes}
          onChange={(e) => set("commonMistakes", e.target.value)}
          className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ex-media">Video URL (optional)</Label>
          <Input id="ex-media" value={form.mediaUrl} onChange={(e) => set("mediaUrl", e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ex-thumb">Thumbnail URL (optional)</Label>
          <Input id="ex-thumb" value={form.thumbnailUrl} onChange={(e) => set("thumbnailUrl", e.target.value)} />
        </div>
      </div>

      {error && <p className="text-sm font-medium text-danger">{error}</p>}

      <Button size="lg" disabled={isPending} onClick={handleSave}>
        {isPending ? "Saving…" : exerciseId ? "Save changes" : "Add exercise"}
      </Button>

      {exerciseId && (
        <Button variant="ghost" className="gap-1.5 text-danger" disabled={isPending} onClick={handleDelete}>
          <Trash2 className="size-4" />
          Delete exercise
        </Button>
      )}
    </div>
  );
}
