"use client";

import { useEffect } from "react";
import { Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatSeconds } from "@/lib/utils";
import { useCountdown } from "@/lib/workout/use-countdown";

export function RestTimerOverlay({
  seconds,
  nextExerciseName,
  onDone,
}: {
  seconds: number;
  nextExerciseName: string;
  onDone: () => void;
}) {
  const { remaining, start } = useCountdown(seconds, onDone);

  useEffect(() => {
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-primary px-6 text-primary-foreground">
      <Timer className="size-10 opacity-80" />
      <p className="text-sm font-bold uppercase tracking-widest opacity-80">Rest</p>
      <p className="text-7xl font-black tabular-nums">{formatSeconds(Math.max(remaining, 0))}</p>
      <p className="text-sm opacity-80">Up next: {nextExerciseName}</p>
      <Button
        variant="secondary"
        size="lg"
        onClick={onDone}
        className="mt-4 bg-white text-primary hover:bg-white/90"
      >
        Skip rest
      </Button>
    </div>
  );
}
