import {
  Dumbbell,
  Footprints,
  HeartPulse,
  Layers,
  PersonStanding,
  Repeat,
  Snowflake,
  Sparkles,
  Wind,
} from "lucide-react";
import type { SectionType, WorkoutType } from "@/lib/supabase/database.types";

export const WORKOUT_TYPE_LABEL: Record<WorkoutType, string> = {
  upper_body: "Upper Body",
  lower_body: "Lower Body",
  full_body: "Full Body",
  cardio: "Cardio",
  core: "Core",
  mobility: "Mobility",
};

export const WORKOUT_TYPE_ICON: Record<WorkoutType, typeof Dumbbell> = {
  upper_body: Dumbbell,
  lower_body: Footprints,
  full_body: PersonStanding,
  cardio: HeartPulse,
  core: Layers,
  mobility: Wind,
};

export const SECTION_TYPE_ICON: Record<SectionType, typeof Dumbbell> = {
  warmup: Sparkles,
  set: Dumbbell,
  superset: Repeat,
  circuit: Repeat,
  cardio: HeartPulse,
  cooldown: Snowflake,
  stretching: PersonStanding,
};

export function sectionTypeLabel(type: SectionType): string {
  switch (type) {
    case "warmup":
      return "Warm-up";
    case "cooldown":
      return "Cool-down";
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
}
