import { getCurrentUserAndProfile } from "@/lib/profile/queries";
import { getCompletedSessions, getUpcomingScheduled } from "@/lib/workout/queries";
import { formatLongDateWithOrdinal } from "@/lib/date";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScheduledWorkoutRow } from "@/components/workout/scheduled-workout-row";
import { CompletedWorkoutRow } from "@/components/workout/completed-workout-row";
import type { ScheduledWorkoutSummary } from "@/lib/workout/types";

function groupByDate(items: ScheduledWorkoutSummary[]): [string, ScheduledWorkoutSummary[]][] {
  const map = new Map<string, ScheduledWorkoutSummary[]>();
  for (const item of items) {
    const list = map.get(item.scheduledDate) ?? [];
    list.push(item);
    map.set(item.scheduledDate, list);
  }
  return Array.from(map.entries());
}

function ScheduledList({
  items,
  emptyMessage,
}: {
  items: ScheduledWorkoutSummary[];
  emptyMessage: string;
}) {
  if (items.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {groupByDate(items).map(([date, workouts]) => (
        <div key={date}>
          <h3 className="mb-2 text-sm font-bold">{formatLongDateWithOrdinal(date)}</h3>
          <div className="flex flex-col gap-2">
            {workouts.map((w) => (
              <ScheduledWorkoutRow key={w.scheduledWorkoutId} workout={w} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function WorkoutsPage() {
  const { userId } = await getCurrentUserAndProfile();

  const [upcoming, extras, backups, completed] = await Promise.all([
    getUpcomingScheduled(userId, "main"),
    getUpcomingScheduled(userId, "extra"),
    getUpcomingScheduled(userId, "backup"),
    getCompletedSessions(userId),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 pt-6 pb-10 sm:px-6">
      <h1 className="text-2xl font-black">Workouts</h1>

      <Tabs defaultValue="upcoming" className="mt-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="extras">Extras</TabsTrigger>
          <TabsTrigger value="backups">Backups</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <ScheduledList items={upcoming} emptyMessage="Nothing scheduled yet." />
        </TabsContent>
        <TabsContent value="extras">
          <ScheduledList items={extras} emptyMessage="No extra workouts right now." />
        </TabsContent>
        <TabsContent value="backups">
          <ScheduledList items={backups} emptyMessage="No backup workouts right now." />
        </TabsContent>
        <TabsContent value="completed">
          {completed.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Complete a workout and it will show up here.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {completed.map((session) => (
                <CompletedWorkoutRow key={session.sessionId} session={session} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
