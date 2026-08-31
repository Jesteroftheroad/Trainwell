"use client";

import { useEffect, useState, useTransition } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { fetchStrengthProgression } from "@/lib/progress/actions";
import type { StrengthPoint } from "@/lib/progress/queries";
import type { TrainedExercise } from "@/lib/progress/queries";

function estimatedOneRepMax(weight: number, reps: number | null): number {
  if (!reps || reps <= 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

export function StrengthSection({ exercises }: { exercises: TrainedExercise[] }) {
  const [selectedId, setSelectedId] = useState(exercises[0]?.exerciseId ?? "");
  const [points, setPoints] = useState<StrengthPoint[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!selectedId) return;
    startTransition(async () => {
      const result = await fetchStrengthProgression(selectedId);
      setPoints(result);
    });
  }, [selectedId]);

  if (exercises.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <h2 className="text-sm font-bold">Strength</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Complete a strength workout and your weight progression will show up here.
          </p>
        </CardContent>
      </Card>
    );
  }

  const latest = points.at(-1);
  const first = points[0];
  const est1RM = latest ? estimatedOneRepMax(latest.maxWeight, latest.topSetReps) : null;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold">Strength</h2>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold"
          >
            {exercises.map((ex) => (
              <option key={ex.exerciseId} value={ex.exerciseId}>
                {ex.name}
              </option>
            ))}
          </select>
        </div>

        {isPending && <p className="mt-4 text-sm text-muted-foreground">Loading…</p>}

        {!isPending && points.length === 0 && (
          <p className="mt-4 text-sm text-muted-foreground">No logged sets for this exercise yet.</p>
        )}

        {!isPending && points.length > 0 && (
          <>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black">{latest?.maxWeight}</span>
              <span className="text-sm text-muted-foreground">lb top set</span>
              {first && latest && latest.maxWeight !== first.maxWeight && (
                <span className="text-sm font-semibold text-success">
                  {first.maxWeight} → {latest.maxWeight}
                </span>
              )}
            </div>
            {est1RM && (
              <p className="text-xs text-muted-foreground">Estimated 1RM: {est1RM} lb</p>
            )}

            <div className="mt-4 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={points} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => v.slice(5)}
                    stroke="var(--muted-foreground)"
                  />
                  <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" width={36} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      borderColor: "var(--border)",
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="maxWeight"
                    stroke="var(--primary)"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
