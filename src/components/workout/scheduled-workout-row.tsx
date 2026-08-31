import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { WORKOUT_TYPE_ICON } from "@/lib/workout/display";
import { VoiceGuidedBadge } from "./voice-guided-badge";
import type { ScheduledWorkoutSummary } from "@/lib/workout/types";

export function ScheduledWorkoutRow({ workout }: { workout: ScheduledWorkoutSummary }) {
  const Icon = WORKOUT_TYPE_ICON[workout.workoutType];

  return (
    <Link
      href={`/workouts/${workout.scheduledWorkoutId}`}
      className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted/60"
    >
      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-accent-foreground">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">{workout.workoutName}</p>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          {workout.estimatedDurationMinutes && <span>{workout.estimatedDurationMinutes} mins</span>}
          <VoiceGuidedBadge />
        </p>
      </div>
      <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
    </Link>
  );
}
