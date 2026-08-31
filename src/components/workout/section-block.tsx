import { SECTION_TYPE_ICON, sectionTypeLabel } from "@/lib/workout/display";
import { ExerciseRow } from "./exercise-row";
import type { WorkoutSection } from "@/lib/workout/types";

export function SectionBlock({ section }: { section: WorkoutSection }) {
  const Icon = SECTION_TYPE_ICON[section.type];
  const isGrouped = section.type === "superset" || section.type === "circuit";

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <Icon className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-bold">{section.title || sectionTypeLabel(section.type)}</h3>
        {section.repeatCount > 1 && (
          <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-bold text-accent-foreground">
            Repeat {section.repeatCount}×
          </span>
        )}
      </div>

      <div
        className={
          isGrouped
            ? "flex flex-col gap-2 rounded-2xl border-2 border-dashed border-primary/30 p-2"
            : "flex flex-col gap-2"
        }
      >
        {section.exercises.map((instance) => (
          <ExerciseRow key={instance.id} instance={instance} />
        ))}
      </div>
    </div>
  );
}
