"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { enrollInProgram } from "@/lib/programs/actions";

export function ChoosePlanButton({
  programId,
  isSelected,
  isActive,
}: {
  programId: string;
  isSelected: boolean;
  isActive: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await enrollInProgram(programId);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  const label = isPending
    ? "Selecting…"
    : isActive
      ? "Active plan"
      : isSelected
        ? "Selected — waiting for code"
        : "Select this plan";

  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <Button
        size="sm"
        variant={isSelected ? "outline" : "default"}
        disabled={isPending || isSelected}
        onClick={handleClick}
      >
        {label}
      </Button>
      {error && <span className="text-xs font-medium text-danger">{error}</span>}
    </div>
  );
}
