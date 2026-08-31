"use client";

import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatSeconds } from "@/lib/utils";
import { useCountdown } from "@/lib/workout/use-countdown";

export function TimedSetView({
  seconds,
  side,
  onComplete,
}: {
  seconds: number;
  side: "none" | "left" | "right";
  onComplete: () => void;
}) {
  const { remaining, isRunning, start } = useCountdown(seconds, onComplete);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6">
      {side !== "none" && (
        <span className="rounded-full bg-primary-soft px-4 py-1 text-sm font-bold uppercase tracking-wide text-accent-foreground">
          {side}
        </span>
      )}
      <p className="text-8xl font-black tabular-nums">{formatSeconds(Math.max(remaining, 0))}</p>
      {!isRunning ? (
        <Button size="lg" onClick={start} className="gap-2 px-10">
          <Play className="size-5" />
          Start
        </Button>
      ) : (
        <p className="text-sm font-medium text-muted-foreground">Hold steady…</p>
      )}
    </div>
  );
}
