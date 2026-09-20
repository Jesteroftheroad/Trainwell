import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCurrentUserAndProfile } from "@/lib/profile/queries";
import {
  getActivationCodesForProgram,
  getProgramDetail,
  getProgramRoster,
  getWorkoutOptions,
} from "@/lib/builder/queries";
import { ProgramMetaForm } from "@/components/builder/program-meta-form";
import { PublishToggle } from "@/components/builder/publish-toggle";
import { AddWeekButton } from "@/components/builder/add-week-button";
import { DeleteProgramButton } from "@/components/builder/delete-program-button";
import { DaySelect } from "@/components/builder/day-select";
import { ActivationCodesPanel } from "@/components/builder/activation-codes-panel";
import { ProgramRoster } from "@/components/builder/program-roster";

export default async function ProgramEditPage({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const { programId } = await params;
  const { profile } = await getCurrentUserAndProfile();
  if (profile?.role !== "coach") redirect("/today");

  const [program, workoutOptions, activationCodes, roster] = await Promise.all([
    getProgramDetail(programId),
    getWorkoutOptions(),
    getActivationCodesForProgram(programId),
    getProgramRoster(programId),
  ]);
  if (!program) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-6">
      <div className="flex items-center gap-3">
        <Link
          href="/builder"
          aria-label="Back to plans"
          className="flex size-9 items-center justify-center rounded-full hover:bg-muted"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="min-w-0 flex-1 truncate text-xl font-black">{program.name}</h1>
        <PublishToggle programId={program.id} isPublished={program.isPublished} />
      </div>

      <div className="mt-6">
        <ProgramMetaForm
          programId={program.id}
          initialName={program.name}
          initialDescription={program.description}
        />
      </div>

      <div className="mt-8 flex flex-col gap-6">
        {program.weeks.map((week) => (
          <div key={week.id}>
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Week {week.weekNumber}
            </h2>
            <div className="grid grid-cols-7 gap-2">
              {week.days.map((day) => (
                <DaySelect
                  key={day.key}
                  programId={program.id}
                  weekId={week.id}
                  dayOfWeek={day.dayOfWeek}
                  workoutId={day.workoutId}
                  workoutOptions={workoutOptions}
                />
              ))}
            </div>
          </div>
        ))}

        <div>
          <AddWeekButton programId={program.id} />
          <p className="mt-1 text-xs text-muted-foreground">
            A plan with more than one week cycles through them in order, then repeats from Week 1.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">Clients</h2>
        <ProgramRoster roster={roster} />
      </div>

      <div className="mt-8">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Activation codes
        </h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Give a client one of these codes after they sign up and pick this plan — redeeming it schedules their
          next 3 months.
        </p>
        <ActivationCodesPanel programId={program.id} codes={activationCodes} />
      </div>

      <div className="mt-10 border-t border-border pt-4">
        <DeleteProgramButton programId={program.id} />
      </div>
    </div>
  );
}
