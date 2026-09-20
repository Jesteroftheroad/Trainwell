import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentUserAndProfile } from "@/lib/profile/queries";
import { getExerciseLibrary } from "@/lib/builder/queries";
import { ExerciseLibraryList } from "@/components/builder/exercise-library-list";

export default async function ExerciseLibraryPage() {
  const { profile } = await getCurrentUserAndProfile();
  if (profile?.role !== "coach") redirect("/today");

  const exercises = await getExerciseLibrary();

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
        <h1 className="flex-1 text-xl font-black">Exercise Library</h1>
        <Button asChild size="sm" className="gap-1.5">
          <Link href="/builder/exercises/new">
            <Plus className="size-4" />
            New
          </Link>
        </Button>
      </div>

      <div className="mt-6">
        <ExerciseLibraryList exercises={exercises} />
      </div>
    </div>
  );
}
