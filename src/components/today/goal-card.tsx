"use client";

import { useState, useTransition } from "react";
import { Target, Pencil, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateGoal } from "@/lib/profile/actions";

const DEFAULT_GOAL = "Feel More Confident In My Own Skin";

export function GoalCard({ goalText }: { goalText: string | null }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(goalText ?? DEFAULT_GOAL);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      await updateGoal(value);
      setEditing(false);
    });
  }

  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-accent-foreground">
          <Target className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Current goal
          </p>
          {editing ? (
            <Input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              className="mt-1 h-9"
            />
          ) : (
            <p className="truncate text-sm font-bold">{value}</p>
          )}
        </div>
        <Button
          size="icon"
          variant="ghost"
          disabled={isPending}
          aria-label={editing ? "Save goal" : "Edit goal"}
          onClick={() => (editing ? handleSave() : setEditing(true))}
        >
          {editing ? <Check className="size-4" /> : <Pencil className="size-4" />}
        </Button>
      </CardContent>
    </Card>
  );
}
