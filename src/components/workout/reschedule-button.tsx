"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { rescheduleWorkout } from "@/lib/workout/actions";

export function RescheduleButton({
  scheduledWorkoutId,
  currentDateIso,
  variant = "outline",
  size = "sm",
}: {
  scheduledWorkoutId: string;
  currentDateIso: string;
  variant?: "outline" | "ghost";
  size?: "sm" | "icon";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [targetDate, setTargetDate] = useState(currentDateIso);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await rescheduleWorkout(scheduledWorkoutId, targetDate);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          aria-label="Reschedule this workout"
          title="Reschedule"
        >
          <CalendarClock className="size-4" />
          {size !== "icon" && "Reschedule"}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move this workout</DialogTitle>
          <DialogDescription>
            Pick any day — earlier or later. If something&rsquo;s already scheduled that day,
            we&rsquo;ll swap the two instead of losing it.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="reschedule-date">New date</Label>
          <Input
            id="reschedule-date"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />
        </div>

        {error && (
          <p role="alert" className="mt-2 text-sm font-medium text-danger">
            {error}
          </p>
        )}

        <Button size="lg" className="mt-4 w-full" disabled={isPending} onClick={handleConfirm}>
          {isPending ? "Moving…" : "Move workout"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
