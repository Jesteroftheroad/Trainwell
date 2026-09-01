"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatLongDate } from "@/lib/date";
import { TodoWorkoutCard } from "./todo-workout-card";
import type { ScheduledWorkoutSummary } from "@/lib/workout/types";

const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

export function DayWorkoutPanel({
  weekDates,
  todayIso,
  weekWorkouts,
}: {
  weekDates: string[];
  todayIso: string;
  weekWorkouts: (ScheduledWorkoutSummary | null)[];
}) {
  const todayIndex = Math.max(
    0,
    weekDates.findIndex((d) => d === todayIso),
  );
  const [selectedIndex, setSelectedIndex] = useState(todayIndex);

  const selectedIso = weekDates[selectedIndex];
  const isSelectedToday = selectedIso === todayIso;

  return (
    <div>
      <div className="grid grid-cols-7 gap-2">
        {weekDates.map((isoDate, index) => {
          const isToday = isoDate === todayIso;
          const isSelected = index === selectedIndex;
          const workout = weekWorkouts[index];
          const isCompleted = workout?.status === "completed";
          const dateNum = Number(isoDate.slice(8, 10));

          return (
            <button
              key={isoDate}
              onClick={() => setSelectedIndex(index)}
              aria-current={isSelected ? "date" : undefined}
              aria-label={formatLongDate(isoDate)}
              className="flex flex-col items-center gap-1.5"
            >
              <span className="text-xs font-semibold text-muted-foreground">{DAY_LETTERS[index]}</span>
              <div
                className={cn(
                  "flex size-9 items-center justify-center rounded-full text-sm font-bold transition-colors",
                  isCompleted && "bg-success text-success-foreground",
                  !isCompleted && isToday && "bg-primary text-primary-foreground",
                  !isCompleted && !isToday && "bg-muted text-foreground",
                  isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                )}
              >
                {isCompleted ? <Check className="size-4" /> : dateNum}
              </div>
              <div
                className={cn("size-1.5 rounded-full", workout ? "bg-primary" : "bg-transparent")}
                aria-hidden
              />
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {isSelectedToday ? "Today" : formatLongDate(selectedIso)}
        </p>
        <TodoWorkoutCard workout={weekWorkouts[selectedIndex]} />
      </div>
    </div>
  );
}
