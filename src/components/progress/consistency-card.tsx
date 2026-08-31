import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, Trophy, CheckCircle2 } from "lucide-react";
import type { ConsistencyStats } from "@/lib/progress/queries";

export function ConsistencyCard({ stats }: { stats: ConsistencyStats }) {
  const weeklyRate =
    stats.weekScheduled === 0 ? 0 : Math.round((stats.weekCompleted / stats.weekScheduled) * 100);

  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-sm font-bold">Consistency</h2>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <Stat icon={CheckCircle2} label="Completed" value={stats.totalCompletedWorkouts} />
          <Stat icon={Flame} label="Streak" value={stats.currentStreak} />
          <Stat icon={Trophy} label="Best streak" value={stats.longestStreak} />
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>This week</span>
            <span>
              {stats.weekCompleted}/{stats.weekScheduled} workouts
            </span>
          </div>
          <Progress value={weeklyRate} className="mt-2" />
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Flame;
  label: string;
  value: number;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl bg-muted p-3 text-center">
      <Icon className="size-5 text-primary" />
      <span className="text-xl font-black">{value}</span>
      <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
    </div>
  );
}
