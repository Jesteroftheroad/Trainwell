import { CheckCircle2 } from "lucide-react";
import { WORKOUT_TYPE_ICON } from "@/lib/workout/display";
import type { CompletedWorkoutSummary } from "@/lib/workout/queries";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatDuration(seconds: number | null): string | null {
  if (!seconds) return null;
  const minutes = Math.round(seconds / 60);
  return `${minutes} min`;
}

export function CompletedWorkoutRow({ session }: { session: CompletedWorkoutSummary }) {
  const Icon = WORKOUT_TYPE_ICON[session.workoutType] ?? CheckCircle2;
  const duration = formatDuration(session.totalDurationSeconds);

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-success-soft text-success">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">{session.workoutName}</p>
        <p className="text-xs text-muted-foreground">
          {formatDate(session.completedAt)}
          {duration ? ` · ${duration}` : ""}
        </p>
      </div>
      <CheckCircle2 className="size-5 shrink-0 text-success" />
    </div>
  );
}
