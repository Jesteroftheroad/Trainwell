"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addProgramWeek } from "@/lib/builder/actions";

export function AddWeekButton({ programId }: { programId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      await addProgramWeek(programId);
      router.refresh();
    });
  }

  return (
    <Button variant="outline" size="sm" className="gap-1.5" disabled={isPending} onClick={handleClick}>
      <Plus className="size-4" />
      {isPending ? "Adding…" : "Add week"}
    </Button>
  );
}
