import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getScheduledWorkoutDetail } from "@/lib/workout/queries";
import { SectionBlock } from "@/components/workout/section-block";
import { StartWorkoutButton } from "@/components/workout/start-workout-button";
import { RescheduleButton } from "@/components/workout/reschedule-button";

export default async function WorkoutPreviewPage({
  params,
}: {
  params: Promise<{ scheduledWorkoutId: string }>;
}) {
  const { scheduledWorkoutId } = await params;
  const scheduled = await getScheduledWorkoutDetail(scheduledWorkoutId);

  if (!scheduled) notFound();

  const { workout } = scheduled;

  return (
    <div className="mx-auto max-w-2xl pb-32">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur">
        <Link
          href="/workouts"
          aria-label="Back to workouts"
          className="flex size-9 items-center justify-center rounded-full hover:bg-muted"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="min-w-0 flex-1 truncate text-base font-bold">{workout.name}</h1>
        {scheduled.status === "scheduled" && (
          <RescheduleButton
            scheduledWorkoutId={scheduled.scheduledWorkoutId}
            currentDateIso={scheduled.scheduledDate}
            variant="ghost"
            size="icon"
          />
        )}
      </header>

      <div className="px-4 pt-4">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Workout Preview
        </p>
        {workout.estimatedDurationMinutes && (
          <p className="mt-1 text-sm text-muted-foreground">
            {workout.estimatedDurationMinutes} minutes · {workout.sections.length} sections
          </p>
        )}

        <div className="mt-5 flex flex-col gap-6">
          {workout.sections.map((section) => (
            <SectionBlock key={section.id} section={section} />
          ))}
        </div>
      </div>

      <StartWorkoutButton workoutId={workout.id} scheduledWorkoutId={scheduled.scheduledWorkoutId} />
    </div>
  );
}
