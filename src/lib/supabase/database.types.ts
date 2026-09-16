// Hand-written types mirroring supabase/migrations/*.sql.
// If the schema changes, update this file (or replace with `supabase gen types`
// once a live project is linked).

export type SectionType =
  | "warmup"
  | "set"
  | "superset"
  | "circuit"
  | "cardio"
  | "cooldown"
  | "stretching";

export type WorkoutType =
  | "upper_body"
  | "lower_body"
  | "full_body"
  | "cardio"
  | "core"
  | "mobility";

export type ExerciseCategory =
  | "strength"
  | "mobility"
  | "warmup"
  | "cardio"
  | "stretching"
  | "core";

export type DefaultUnit = "lb" | "kg" | "bodyweight" | "time" | "distance";
export type WeightUnit = "lb" | "kg";
export type Side = "none" | "left" | "right";
export type ExerciseSide = "none" | "left" | "right" | "alternating";
export type ScheduledSlot = "main" | "extra" | "backup";
export type ScheduledStatus = "scheduled" | "completed" | "skipped";
export type SessionStatus = "in_progress" | "completed" | "abandoned";
export type ProfileRole = "client" | "coach" | "admin";
export type MetricType =
  | "body_weight"
  | "waist"
  | "chest"
  | "hips"
  | "arm"
  | "thigh"
  | "body_fat_pct";
export type ConversationType = "coach" | "system";

type Relationship<FK extends string, RefTable extends string> = {
  foreignKeyName: string;
  columns: [FK];
  isOneToOne: boolean;
  referencedRelation: RefTable;
  referencedColumns: ["id"];
};

type Table<
  Row,
  Relationships extends Relationship<string, string>[] = [],
  Insert extends Partial<Row> = Partial<Row>,
> = {
  Row: Row;
  Insert: Insert;
  Update: Partial<Row>;
  Relationships: Relationships;
};

export type ProfileRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: ProfileRole;
  timezone: string;
  current_streak: number;
  longest_streak: number;
  streak_anchor_date: string | null;
  streak_last_confirmed_date: string | null;
  goal_text: string | null;
  created_at: string;
  updated_at: string;
}

export type ExerciseRow = {
  id: string;
  name: string;
  slug: string;
  category: ExerciseCategory;
  equipment: string[];
  primary_muscles: string[];
  secondary_muscles: string[];
  instructions: string | null;
  common_mistakes: string | null;
  media_url: string | null;
  thumbnail_url: string | null;
  default_unit: DefaultUnit;
  created_at: string;
}

export type WorkoutRow = {
  id: string;
  name: string;
  slug: string;
  workout_type: WorkoutType;
  estimated_duration_minutes: number | null;
  description: string | null;
  created_by: string | null;
  is_template: boolean;
  created_at: string;
}

export type WorkoutSectionRow = {
  id: string;
  workout_id: string;
  section_type: SectionType;
  title: string;
  order_index: number;
  repeat_count: number;
  notes: string | null;
}

export type WorkoutExerciseRow = {
  id: string;
  section_id: string;
  exercise_id: string;
  order_index: number;
  side: ExerciseSide;
  tempo: string | null;
  rest_seconds: number | null;
  notes: string | null;
}

export type ExerciseSetRow = {
  id: string;
  workout_exercise_id: string;
  set_index: number;
  reps: number | null;
  weight: number | null;
  weight_unit: WeightUnit;
  duration_seconds: number | null;
  distance: number | null;
  distance_unit: string | null;
  side: Side;
  is_warmup: boolean;
  notes: string | null;
}

export type ScheduledWorkoutRow = {
  id: string;
  user_id: string;
  workout_id: string;
  scheduled_date: string;
  slot: ScheduledSlot;
  status: ScheduledStatus;
  created_at: string;
}

export type WorkoutSessionRow = {
  id: string;
  user_id: string;
  scheduled_workout_id: string | null;
  workout_id: string;
  started_at: string;
  completed_at: string | null;
  status: SessionStatus;
  total_duration_seconds: number | null;
}

export type CompletedSetRow = {
  id: string;
  session_id: string;
  workout_exercise_id: string;
  exercise_id: string;
  set_index: number;
  reps: number | null;
  weight: number | null;
  weight_unit: WeightUnit | null;
  duration_seconds: number | null;
  distance: number | null;
  side: Side;
  skipped: boolean;
  is_personal_record: boolean;
  completed_at: string;
}

export type ProgressMetricRow = {
  id: string;
  user_id: string;
  metric_type: MetricType;
  value: number;
  unit: string;
  recorded_at: string;
  created_at: string;
}

export type ConversationRow = {
  id: string;
  client_id: string;
  coach_id: string | null;
  type: ConversationType;
  created_at: string;
}

export type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  body: string;
  attachment_url: string | null;
  created_at: string;
  read_at: string | null;
}

export type PushSubscriptionRow = {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
}

export type ProgramRow = {
  id: string;
  coach_id: string | null;
  name: string;
  description: string | null;
  is_published: boolean;
  created_at: string;
}

export type ProgramWeekRow = {
  id: string;
  program_id: string;
  week_number: number;
}

export type ProgramDayRow = {
  id: string;
  program_week_id: string;
  day_of_week: number;
  workout_id: string | null;
}

export type ProgramEnrollmentRow = {
  id: string;
  user_id: string;
  program_id: string;
  started_on: string;
  created_at: string;
}

export type Database = {
  public: {
    Tables: {
      profiles: Table<ProfileRow>;
      exercises: Table<ExerciseRow>;
      workouts: Table<WorkoutRow>;
      workout_sections: Table<WorkoutSectionRow, [Relationship<"workout_id", "workouts">]>;
      workout_exercises: Table<
        WorkoutExerciseRow,
        [Relationship<"section_id", "workout_sections">, Relationship<"exercise_id", "exercises">]
      >;
      exercise_sets: Table<ExerciseSetRow, [Relationship<"workout_exercise_id", "workout_exercises">]>;
      scheduled_workouts: Table<
        ScheduledWorkoutRow,
        [Relationship<"user_id", "profiles">, Relationship<"workout_id", "workouts">]
      >;
      workout_sessions: Table<
        WorkoutSessionRow,
        [
          Relationship<"user_id", "profiles">,
          Relationship<"scheduled_workout_id", "scheduled_workouts">,
          Relationship<"workout_id", "workouts">,
        ]
      >;
      completed_sets: Table<
        CompletedSetRow,
        [
          Relationship<"session_id", "workout_sessions">,
          Relationship<"workout_exercise_id", "workout_exercises">,
          Relationship<"exercise_id", "exercises">,
        ]
      >;
      progress_metrics: Table<ProgressMetricRow, [Relationship<"user_id", "profiles">]>;
      conversations: Table<
        ConversationRow,
        [Relationship<"client_id", "profiles">, Relationship<"coach_id", "profiles">]
      >;
      messages: Table<
        MessageRow,
        [Relationship<"conversation_id", "conversations">, Relationship<"sender_id", "profiles">]
      >;
      push_subscriptions: Table<PushSubscriptionRow, [Relationship<"user_id", "profiles">]>;
      programs: Table<ProgramRow, [Relationship<"coach_id", "profiles">]>;
      program_weeks: Table<ProgramWeekRow, [Relationship<"program_id", "programs">]>;
      program_days: Table<
        ProgramDayRow,
        [Relationship<"program_week_id", "program_weeks">, Relationship<"workout_id", "workouts">]
      >;
      program_enrollments: Table<
        ProgramEnrollmentRow,
        [Relationship<"user_id", "profiles">, Relationship<"program_id", "programs">]
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
