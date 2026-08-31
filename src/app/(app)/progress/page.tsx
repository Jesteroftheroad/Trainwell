import { getCurrentUserAndProfile } from "@/lib/profile/queries";
import { getConsistencyStats, getTrainedExercises } from "@/lib/progress/queries";
import { ConsistencyCard } from "@/components/progress/consistency-card";
import { StrengthSection } from "@/components/progress/strength-section";
import { BodyMetricsSection } from "@/components/progress/body-metrics-section";

export default async function ProgressPage() {
  const { userId, profile } = await getCurrentUserAndProfile();
  const [stats, trainedExercises] = await Promise.all([
    getConsistencyStats(userId, profile?.timezone ?? "UTC"),
    getTrainedExercises(userId),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 pt-6 pb-10 sm:px-6">
      <h1 className="text-2xl font-black">Progress</h1>

      <div className="mt-4 flex flex-col gap-4">
        <ConsistencyCard stats={stats} />
        <StrengthSection exercises={trainedExercises} />
        <BodyMetricsSection />
      </div>
    </div>
  );
}
