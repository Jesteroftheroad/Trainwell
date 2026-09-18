"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateWorkoutMeta, type WorkoutMetaInput } from "@/lib/builder/actions";
import type { WorkoutType } from "@/lib/supabase/database.types";

const TYPE_OPTIONS: WorkoutType[] = ["upper_body", "lower_body", "full_body", "cardio", "core", "mobility"];

export function WorkoutMetaForm({
  workoutId,
  initial,
}: {
  workoutId: string;
  initial: {
    name: string;
    workoutType: WorkoutType;
    estimatedDurationMinutes: number | null;
    description: string | null;
  };
}) {
  const [form, setForm] = useState<WorkoutMetaInput>({
    name: initial.name,
    workoutType: initial.workoutType,
    estimatedDurationMinutes: initial.estimatedDurationMinutes,
    description: initial.description ?? "",
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function set<K extends keyof WorkoutMetaInput>(key: K, value: WorkoutMetaInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await updateWorkoutMeta(workoutId, form);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setSaved(true);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="w-name">Name</Label>
          <Input id="w-name" value={form.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="w-type">Type</Label>
          <select
            id="w-type"
            value={form.workoutType}
            onChange={(e) => set("workoutType", e.target.value as WorkoutType)}
            className="h-11 rounded-xl border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="w-duration">Estimated duration (minutes)</Label>
        <Input
          id="w-duration"
          type="number"
          min={0}
          value={form.estimatedDurationMinutes ?? ""}
          onChange={(e) => set("estimatedDurationMinutes", e.target.value === "" ? null : Number(e.target.value))}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="w-description">Description</Label>
        <Input id="w-description" value={form.description} onChange={(e) => set("description", e.target.value)} />
      </div>

      <div className="flex items-center gap-3">
        <Button size="sm" disabled={isPending} onClick={handleSave}>
          {isPending ? "Saving…" : "Save"}
        </Button>
        {saved && <span className="text-sm font-medium text-success">Saved</span>}
        {error && <span className="text-sm font-medium text-danger">{error}</span>}
      </div>
    </div>
  );
}
