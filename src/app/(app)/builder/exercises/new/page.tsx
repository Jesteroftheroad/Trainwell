import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCurrentUserAndProfile } from "@/lib/profile/queries";
import { ExerciseForm } from "@/components/builder/exercise-form";

export default async function NewExercisePage() {
  const { profile } = await getCurrentUserAndProfile();
  if (profile?.role !== "coach") redirect("/today");

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
        <h1 className="text-xl font-black">New Exercise</h1>
      </div>
      <div className="mt-6">
        <ExerciseForm />
      </div>
    </div>
  );
}
