"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { duplicateProgram } from "@/lib/builder/actions";

export function DuplicateProgramButton({ programId }: { programId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    startTransition(async () => {
      const result = await duplicateProgram(programId);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.push(`/builder/${result.programId}`);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Duplicate plan"
        disabled={isPending}
        onClick={handleClick}
      >
        <Copy className="size-4" />
      </Button>
      {error && <span className="text-xs font-medium text-danger">{error}</span>}
    </div>
  );
}
