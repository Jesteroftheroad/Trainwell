import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCurrentUserAndProfile } from "@/lib/profile/queries";
import { getExerciseById } from "@/lib/builder/queries";
import { ExerciseForm } from "@/components/builder/exercise-form";

export default async function EditExercisePage({
  params,
}: {
  params: Promise<{ exerciseId: string }>;
}) {
  const { exerciseId } = await params;
  const { profile } = await getCurrentUserAndProfile();
  if (profile?.role !== "coach") redirect("/today");

  const exercise = await getExerciseById(exerciseId);
  if (!exercise) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-6">
      <div className="flex items-center gap-3">
        <Link
          href="/builder/exercises"
          aria-label="Back to exercise library"
          className="flex size-9 items-center justify-center rounded-full hover:bg-muted"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="truncate text-xl font-black">{exercise.name}</h1>
      </div>
      <div className="mt-6">
        <ExerciseForm exerciseId={exercise.id} exercise={exercise} />
      </div>
    </div>
  );
}
