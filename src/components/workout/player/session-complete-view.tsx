"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { completeWorkoutSession } from "@/lib/workout/actions";

export function SessionCompleteView({
  sessionId,
  workoutName,
  speak,
}: {
  sessionId: string;
  workoutName: string;
  speak: (text: string) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    speak(`Workout complete. Great job finishing ${workoutName}.`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFinish() {
    startTransition(async () => {
      await completeWorkoutSession(sessionId);
      router.push("/today");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-success-soft text-success">
        <PartyPopper className="size-8" />
      </div>
      <h1 className="text-2xl font-black">Workout complete!</h1>
      <p className="text-sm text-muted-foreground">
        Nice work finishing {workoutName}. Your progress has been saved.
      </p>
      <Button size="lg" className="mt-4 w-full max-w-xs" disabled={isPending} onClick={handleFinish}>
        {isPending ? "Saving…" : "Done"}
      </Button>
    </div>
  );
}
