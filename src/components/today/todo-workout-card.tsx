import Link from "next/link";
import { ChevronRight, CheckCircle2, Moon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RescheduleButton } from "@/components/workout/reschedule-button";
import { VoiceGuidedBadge } from "@/components/workout/voice-guided-badge";
import { WORKOUT_TYPE_ICON, WORKOUT_TYPE_LABEL } from "@/lib/workout/display";
import type { ScheduledWorkoutSummary } from "@/lib/workout/types";

export function TodoWorkoutCard({ workout }: { workout: ScheduledWorkoutSummary | null }) {
  if (!workout) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
            <Moon className="size-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            No workouts scheduled today. Take time to rest and recharge.
          </p>
        </CardContent>
      </Card>
    );
  }

  const Icon = WORKOUT_TYPE_ICON[workout.workoutType];
  const isCompleted = workout.status === "completed";

  return (
    <Card className={isCompleted ? "border-success/30 bg-success-soft/40" : undefined}>
      <CardContent className="flex items-center gap-3 p-4">
        <div
          className={
            isCompleted
              ? "flex size-12 shrink-0 items-center justify-center rounded-xl bg-success-soft text-success"
              : "flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-accent-foreground"
          }
        >
          {isCompleted ? <CheckCircle2 className="size-6" /> : <Icon className="size-6" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold">{workout.workoutName}</p>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            {isCompleted ? (
              <span className="font-semibold text-success">Workout completed</span>
            ) : (
              <>
                <span>
                  {WORKOUT_TYPE_LABEL[workout.workoutType]}
                  {workout.estimatedDurationMinutes ? ` · ${workout.estimatedDurationMinutes} min` : ""}
                </span>
                <VoiceGuidedBadge />
              </>
            )}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {workout.status === "scheduled" && (
            <RescheduleButton
              scheduledWorkoutId={workout.scheduledWorkoutId}
              currentDateIso={workout.scheduledDate}
              variant="ghost"
              size="icon"
            />
          )}
          <Button asChild size="sm" variant={isCompleted ? "outline" : "default"}>
            <Link href={`/workouts/${workout.scheduledWorkoutId}`}>
              {isCompleted ? "Do it again" : "Start"}
              <ChevronRight className="size-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
