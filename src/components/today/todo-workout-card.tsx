import Link from "next/link";
import { ChevronRight, Moon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoveToTomorrowButton } from "@/components/workout/move-to-tomorrow-button";
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

  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-accent-foreground">
          <Icon className="size-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold">{workout.workoutName}</p>
          <p className="text-sm text-muted-foreground">
            {WORKOUT_TYPE_LABEL[workout.workoutType]}
            {workout.estimatedDurationMinutes ? ` · ${workout.estimatedDurationMinutes} min` : ""}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <MoveToTomorrowButton
            scheduledWorkoutId={workout.scheduledWorkoutId}
            variant="ghost"
            size="icon"
          />
          <Button asChild size="sm">
            <Link href={`/workouts/${workout.scheduledWorkoutId}`}>
              Start
              <ChevronRight className="size-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
