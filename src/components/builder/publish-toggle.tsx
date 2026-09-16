"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { setProgramPublished } from "@/lib/builder/actions";

export function PublishToggle({ programId, isPublished }: { programId: string; isPublished: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      await setProgramPublished(programId, !isPublished);
      router.refresh();
    });
  }

  return (
    <Button variant={isPublished ? "outline" : "default"} size="sm" disabled={isPending} onClick={handleToggle}>
      {isPending ? "Saving…" : isPublished ? "Unpublish" : "Publish"}
    </Button>
  );
}
