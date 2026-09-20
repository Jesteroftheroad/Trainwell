"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addSection } from "@/lib/builder/actions";
import { sectionTypeLabel } from "@/lib/workout/display";
import type { SectionType } from "@/lib/supabase/database.types";

const SECTION_TYPES: SectionType[] = ["warmup", "set", "superset", "circuit", "cardio", "cooldown", "stretching"];

export function AddSectionButton({ workoutId }: { workoutId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleAdd(type: SectionType) {
    startTransition(async () => {
      await addSection(workoutId, type);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {SECTION_TYPES.map((type) => (
        <Button
          key={type}
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => handleAdd(type)}
          className="gap-1.5"
        >
          <Plus className="size-3.5" />
          {sectionTypeLabel(type)}
        </Button>
      ))}
    </div>
  );
}
