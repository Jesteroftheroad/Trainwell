"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Flame, PartyPopper, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { completeWorkoutSession, type WorkoutSessionSummary } from "@/lib/workout/actions";

export function SessionCompleteView({
  sessionId,
  workoutName,
  prHits,
  speak,
}: {
  sessionId: string;
  workoutName: string;
  prHits: string[];
  speak: (text: string) => void;
}) {
  const router = useRouter();
  const [summary, setSummary] = useState<WorkoutSessionSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    completeWorkoutSession(sessionId).then((result) => {
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setSummary(result);
    });

    const prLine =
      prHits.length > 0
        ? ` You hit ${prHits.length === 1 ? "a new personal record" : `${prHits.length} new personal records`}.`
        : "";
    speak(`Workout complete. Great job finishing ${workoutName}.${prLine}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleDone() {
    router.push("/today");
    router.refresh();
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-success-soft text-success">
        <PartyPopper className="size-8" />
      </div>
      <h1 className="text-2xl font-black">Workout complete!</h1>
      <p className="text-sm text-muted-foreground">Nice work finishing {workoutName}.</p>

      {error && <p className="text-sm font-medium text-danger">{error}</p>}

      {!error && (
        <div className="mt-2 w-full max-w-xs rounded-2xl border border-border bg-card p-4 text-left">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 font-medium text-muted-foreground">
              <Clock className="size-4" />
              Time
            </span>
            <span className="font-bold">
              {summary ? `${summary.durationMinutes} min` : "…"}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 font-medium text-muted-foreground">
              <Flame className="size-4" />
              Calories (est.)
            </span>
            <span className="font-bold">{summary ? `~${summary.caloriesEstimate}` : "…"}</span>
          </div>
          {prHits.length > 0 && (
            <div className="mt-3 border-t border-border pt-3">
              <p className="flex items-center gap-2 text-sm font-bold text-warning">
                <Trophy className="size-4" />
                {prHits.length === 1 ? "New personal record" : `${prHits.length} new personal records`}
              </p>
              <ul className="mt-1 list-inside list-disc text-sm text-muted-foreground">
                {prHits.map((name, i) => (
                  <li key={`${name}-${i}`}>{name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <Button size="lg" className="mt-4 w-full max-w-xs" disabled={!summary && !error} onClick={handleDone}>
        Done
      </Button>
    </div>
  );
}
