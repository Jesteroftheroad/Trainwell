"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createWorkout } from "@/lib/builder/actions";
import type { WorkoutType } from "@/lib/supabase/database.types";

const TYPE_OPTIONS: WorkoutType[] = ["upper_body", "lower_body", "full_body", "cardio", "core", "mobility"];

export function NewWorkoutForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [workoutType, setWorkoutType] = useState<WorkoutType>("full_body");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreate() {
    setError(null);
    startTransition(async () => {
      const result = await createWorkout({ name, workoutType, estimatedDurationMinutes: null, description: "" });
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.push(`/builder/workouts/${result.workoutId}`);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="e.g. Push Day"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="min-w-40 flex-1"
        />
        <select
          value={workoutType}
          onChange={(e) => setWorkoutType(e.target.value as WorkoutType)}
          className="h-11 rounded-xl border border-input bg-card px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {t.replace("_", " ")}
            </option>
          ))}
        </select>
        <Button disabled={isPending} onClick={handleCreate}>
          {isPending ? "Creating…" : "New Workout"}
        </Button>
      </div>
      {error && <p className="text-sm font-medium text-danger">{error}</p>}
    </div>
  );
}
