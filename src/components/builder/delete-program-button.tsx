"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteProgram } from "@/lib/builder/actions";

export function DeleteProgramButton({ programId }: { programId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("Delete this plan? This can't be undone.")) return;
    startTransition(async () => {
      const result = await deleteProgram(programId);
      if (!("error" in result)) router.push("/builder");
    });
  }

  return (
    <Button variant="ghost" size="sm" className="gap-1.5 text-danger" disabled={isPending} onClick={handleClick}>
      <Trash2 className="size-4" />
      Delete plan
    </Button>
  );
}
