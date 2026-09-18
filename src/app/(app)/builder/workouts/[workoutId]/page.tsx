import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCurrentUserAndProfile } from "@/lib/profile/queries";
import { getWorkoutComposerDetail } from "@/lib/builder/queries";
import { WorkoutMetaForm } from "@/components/builder/workout-meta-form";
import { ComposerSection } from "@/components/builder/composer-section";
import { AddSectionButton } from "@/components/builder/add-section-button";
import { DeleteWorkoutButton } from "@/components/builder/delete-workout-button";

export default async function WorkoutComposerPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { workoutId } = await params;
  const { profile } = await getCurrentUserAndProfile();
  if (profile?.role !== "coach") redirect("/today");

  const workout = await getWorkoutComposerDetail(workoutId);
  if (!workout) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-6">
      <div className="flex items-center gap-3">
        <Link
          href="/builder/workouts"
          aria-label="Back to workouts"
          className="flex size-9 items-center justify-center rounded-full hover:bg-muted"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="min-w-0 flex-1 truncate text-xl font-black">{workout.name}</h1>
      </div>

      <div className="mt-6">
        <WorkoutMetaForm workoutId={workout.id} initial={workout} />
      </div>

      <div className="mt-8 flex flex-col gap-4">
        {workout.sections.map((section, i) => (
          <ComposerSection
            key={section.id}
            workoutId={workout.id}
            section={section}
            isFirst={i === 0}
            isLast={i === workout.sections.length - 1}
          />
        ))}
      </div>

      <div className="mt-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Add a section</p>
        <AddSectionButton workoutId={workout.id} />
      </div>

      <div className="mt-10 border-t border-border pt-4">
        <DeleteWorkoutButton workoutId={workout.id} />
      </div>
    </div>
  );
}
