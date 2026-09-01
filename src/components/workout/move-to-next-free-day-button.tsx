"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { moveWorkoutToNextFreeDay } from "@/lib/workout/actions";
import { formatShortDate } from "@/lib/date";

export function MoveToNextFreeDayButton({
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
  const [movedToIso, setMovedToIso] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await moveWorkoutToNextFreeDay(scheduledWorkoutId);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setMovedToIso(result.movedToIso);
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
        aria-label="Move to next free day"
        title="Move to next free day"
      >
        <CalendarClock className="size-4" />
        {size !== "icon" && (isPending ? "Moving…" : "Move to next free day")}
      </Button>
      {error && <p className="text-xs text-danger">{error}</p>}
      {movedToIso && !error && (
        <p className="text-xs text-success">Moved to {formatShortDate(movedToIso)}</p>
      )}
    </div>
  );
}
