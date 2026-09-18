"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteWorkout } from "@/lib/builder/actions";

export function DeleteWorkoutButton({ workoutId }: { workoutId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("Delete this workout? This can't be undone.")) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteWorkout(workoutId);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.push("/builder/workouts");
    });
  }

  return (
    <div>
      <Button variant="ghost" size="sm" className="gap-1.5 text-danger" disabled={isPending} onClick={handleClick}>
        <Trash2 className="size-4" />
        Delete workout
      </Button>
      {error && <p className="mt-1 text-sm font-medium text-danger">{error}</p>}
    </div>
  );
}
