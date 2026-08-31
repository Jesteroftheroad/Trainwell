"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { startWorkoutSession } from "@/lib/workout/actions";

export function StartWorkoutButton({
  workoutId,
  scheduledWorkoutId,
}: {
  workoutId: string;
  scheduledWorkoutId?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleStart() {
    setError(null);
    startTransition(async () => {
      const result = await startWorkoutSession({ workoutId, scheduledWorkoutId });
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.push(`/session/${result.sessionId}`);
    });
  }

  return (
    <div className="fixed inset-x-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-30 border-t border-border bg-card/95 p-4 backdrop-blur md:bottom-0 md:left-64">
      {error && <p className="mb-2 text-center text-sm font-medium text-danger">{error}</p>}
      <Button size="lg" className="w-full" disabled={isPending} onClick={handleStart}>
        {isPending ? "Starting…" : "Start Workout"}
      </Button>
    </div>
  );
}
