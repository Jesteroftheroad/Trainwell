"use client";

import { useEffect } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatSeconds } from "@/lib/utils";
import { useCountdown } from "@/lib/workout/use-countdown";
import { useWakeLock } from "@/lib/workout/use-wake-lock";
import { Stepper } from "./reps-weight-set-view";

export function TimedSetView({
  seconds,
  side,
  onComplete,
  onSecondsChange,
  speak,
}: {
  seconds: number;
  side: "none" | "left" | "right";
  onComplete: () => void;
  onSecondsChange: (next: number) => void;
  speak: (text: string) => void;
}) {
  const { remaining, isRunning, start } = useCountdown(seconds, onComplete);
  useWakeLock(isRunning);

  useEffect(() => {
    if (isRunning && remaining > 0 && remaining <= 3) {
      speak(String(remaining));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, isRunning]);

  function handleStart() {
    start();
    speak("Go");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6">
      {side !== "none" && (
        <span className="rounded-full bg-primary-soft px-4 py-1 text-sm font-bold uppercase tracking-wide text-accent-foreground">
          {side}
        </span>
      )}
      {!isRunning ? (
        <>
          <Stepper label="Duration" value={seconds} unit="s" onChange={onSecondsChange} step={5} min={5} />
          <Button size="lg" onClick={handleStart} className="gap-2 px-10">
            <Play className="size-5" />
            Start
          </Button>
        </>
      ) : (
        <>
          <p className="text-8xl font-black tabular-nums">{formatSeconds(Math.max(remaining, 0))}</p>
          <p className="text-sm font-medium text-muted-foreground">Hold steady…</p>
        </>
      )}
    </div>
  );
}
