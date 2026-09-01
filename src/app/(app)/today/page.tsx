import Link from "next/link";
import { Flame } from "lucide-react";
import { getCurrentUserAndProfile } from "@/lib/profile/queries";
import { getWeekMainWorkouts } from "@/lib/workout/queries";
import { getTodayIsoInTimezone, getWeekIsoDatesInTimezone } from "@/lib/date";
import { GoalCard } from "@/components/today/goal-card";
import { WeeklySurveyCard } from "@/components/today/weekly-survey-card";
import { DayWorkoutPanel } from "@/components/today/day-workout-panel";

export default async function TodayPage() {
  const { userId, profile } = await getCurrentUserAndProfile();
  const timezone = profile?.timezone ?? "UTC";
  const todayIso = getTodayIsoInTimezone(timezone);
  const weekDates = getWeekIsoDatesInTimezone(timezone);

  const weekWorkouts = await getWeekMainWorkouts(userId, weekDates);

  const initial = (profile?.full_name ?? "A").trim().charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-2xl px-4 pt-6 pb-10 sm:px-6">
      <header className="flex items-center gap-3">
        <Link
          href="/profile"
          aria-label="Open profile"
          className="flex size-11 items-center justify-center rounded-full bg-primary-soft text-lg font-black text-accent-foreground"
        >
          {initial}
        </Link>
        <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm font-bold">
          <Flame className="size-4 text-warning" />
          {profile?.current_streak ?? 0}
        </div>
      </header>

      <div className="mt-6 flex flex-col gap-3">
        <WeeklySurveyCard />
        <GoalCard goalText={profile?.goal_text ?? null} />
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            This week
          </h2>
          <Link href="/workouts" className="text-xs font-semibold text-primary">
            View all
          </Link>
        </div>
        <div className="mt-3">
          <DayWorkoutPanel weekDates={weekDates} todayIso={todayIso} weekWorkouts={weekWorkouts} />
        </div>
      </section>
    </div>
  );
}
