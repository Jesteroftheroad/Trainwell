"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Stepper({
  label,
  value,
  unit,
  onChange,
  step,
  min = 0,
}: {
  label: string;
  value: number;
  unit?: string;
  onChange: (next: number) => void;
  step: number;
  min?: number;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          aria-label={`Decrease ${label.toLowerCase()}`}
          onClick={() => onChange(Math.max(min, value - step))}
        >
          <Minus className="size-4" />
        </Button>
        <span className="w-24 text-center text-4xl font-black tabular-nums">
          {value}
          {unit && <span className="ml-1 text-lg font-bold text-muted-foreground">{unit}</span>}
        </span>
        <Button
          variant="outline"
          size="icon"
          aria-label={`Increase ${label.toLowerCase()}`}
          onClick={() => onChange(value + step)}
        >
          <Plus className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export function RepsWeightSetView({
  reps,
  weight,
  weightUnit,
  onRepsChange,
  onWeightChange,
}: {
  reps: number | null;
  weight: number | null;
  weightUnit: string;
  onRepsChange: (reps: number) => void;
  onWeightChange: (weight: number) => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-10">
      {reps != null && <Stepper label="Reps" value={reps} onChange={onRepsChange} step={1} />}
      {weight != null && (
        <Stepper
          label="Weight"
          value={weight}
          unit={weightUnit}
          onChange={onWeightChange}
          step={2.5}
        />
      )}
      {reps == null && weight == null && (
        <p className="text-lg font-bold text-muted-foreground">Bodyweight</p>
      )}
    </div>
  );
}
