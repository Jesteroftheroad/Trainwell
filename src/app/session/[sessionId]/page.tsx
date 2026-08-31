import { notFound } from "next/navigation";
import { getCurrentUserAndProfile } from "@/lib/profile/queries";
import { getSessionForPlayer } from "@/lib/workout/queries";
import { buildPlayerQueue } from "@/lib/workout/types";
import { WorkoutPlayer } from "@/components/workout/player/workout-player";

export default async function SessionPlayerPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const { userId } = await getCurrentUserAndProfile();
  const session = await getSessionForPlayer(sessionId, userId);

  if (!session) notFound();

  const queue = buildPlayerQueue(session.workout.sections);

  return (
    <WorkoutPlayer
      sessionId={session.sessionId}
      workoutName={session.workout.name}
      queue={queue}
      initiallyCompletedKeys={session.completedKeys}
    />
  );
}
