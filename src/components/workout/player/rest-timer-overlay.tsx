"use client";

import { useEffect } from "react";
import { Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatSeconds } from "@/lib/utils";
import { useCountdown } from "@/lib/workout/use-countdown";
import { useWakeLock } from "@/lib/workout/use-wake-lock";

export function RestTimerOverlay({
  seconds,
  nextExerciseName,
  onDone,
  speak,
}: {
  seconds: number;
  nextExerciseName: string;
  onDone: () => void;
  speak: (text: string) => void;
}) {
  const { remaining, isRunning, start } = useCountdown(seconds, onDone);
  useWakeLock(isRunning);

  useEffect(() => {
    start();
    speak(`Rest. Up next, ${nextExerciseName}.`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isRunning && remaining > 0 && remaining <= 3) {
      speak(String(remaining));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, isRunning]);

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
