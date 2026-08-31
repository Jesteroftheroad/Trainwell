"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { moveWorkoutToTomorrow } from "@/lib/workout/actions";

export function MoveToTomorrowButton({
  scheduledWorkoutId,
  variant = "outline",
  size = "sm",
}: {
  scheduledWorkoutId: string;
  variant?: "outline" | "ghost";
  size?: "sm" | "icon";
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await moveWorkoutToTomorrow(scheduledWorkoutId);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant={variant}
        size={size}
        disabled={isPending}
        onClick={handleClick}
        aria-label="Move to tomorrow"
      >
        <CalendarClock className="size-4" />
        {size !== "icon" && (isPending ? "Moving…" : "Move to tomorrow")}
      </Button>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
