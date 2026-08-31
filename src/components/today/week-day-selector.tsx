import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import type { DaySummary } from "@/lib/workout/queries";

const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

export function WeekDaySelector({ days, todayIso }: { days: DaySummary[]; todayIso: string }) {
  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day, index) => {
        const isToday = day.isoDate === todayIso;
        const dateNum = Number(day.isoDate.slice(8, 10));

        return (
          <div key={day.isoDate} className="flex flex-col items-center gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground">{DAY_LETTERS[index]}</span>
            <div
              className={cn(
                "flex size-9 items-center justify-center rounded-full text-sm font-bold",
                isToday && !day.isCompleted && "bg-primary text-primary-foreground",
                day.isCompleted && "bg-success text-success-foreground",
                !isToday && !day.isCompleted && "bg-muted text-foreground",
              )}
            >
              {day.isCompleted ? <Check className="size-4" /> : dateNum}
            </div>
            <div
              className={cn(
                "size-1.5 rounded-full",
                day.hasWorkout ? "bg-primary" : "bg-transparent",
              )}
              aria-hidden
            />
          </div>
        );
      })}
    </div>
  );
}
