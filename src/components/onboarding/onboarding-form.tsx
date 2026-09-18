"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { completeOnboarding } from "@/lib/profile/actions";

const GOAL_SUGGESTIONS = [
  "Lose fat",
  "Build muscle",
  "Get stronger",
  "General fitness",
];

export function OnboardingForm({
  initialName,
  initialGoal,
}: {
  initialName: string;
  initialGoal: string;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialName);
  const [goal, setGoal] = useState(initialGoal);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleContinue() {
    setError(null);
    startTransition(async () => {
      const result = await completeOnboarding({ fullName, goalText: goal });
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.push("/plans");
      router.refresh();
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-black">Welcome!</h1>
      <p className="mt-1 text-sm text-muted-foreground">A couple quick things before we get you scheduled.</p>

      <div className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="onboarding-name">What should we call you?</Label>
          <Input
            id="onboarding-name"
            autoComplete="nickname"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="onboarding-goal">What&apos;s your main goal?</Label>
          <Input
            id="onboarding-goal"
            placeholder="e.g. Lose fat"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
          <div className="mt-1 flex flex-wrap gap-1.5">
            {GOAL_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setGoal(suggestion)}
                className="rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p role="alert" className="text-sm font-medium text-danger">
            {error}
          </p>
        )}

        <Button size="lg" disabled={isPending} onClick={handleContinue} className="mt-2">
          {isPending ? "Saving…" : "Continue"}
        </Button>

        <button
          type="button"
          disabled={isPending}
          onClick={() => router.push("/plans")}
          className="text-center text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
