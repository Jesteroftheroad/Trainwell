"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setProgramDay } from "@/lib/builder/actions";
import type { WorkoutOption } from "@/lib/builder/queries";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function DaySelect({
  programId,
  weekId,
  dayOfWeek,
  workoutId,
  workoutOptions,
}: {
  programId: string;
  weekId: string;
  dayOfWeek: number;
  workoutId: string | null;
  workoutOptions: WorkoutOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value || null;
    startTransition(async () => {
      await setProgramDay(programId, weekId, dayOfWeek, value);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-center text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {DAY_LABELS[dayOfWeek]}
      </span>
      <select
        value={workoutId ?? ""}
        onChange={handleChange}
        disabled={isPending}
        className="h-11 w-full rounded-xl border border-input bg-card px-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
      >
        <option value="">Rest</option>
        {workoutOptions.map((w) => (
          <option key={w.id} value={w.id}>
            {w.name}
          </option>
        ))}
      </select>
    </div>
  );
}
