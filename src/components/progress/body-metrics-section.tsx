"use client";

import { useEffect, useState, useTransition } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchBodyMetrics, logBodyMetric } from "@/lib/progress/actions";
import type { BodyMetricPoint } from "@/lib/progress/queries";
import type { MetricType } from "@/lib/supabase/database.types";

const METRICS: { type: MetricType; label: string; unit: string }[] = [
  { type: "body_weight", label: "Weight", unit: "lb" },
  { type: "waist", label: "Waist", unit: "in" },
];

export function BodyMetricsSection() {
  const [metricType, setMetricType] = useState<MetricType>("body_weight");
  const [points, setPoints] = useState<BodyMetricPoint[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isPending, startTransition] = useTransition();

  const metric = METRICS.find((m) => m.type === metricType)!;

  function refresh() {
    startTransition(async () => {
      const result = await fetchBodyMetrics(metricType);
      setPoints(result);
    });
  }

  useEffect(refresh, [metricType]);

  function handleLog() {
    const value = Number(inputValue);
    if (!value || Number.isNaN(value)) return;
    startTransition(async () => {
      await logBodyMetric({ metricType, value, unit: metric.unit });
      setInputValue("");
      refresh();
    });
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold">Body metrics</h2>
          <div className="flex gap-1 rounded-full bg-muted p-1">
            {METRICS.map((m) => (
              <button
                key={m.type}
                onClick={() => setMetricType(m.type)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  metricType === m.type ? "bg-card shadow-sm" : "text-muted-foreground"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <Input
            type="number"
            inputMode="decimal"
            placeholder={`Log ${metric.label.toLowerCase()} (${metric.unit})`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Button onClick={handleLog} disabled={isPending || !inputValue}>
            Log
          </Button>
        </div>

        {points.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No entries yet. Log your first {metric.label.toLowerCase()} above.
          </p>
        ) : (
          <div className="mt-4 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={points} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="recordedAt"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => v.slice(5)}
                  stroke="var(--muted-foreground)"
                />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" width={36} domain={["auto", "auto"]} />
                <Tooltip contentStyle={{ borderRadius: 12, borderColor: "var(--border)", fontSize: 12 }} />
                <Line type="monotone" dataKey="value" stroke="var(--success)" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
