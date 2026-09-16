import { Card } from "@/components/ui/card";
import { getCurrentUserAndProfile } from "@/lib/profile/queries";
import { getCurrentEnrollment, getPublishedPrograms } from "@/lib/programs/queries";
import { ChoosePlanButton } from "@/components/programs/choose-plan-button";

export default async function PlansPage() {
  const { userId } = await getCurrentUserAndProfile();
  const [programs, enrollment] = await Promise.all([getPublishedPrograms(), getCurrentEnrollment(userId)]);

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-6">
      <h1 className="text-2xl font-black">Choose your plan</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Pick a workout plan to start your journey. Your schedule is generated the moment you choose one.
      </p>

      {programs.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">No plans are published yet — check back soon.</p>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {programs.map((program) => (
          <Card key={program.id} className="flex items-center justify-between gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="font-bold">{program.name}</p>
              {program.description && <p className="text-sm text-muted-foreground">{program.description}</p>}
            </div>
            <ChoosePlanButton programId={program.id} isCurrent={enrollment?.programId === program.id} />
          </Card>
        ))}
      </div>
    </div>
  );
}
