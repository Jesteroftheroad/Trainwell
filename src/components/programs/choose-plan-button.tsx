"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { enrollInProgram } from "@/lib/programs/actions";

export function ChoosePlanButton({ programId, isCurrent }: { programId: string; isCurrent: boolean }) {
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
      router.push("/today");
    });
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <Button size="sm" variant={isCurrent ? "outline" : "default"} disabled={isPending} onClick={handleClick}>
        {isPending ? "Starting…" : isCurrent ? "Current plan" : "Start this plan"}
      </Button>
      {error && <span className="text-xs font-medium text-danger">{error}</span>}
    </div>
  );
}
