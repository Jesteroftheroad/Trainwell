-- Lets recordCompletedSet() upsert (re-marking a set complete edits it in place
-- instead of creating duplicates).
create unique index if not exists completed_sets_session_exercise_set_idx
  on completed_sets (session_id, workout_exercise_id, set_index);
