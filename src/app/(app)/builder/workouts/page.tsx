import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getCurrentUserAndProfile } from "@/lib/profile/queries";
import { getCoachWorkouts } from "@/lib/builder/queries";
import { NewWorkoutForm } from "@/components/builder/new-workout-form";
import { WORKOUT_TYPE_LABEL } from "@/lib/workout/display";

export default async function CoachWorkoutsPage() {
  const { userId, profile } = await getCurrentUserAndProfile();
  if (profile?.role !== "coach") redirect("/today");

  const workouts = await getCoachWorkouts(userId);

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-6">
      <div className="flex items-center gap-3">
        <Link
          href="/builder"
          aria-label="Back to builder"
          className="flex size-9 items-center justify-center rounded-full hover:bg-muted"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="text-xl font-black">Workouts</h1>
      </div>

      <div className="mt-6">
        <NewWorkoutForm />
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {workouts.length === 0 && (
          <p className="text-sm text-muted-foreground">No workouts yet — create your first one above.</p>
        )}
        {workouts.map((w) => (
          <Link key={w.id} href={`/builder/workouts/${w.id}`}>
            <Card className="flex items-center gap-3 p-4 transition-colors hover:bg-muted">
              <div className="min-w-0 flex-1">
                <p className="font-bold">{w.name}</p>
                <p className="text-sm text-muted-foreground">
                  {WORKOUT_TYPE_LABEL[w.workoutType]}
                  {w.estimatedDurationMinutes ? ` · ${w.estimatedDurationMinutes} min` : ""}
                </p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
