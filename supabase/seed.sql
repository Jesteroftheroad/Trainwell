-- Exercise library + workout template seed data.
-- Safe to re-run: exercises/workouts are upserted by slug.
-- Run this AFTER the migrations in supabase/migrations/, and BEFORE any user
-- signs up (new-user signup auto-schedules the demo week — see
-- 0003_demo_seeding.sql — which looks workouts up by slug).

-- ---------------------------------------------------------------------------
-- Exercise library
-- ---------------------------------------------------------------------------
insert into exercises (name, slug, category, equipment, primary_muscles, secondary_muscles, instructions, default_unit)
values
  ('Arm Circle', 'arm-circle', 'warmup', '{bodyweight}', '{shoulders}', '{}', 'Extend arms out to the sides and make slow, controlled circles.', 'time'),
  ('Wall Reach', 'wall-reach', 'warmup', '{bodyweight}', '{shoulders,upper back}', '{}', 'Facing a wall, slide your arms overhead and back down to mobilize the shoulders.', 'time'),
  ('Cable Internal Rotation', 'cable-internal-rotation', 'warmup', '{cable machine}', '{shoulders}', '{rotator cuff}', 'Elbow pinned to your side, rotate the cable handle inward across your body.', 'lb'),
  ('Cable External Rotation', 'cable-external-rotation', 'warmup', '{cable machine}', '{shoulders}', '{rotator cuff}', 'Elbow pinned to your side, rotate the cable handle outward away from your body.', 'lb'),
  ('Cable Tricep Pushdown', 'cable-tricep-pushdown', 'strength', '{cable machine}', '{triceps}', '{}', 'Keep elbows pinned to your ribs and press the bar down to full extension.', 'lb'),
  ('Single Arm Dumbbell Chest Fly', 'single-arm-dumbbell-chest-fly', 'strength', '{dumbbell,bench}', '{chest}', '{shoulders}', 'Lying on a bench, lower the dumbbell out to the side with a slight elbow bend, then bring it back over your chest.', 'lb'),
  ('Alternating Dumbbell Bench Press', 'alternating-dumbbell-bench-press', 'strength', '{dumbbell,bench}', '{chest}', '{triceps,shoulders}', 'Press one dumbbell up while the other stays at chest height, alternating sides.', 'lb'),
  ('Seated Dumbbell Reverse Fly', 'seated-dumbbell-reverse-fly', 'strength', '{dumbbell,bench}', '{upper back}', '{rear delts}', 'Hinge forward on a bench and raise the dumbbells out to the sides, squeezing your shoulder blades.', 'lb'),
  ('Seated Dumbbell Overhead Press', 'seated-dumbbell-overhead-press', 'strength', '{dumbbell,bench}', '{shoulders}', '{triceps}', 'Seated with back support, press the dumbbells overhead until arms are extended.', 'lb'),
  ('Dumbbell Bench One Arm Row', 'dumbbell-bench-one-arm-row', 'strength', '{dumbbell,bench}', '{back}', '{biceps}', 'Support yourself on a bench and row the dumbbell up toward your hip.', 'lb'),
  ('Wide Lat Pulldown', 'wide-lat-pulldown', 'strength', '{cable machine}', '{lats}', '{biceps}', 'Grip the bar wide and pull down to your upper chest, leading with your elbows.', 'lb'),
  ('Dumbbell Hammer Curl', 'dumbbell-hammer-curl', 'strength', '{dumbbell}', '{biceps}', '{forearms}', 'Curl the dumbbells with a neutral (palms-in) grip.', 'lb'),
  ('Dumbbell Tate Press', 'dumbbell-tate-press', 'strength', '{dumbbell,bench}', '{triceps}', '{}', 'Lying on a bench, lower dumbbells toward your chest by bending only your elbows, then press back up.', 'lb'),
  ('Pec Stretch', 'pec-stretch', 'stretching', '{bodyweight}', '{chest}', '{}', 'Place your forearm on a doorway or wall and gently rotate away to stretch the chest.', 'time'),
  ('Tricep Stretch', 'tricep-stretch', 'stretching', '{bodyweight}', '{triceps}', '{}', 'Reach one arm overhead and behind your head, using the other hand to gently deepen the stretch.', 'time'),
  ('Palm Up Forearm Stretch', 'palm-up-forearm-stretch', 'stretching', '{bodyweight}', '{forearms}', '{}', 'Extend your arm with palm facing up and gently pull the fingers back.', 'time'),
  ('Shoulder Stretch', 'shoulder-stretch', 'stretching', '{bodyweight}', '{shoulders}', '{}', 'Bring one arm across your chest and gently pull it closer with the opposite arm.', 'time'),
  ('Cobra Stretch', 'cobra-stretch', 'stretching', '{bodyweight}', '{core,lower back}', '{}', 'Lying face down, press your chest up while keeping your hips on the floor.', 'time'),
  ('Prayer Stretch', 'prayer-stretch', 'stretching', '{bodyweight}', '{forearms}', '{wrists}', 'Bring palms together in front of your chest and lower your hands while keeping palms touching.', 'time'),
  ('Cable Archer Row', 'cable-archer-row', 'strength', '{cable machine}', '{back}', '{biceps}', 'Row one handle back while extending the other arm forward, like drawing a bow.', 'lb'),
  ('Incline Push Up', 'incline-push-up', 'warmup', '{bodyweight}', '{chest}', '{triceps,shoulders}', 'Hands elevated on a bench or box, perform a push up at an incline.', 'bodyweight'),
  ('Dumbbell Incline Bench Press', 'dumbbell-incline-bench-press', 'strength', '{dumbbell,bench}', '{chest}', '{shoulders,triceps}', 'On an incline bench, press the dumbbells up and slightly together.', 'lb'),
  ('Dumbbell Lateral Raise', 'dumbbell-lateral-raise', 'strength', '{dumbbell}', '{shoulders}', '{}', 'Raise the dumbbells out to your sides to shoulder height with a slight elbow bend.', 'lb'),
  ('Dumbbell Front Raise', 'dumbbell-front-raise', 'strength', '{dumbbell}', '{shoulders}', '{}', 'Raise the dumbbells straight in front of you to shoulder height.', 'lb'),
  ('Machine Row', 'machine-row', 'strength', '{machine}', '{back}', '{biceps}', 'Sit tall and row the handles toward your torso, squeezing your shoulder blades together.', 'lb'),
  ('Cable Hammer Curl', 'cable-hammer-curl', 'strength', '{cable machine}', '{biceps}', '{forearms}', 'Using a rope attachment, curl with a neutral grip.', 'lb'),
  ('Bodyweight Standing Hip Rotation', 'bodyweight-standing-hip-rotation', 'warmup', '{bodyweight}', '{hips}', '{}', 'Standing on one leg, rotate the opposite knee outward and inward in a controlled circle.', 'time'),
  ('Walking Frankenstein', 'walking-frankenstein', 'warmup', '{bodyweight}', '{hamstrings}', '{}', 'Kick one straight leg up to meet the opposite hand as you step forward.', 'time'),
  ('Bodyweight Froggys', 'bodyweight-froggys', 'warmup', '{bodyweight}', '{hips,groin}', '{}', 'From a deep squat, rock side to side opening through the hips.', 'bodyweight'),
  ('Bodyweight Squat', 'bodyweight-squat', 'warmup', '{bodyweight}', '{quads,glutes}', '{}', 'Sit your hips back and down, then drive back up to standing.', 'bodyweight'),
  ('Bodyweight Good Morning', 'bodyweight-good-morning', 'warmup', '{bodyweight}', '{hamstrings}', '{lower back}', 'Hinge at the hips with a soft knee bend, keeping your back flat, then return to standing.', 'bodyweight'),
  ('Machine Leg Press', 'machine-leg-press', 'strength', '{machine}', '{quads,glutes}', '{hamstrings}', 'Press the platform away by extending your knees and hips without locking out.', 'lb'),
  ('Staggered Stance Dumbbell Romanian Deadlift', 'staggered-stance-dumbbell-romanian-deadlift', 'strength', '{dumbbell}', '{hamstrings,glutes}', '{}', 'With one foot staggered behind, hinge at the hips and lower the dumbbells along your shins.', 'lb'),
  ('Dumbbell Sumo Goblet Squat', 'dumbbell-sumo-goblet-squat', 'strength', '{dumbbell}', '{quads,glutes}', '{adductors}', 'Feet wide, holding a dumbbell at your chest, squat down between your knees.', 'lb'),
  ('Dumbbell Walking Lunge', 'dumbbell-walking-lunge', 'strength', '{dumbbell}', '{quads,glutes}', '{}', 'Step forward into a lunge and continue alternating legs as you travel.', 'lb'),
  ('Dumbbell Hip Thrust', 'dumbbell-hip-thrust', 'strength', '{dumbbell,bench}', '{glutes}', '{hamstrings}', 'Upper back on a bench, drive your hips up with a dumbbell resting on your hips.', 'lb'),
  ('Reverse Crunch', 'reverse-crunch', 'core', '{bodyweight}', '{abs}', '{}', 'Lying on your back, curl your hips off the floor by bringing your knees toward your chest.', 'bodyweight'),
  ('Dumbbell Russian Twist', 'dumbbell-russian-twist', 'core', '{dumbbell}', '{obliques}', '{abs}', 'Seated with feet lifted, rotate the dumbbell side to side.', 'lb'),
  ('Banana Hold', 'banana-hold', 'core', '{bodyweight}', '{abs}', '{}', 'Lying on your back, lift shoulders and legs to form a slight curve and hold.', 'time'),
  ('Standing Quad Stretch', 'standing-quad-stretch', 'stretching', '{bodyweight}', '{quads}', '{}', 'Standing on one leg, pull the opposite heel toward your glutes.', 'time'),
  ('Hip Flexor Stretch', 'hip-flexor-stretch', 'stretching', '{bodyweight}', '{hip flexors}', '{}', 'From a kneeling lunge position, shift your hips forward.', 'time'),
  ('Butterfly Stretch', 'butterfly-stretch', 'stretching', '{bodyweight}', '{adductors}', '{}', 'Seated with soles of the feet together, gently press knees toward the floor.', 'time'),
  ('Child''s Pose', 'childs-pose', 'stretching', '{bodyweight}', '{lower back}', '{shoulders}', 'Kneel and sit back onto your heels while reaching your arms forward.', 'time'),
  ('Two Leg Hamstring Stretch', 'two-leg-hamstring-stretch', 'stretching', '{bodyweight}', '{hamstrings}', '{}', 'Seated with both legs extended, hinge forward from the hips.', 'time'),
  ('Standing Ankle Inversion Eversion', 'standing-ankle-inversion-eversion', 'warmup', '{bodyweight}', '{ankles}', '{}', 'Roll your ankle inward and outward through a controlled range of motion.', 'time'),
  ('Bodyweight Reverse Lunge', 'bodyweight-reverse-lunge', 'warmup', '{bodyweight}', '{quads,glutes}', '{}', 'Step backward into a lunge, then return to standing.', 'bodyweight'),
  ('Squat Shuffle', 'squat-shuffle', 'warmup', '{bodyweight}', '{quads,glutes}', '{}', 'Stay low in a quarter-squat and shuffle side to side.', 'time'),
  ('Dumbbell Romanian Deadlift', 'dumbbell-romanian-deadlift', 'strength', '{dumbbell}', '{hamstrings,glutes}', '{lower back}', 'Hinge at the hips, lowering the dumbbells along your shins while keeping your back flat.', 'lb'),
  ('Dumbbell Reverse Lunge', 'dumbbell-reverse-lunge', 'strength', '{dumbbell}', '{quads,glutes}', '{}', 'Holding dumbbells at your sides, step backward into a lunge.', 'lb'),
  ('Single Leg Leg Press', 'single-leg-leg-press', 'strength', '{machine}', '{quads,glutes}', '{hamstrings}', 'Press the platform away using one leg at a time.', 'lb'),
  ('Dumbbell Split Squat', 'dumbbell-split-squat', 'strength', '{dumbbell}', '{quads,glutes}', '{}', 'Rear foot elevated or staggered, lower straight down into a lunge position.', 'lb'),
  ('Dumbbell Plie Squat To Calf Raise', 'dumbbell-plie-squat-to-calf-raise', 'strength', '{dumbbell}', '{quads,glutes,calves}', '{adductors}', 'From a wide stance goblet squat, stand and finish with a calf raise.', 'lb'),
  ('Plank', 'plank', 'core', '{bodyweight}', '{abs}', '{shoulders}', 'Hold a straight line from head to heels, forearms on the floor.', 'time'),
  ('Slow Bicycle', 'slow-bicycle', 'core', '{bodyweight}', '{abs,obliques}', '{}', 'Lying on your back, slowly bring opposite elbow to opposite knee in a controlled bicycle motion.', 'bodyweight'),
  ('Toe Touch Crunch', 'toe-touch-crunch', 'core', '{bodyweight}', '{abs}', '{}', 'Legs extended toward the ceiling, crunch up reaching for your toes.', 'bodyweight'),
  ('Standing Calf Stretch', 'standing-calf-stretch', 'stretching', '{bodyweight}', '{calves}', '{}', 'Step one foot back and press the heel down while leaning into a wall.', 'time'),
  ('Seated Straddle Stretch', 'seated-straddle-stretch', 'stretching', '{bodyweight}', '{adductors,hamstrings}', '{}', 'Seated with legs wide, hinge forward from the hips.', 'time'),
  ('Hamstring Stretch', 'hamstring-stretch', 'stretching', '{bodyweight}', '{hamstrings}', '{}', 'Seated or standing, hinge forward with a straight leg to stretch the hamstring.', 'time'),
  ('Spine Rotation Stretch', 'spine-rotation-stretch', 'warmup', '{bodyweight}', '{spine,obliques}', '{}', 'Lying on your back with arms out, rock your bent knees side to side.', 'time'),
  ('Bodyweight Walking Lunge', 'bodyweight-walking-lunge', 'warmup', '{bodyweight}', '{quads,glutes}', '{}', 'Step forward into a lunge and continue alternating legs as you travel.', 'time'),
  ('Walk', 'walk', 'cardio', '{treadmill}', '{cardio,legs}', '{}', 'Maintain a brisk, steady walking pace.', 'time'),
  ('Standing Hamstring Stretch', 'standing-hamstring-stretch', 'stretching', '{bodyweight}', '{hamstrings}', '{}', 'Prop your heel on a low surface and hinge forward from the hips.', 'time'),
  ('Calf Stretch', 'calf-stretch', 'stretching', '{bodyweight}', '{calves}', '{}', 'Step one foot back and press the heel down while leaning into a wall.', 'time')
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Helper: seed a workout template from a JSON description.
-- ---------------------------------------------------------------------------
create or replace function seed_workout_template(
  p_slug text,
  p_name text,
  p_workout_type text,
  p_duration_minutes integer,
  p_description text,
  p_sections jsonb
) returns uuid as $$
declare
  v_workout_id uuid;
  v_section jsonb;
  v_section_id uuid;
  v_exercise jsonb;
  v_workout_exercise_id uuid;
  v_exercise_id uuid;
  v_set jsonb;
begin
  insert into workouts (name, slug, workout_type, estimated_duration_minutes, description, is_template)
  values (p_name, p_slug, p_workout_type, p_duration_minutes, p_description, true)
  on conflict (slug) do update set
    name = excluded.name,
    workout_type = excluded.workout_type,
    estimated_duration_minutes = excluded.estimated_duration_minutes,
    description = excluded.description
  returning id into v_workout_id;

  -- Re-seeding: wipe previous sections (cascades to exercises/sets) so this stays idempotent.
  delete from workout_sections where workout_id = v_workout_id;

  for v_section in select * from jsonb_array_elements(p_sections)
  loop
    insert into workout_sections (workout_id, section_type, title, order_index, repeat_count, notes)
    values (
      v_workout_id,
      v_section ->> 'type',
      v_section ->> 'title',
      (v_section ->> 'order')::int,
      coalesce((v_section ->> 'repeat')::int, 1),
      v_section ->> 'notes'
    )
    returning id into v_section_id;

    for v_exercise in select * from jsonb_array_elements(v_section -> 'exercises')
    loop
      select id into v_exercise_id from exercises where slug = v_exercise ->> 'slug';
      if v_exercise_id is null then
        raise exception 'Unknown exercise slug: %', v_exercise ->> 'slug';
      end if;

      insert into workout_exercises (section_id, exercise_id, order_index, side, tempo, rest_seconds, notes)
      values (
        v_section_id,
        v_exercise_id,
        (v_exercise ->> 'order')::int,
        coalesce(v_exercise ->> 'side', 'none'),
        v_exercise ->> 'tempo',
        (v_exercise ->> 'rest_seconds')::int,
        v_exercise ->> 'notes'
      )
      returning id into v_workout_exercise_id;

      for v_set in select * from jsonb_array_elements(v_exercise -> 'sets')
      loop
        insert into exercise_sets (
          workout_exercise_id, set_index, reps, weight, weight_unit,
          duration_seconds, distance, distance_unit, side, is_warmup, notes
        )
        values (
          v_workout_exercise_id,
          (v_set ->> 'set_index')::int,
          (v_set ->> 'reps')::int,
          (v_set ->> 'weight')::numeric,
          coalesce(v_set ->> 'weight_unit', 'lb'),
          (v_set ->> 'duration_seconds')::int,
          (v_set ->> 'distance')::numeric,
          v_set ->> 'distance_unit',
          coalesce(v_set ->> 'side', 'none'),
          coalesce((v_set ->> 'is_warmup')::boolean, false),
          v_set ->> 'notes'
        );
      end loop;
    end loop;
  end loop;

  return v_workout_id;
end;
$$ language plpgsql;

-- ---------------------------------------------------------------------------
-- Upper Body: A
-- ---------------------------------------------------------------------------
select seed_workout_template(
  'upper-body-a', 'Upper Body: A', 'upper_body', 52, 'Chest, back and arms strength with a rotator-cuff warm-up and stretch finisher.',
  $$[
    {"type":"warmup","title":"Warm-up","order":1,"exercises":[
      {"slug":"arm-circle","order":1,"sets":[
        {"set_index":1,"duration_seconds":20,"notes":"Forwards"},
        {"set_index":2,"duration_seconds":20,"notes":"Backwards"}
      ]},
      {"slug":"wall-reach","order":2,"sets":[{"set_index":1,"duration_seconds":20}]},
      {"slug":"cable-internal-rotation","order":3,"sets":[
        {"set_index":1,"reps":10,"weight":10},
        {"set_index":2,"reps":10,"weight":10}
      ]},
      {"slug":"cable-external-rotation","order":4,"sets":[
        {"set_index":1,"reps":10,"weight":10},
        {"set_index":2,"reps":10,"weight":10}
      ]},
      {"slug":"cable-tricep-pushdown","order":5,"sets":[{"set_index":1,"reps":15,"weight":30}]}
    ]},
    {"type":"set","title":"Set A","order":2,"exercises":[
      {"slug":"single-arm-dumbbell-chest-fly","order":1,"sets":[
        {"set_index":1,"reps":12,"weight":10},
        {"set_index":2,"reps":12,"weight":10},
        {"set_index":3,"reps":10,"weight":15},
        {"set_index":4,"reps":10,"weight":15},
        {"set_index":5,"reps":8,"weight":20},
        {"set_index":6,"reps":8,"weight":20}
      ]}
    ]},
    {"type":"set","title":"Set B","order":3,"exercises":[
      {"slug":"alternating-dumbbell-bench-press","order":1,"sets":[
        {"set_index":1,"reps":8,"weight":15,"notes":"Warm up"},
        {"set_index":2,"reps":12,"weight":20},
        {"set_index":3,"reps":10,"weight":25},
        {"set_index":4,"reps":8,"weight":30}
      ]}
    ]},
    {"type":"superset","title":"Superset A","order":4,"repeat":2,"exercises":[
      {"slug":"seated-dumbbell-reverse-fly","order":1,"sets":[{"set_index":1,"reps":12,"weight":10}]},
      {"slug":"seated-dumbbell-overhead-press","order":2,"sets":[{"set_index":1,"reps":10,"weight":20}]}
    ]},
    {"type":"set","title":"Set C","order":5,"exercises":[
      {"slug":"dumbbell-bench-one-arm-row","order":1,"sets":[
        {"set_index":1,"reps":12,"weight":25},
        {"set_index":2,"reps":12,"weight":25},
        {"set_index":3,"reps":12,"weight":25},
        {"set_index":4,"reps":12,"weight":25}
      ]}
    ]},
    {"type":"set","title":"Set D","order":6,"exercises":[
      {"slug":"wide-lat-pulldown","order":1,"sets":[
        {"set_index":1,"reps":12,"weight":60},
        {"set_index":2,"reps":12,"weight":60},
        {"set_index":3,"reps":12,"weight":60}
      ]}
    ]},
    {"type":"superset","title":"Superset B","order":7,"repeat":2,"exercises":[
      {"slug":"dumbbell-hammer-curl","order":1,"sets":[{"set_index":1,"reps":12,"weight":15}]},
      {"slug":"dumbbell-tate-press","order":2,"sets":[{"set_index":1,"reps":12,"weight":15}]}
    ]},
    {"type":"stretching","title":"Stretching","order":8,"exercises":[
      {"slug":"pec-stretch","order":1,"sets":[
        {"set_index":1,"duration_seconds":20,"side":"left"},
        {"set_index":2,"duration_seconds":20,"side":"right"}
      ]},
      {"slug":"tricep-stretch","order":2,"sets":[
        {"set_index":1,"duration_seconds":20,"side":"left"},
        {"set_index":2,"duration_seconds":20,"side":"right"}
      ]},
      {"slug":"palm-up-forearm-stretch","order":3,"sets":[
        {"set_index":1,"duration_seconds":20,"side":"left"},
        {"set_index":2,"duration_seconds":20,"side":"right"}
      ]},
      {"slug":"shoulder-stretch","order":4,"sets":[
        {"set_index":1,"duration_seconds":20,"side":"left"},
        {"set_index":2,"duration_seconds":20,"side":"right"}
      ]},
      {"slug":"cobra-stretch","order":5,"sets":[{"set_index":1,"duration_seconds":20}]}
    ]}
  ]$$::jsonb
);

-- ---------------------------------------------------------------------------
-- Upper Body: B
-- ---------------------------------------------------------------------------
select seed_workout_template(
  'upper-body-b', 'Upper Body: B', 'upper_body', 50, 'Shoulder-focused pressing and pulling with an incline chest finisher.',
  $$[
    {"type":"warmup","title":"Warm-up","order":1,"exercises":[
      {"slug":"arm-circle","order":1,"sets":[
        {"set_index":1,"duration_seconds":20,"notes":"Forwards"},
        {"set_index":2,"duration_seconds":20,"notes":"Backwards"}
      ]},
      {"slug":"cable-internal-rotation","order":2,"sets":[
        {"set_index":1,"reps":10,"weight":10},
        {"set_index":2,"reps":10,"weight":10}
      ]},
      {"slug":"cable-external-rotation","order":3,"sets":[
        {"set_index":1,"reps":10,"weight":10},
        {"set_index":2,"reps":10,"weight":10}
      ]},
      {"slug":"cable-archer-row","order":4,"sets":[{"set_index":1,"reps":10,"weight":20}]},
      {"slug":"incline-push-up","order":5,"sets":[{"set_index":1,"reps":12}]}
    ]},
    {"type":"set","title":"Set A","order":2,"exercises":[
      {"slug":"seated-dumbbell-overhead-press","order":1,"sets":[
        {"set_index":1,"reps":10,"weight":15},
        {"set_index":2,"reps":12,"weight":20},
        {"set_index":3,"reps":10,"weight":25},
        {"set_index":4,"reps":8,"weight":30}
      ]}
    ]},
    {"type":"set","title":"Set B","order":3,"exercises":[
      {"slug":"dumbbell-incline-bench-press","order":1,"notes":"Pause on your chest for 2-3s then press. Do this for all 3 sets.","sets":[
        {"set_index":1,"reps":10,"weight":30},
        {"set_index":2,"reps":10,"weight":30},
        {"set_index":3,"reps":10,"weight":30}
      ]}
    ]},
    {"type":"superset","title":"Superset A","order":4,"repeat":2,"exercises":[
      {"slug":"dumbbell-lateral-raise","order":1,"sets":[{"set_index":1,"reps":12,"weight":15}]},
      {"slug":"dumbbell-front-raise","order":2,"sets":[{"set_index":1,"reps":12,"weight":15}]}
    ]},
    {"type":"set","title":"Set C","order":5,"exercises":[
      {"slug":"dumbbell-bench-one-arm-row","order":1,"sets":[
        {"set_index":1,"reps":10,"weight":30},
        {"set_index":2,"reps":10,"weight":30}
      ]}
    ]},
    {"type":"set","title":"Set D","order":6,"exercises":[
      {"slug":"machine-row","order":1,"sets":[
        {"set_index":1,"reps":12,"weight":120},
        {"set_index":2,"reps":12,"weight":120}
      ]}
    ]},
    {"type":"superset","title":"Superset B","order":7,"repeat":2,"exercises":[
      {"slug":"cable-hammer-curl","order":1,"notes":"Use the rope!","sets":[{"set_index":1,"reps":10,"weight":70}]},
      {"slug":"cable-tricep-pushdown","order":2,"sets":[{"set_index":1,"reps":12,"weight":60}]}
    ]},
    {"type":"stretching","title":"Stretching","order":8,"exercises":[
      {"slug":"pec-stretch","order":1,"sets":[
        {"set_index":1,"duration_seconds":20,"side":"left"},
        {"set_index":2,"duration_seconds":20,"side":"right"}
      ]},
      {"slug":"tricep-stretch","order":2,"sets":[
        {"set_index":1,"duration_seconds":20,"side":"left"},
        {"set_index":2,"duration_seconds":20,"side":"right"}
      ]},
      {"slug":"palm-up-forearm-stretch","order":3,"sets":[
        {"set_index":1,"duration_seconds":20,"side":"left"},
        {"set_index":2,"duration_seconds":20,"side":"right"}
      ]},
      {"slug":"shoulder-stretch","order":4,"sets":[
        {"set_index":1,"duration_seconds":20,"side":"left"},
        {"set_index":2,"duration_seconds":20,"side":"right"}
      ]},
      {"slug":"prayer-stretch","order":5,"sets":[{"set_index":1,"duration_seconds":20}]}
    ]}
  ]$$::jsonb
);

-- ---------------------------------------------------------------------------
-- Lower Body: A
-- ---------------------------------------------------------------------------
select seed_workout_template(
  'lower-body-a', 'Lower Body: A', 'lower_body', 49, 'Quad-dominant leg strength with a core circuit finisher.',
  $$[
    {"type":"warmup","title":"Warm-up","order":1,"exercises":[
      {"slug":"bodyweight-standing-hip-rotation","order":1,"sets":[
        {"set_index":1,"duration_seconds":20,"side":"left"},
        {"set_index":2,"duration_seconds":20,"side":"right"}
      ]},
      {"slug":"walking-frankenstein","order":2,"notes":"No need to walk","sets":[{"set_index":1,"duration_seconds":20}]},
      {"slug":"bodyweight-froggys","order":3,"sets":[{"set_index":1,"reps":12}]},
      {"slug":"bodyweight-squat","order":4,"sets":[{"set_index":1,"reps":15}]},
      {"slug":"bodyweight-good-morning","order":5,"sets":[{"set_index":1,"reps":12}]}
    ]},
    {"type":"set","title":"Set A","order":2,"exercises":[
      {"slug":"machine-leg-press","order":1,"sets":[
        {"set_index":1,"reps":15,"weight":190},
        {"set_index":2,"reps":12,"weight":210},
        {"set_index":3,"reps":10,"weight":230}
      ]}
    ]},
    {"type":"set","title":"Set B","order":3,"exercises":[
      {"slug":"staggered-stance-dumbbell-romanian-deadlift","order":1,"sets":[
        {"set_index":1,"reps":10,"weight":25},
        {"set_index":2,"reps":10,"weight":25},
        {"set_index":3,"reps":10,"weight":25},
        {"set_index":4,"reps":10,"weight":25},
        {"set_index":5,"reps":10,"weight":25},
        {"set_index":6,"reps":10,"weight":25}
      ]}
    ]},
    {"type":"set","title":"Set C","order":4,"exercises":[
      {"slug":"dumbbell-sumo-goblet-squat","order":1,"sets":[
        {"set_index":1,"reps":12,"weight":30},
        {"set_index":2,"reps":12,"weight":30},
        {"set_index":3,"reps":12,"weight":30}
      ]}
    ]},
    {"type":"set","title":"Set D","order":5,"exercises":[
      {"slug":"dumbbell-walking-lunge","order":1,"sets":[
        {"set_index":1,"reps":10,"weight":15},
        {"set_index":2,"reps":10,"weight":15},
        {"set_index":3,"reps":10,"weight":15}
      ]}
    ]},
    {"type":"set","title":"Set E","order":6,"exercises":[
      {"slug":"dumbbell-hip-thrust","order":1,"sets":[
        {"set_index":1,"reps":10,"weight":25},
        {"set_index":2,"reps":10,"weight":25},
        {"set_index":3,"reps":10,"weight":25}
      ]}
    ]},
    {"type":"circuit","title":"Core Circuit","order":7,"repeat":2,"exercises":[
      {"slug":"reverse-crunch","order":1,"sets":[{"set_index":1,"reps":12}]},
      {"slug":"dumbbell-russian-twist","order":2,"sets":[{"set_index":1,"reps":15,"weight":10}]},
      {"slug":"banana-hold","order":3,"sets":[{"set_index":1,"duration_seconds":30}]}
    ]},
    {"type":"stretching","title":"Stretching","order":8,"exercises":[
      {"slug":"standing-quad-stretch","order":1,"sets":[
        {"set_index":1,"duration_seconds":30,"side":"left"},
        {"set_index":2,"duration_seconds":30,"side":"right"}
      ]},
      {"slug":"hip-flexor-stretch","order":2,"sets":[
        {"set_index":1,"duration_seconds":30,"side":"left"},
        {"set_index":2,"duration_seconds":30,"side":"right"}
      ]},
      {"slug":"butterfly-stretch","order":3,"sets":[{"set_index":1,"duration_seconds":30}]},
      {"slug":"childs-pose","order":4,"sets":[{"set_index":1,"duration_seconds":30}]},
      {"slug":"two-leg-hamstring-stretch","order":5,"sets":[{"set_index":1,"duration_seconds":30}]}
    ]}
  ]$$::jsonb
);

-- ---------------------------------------------------------------------------
-- Lower Body: B
-- ---------------------------------------------------------------------------
select seed_workout_template(
  'lower-body-b', 'Lower Body: B', 'lower_body', 51, 'Posterior-chain and unilateral leg strength with a core circuit finisher.',
  $$[
    {"type":"warmup","title":"Warm-up","order":1,"exercises":[
      {"slug":"standing-ankle-inversion-eversion","order":1,"sets":[
        {"set_index":1,"duration_seconds":15,"side":"left"},
        {"set_index":2,"duration_seconds":15,"side":"right"}
      ]},
      {"slug":"bodyweight-standing-hip-rotation","order":2,"sets":[
        {"set_index":1,"duration_seconds":30,"side":"left"},
        {"set_index":2,"duration_seconds":30,"side":"right"}
      ]},
      {"slug":"bodyweight-froggys","order":3,"sets":[{"set_index":1,"reps":12}]},
      {"slug":"bodyweight-reverse-lunge","order":4,"sets":[{"set_index":1,"reps":8}]},
      {"slug":"squat-shuffle","order":5,"notes":"Stay nice and low","sets":[{"set_index":1,"duration_seconds":30}]}
    ]},
    {"type":"set","title":"Set A","order":2,"exercises":[
      {"slug":"dumbbell-romanian-deadlift","order":1,"sets":[
        {"set_index":1,"reps":8,"weight":12.5},
        {"set_index":2,"reps":6,"weight":30},
        {"set_index":3,"reps":10,"weight":35},
        {"set_index":4,"reps":10,"weight":35}
      ]}
    ]},
    {"type":"set","title":"Set B","order":3,"exercises":[
      {"slug":"dumbbell-reverse-lunge","order":1,"sets":[
        {"set_index":1,"reps":10,"weight":20},
        {"set_index":2,"reps":10,"weight":20}
      ]}
    ]},
    {"type":"set","title":"Set C","order":4,"exercises":[
      {"slug":"single-leg-leg-press","order":1,"sets":[
        {"set_index":1,"reps":12,"weight":100},
        {"set_index":2,"reps":12,"weight":100},
        {"set_index":3,"reps":12,"weight":100},
        {"set_index":4,"reps":12,"weight":100}
      ]}
    ]},
    {"type":"set","title":"Set D","order":5,"repeat":2,"exercises":[
      {"slug":"dumbbell-split-squat","order":1,"sets":[
        {"set_index":1,"reps":10,"weight":15},
        {"set_index":2,"reps":10,"weight":15}
      ]}
    ]},
    {"type":"set","title":"Set E","order":6,"exercises":[
      {"slug":"dumbbell-plie-squat-to-calf-raise","order":1,"sets":[
        {"set_index":1,"reps":12,"weight":25},
        {"set_index":2,"reps":12,"weight":25},
        {"set_index":3,"reps":12,"weight":25}
      ]}
    ]},
    {"type":"circuit","title":"Core Circuit","order":7,"repeat":2,"exercises":[
      {"slug":"plank","order":1,"sets":[{"set_index":1,"duration_seconds":30}]},
      {"slug":"slow-bicycle","order":2,"sets":[{"set_index":1,"reps":15}]},
      {"slug":"toe-touch-crunch","order":3,"sets":[{"set_index":1,"reps":10}]}
    ]},
    {"type":"stretching","title":"Stretching","order":8,"exercises":[
      {"slug":"standing-quad-stretch","order":1,"sets":[
        {"set_index":1,"duration_seconds":30,"side":"left"},
        {"set_index":2,"duration_seconds":30,"side":"right"}
      ]},
      {"slug":"standing-calf-stretch","order":2,"sets":[
        {"set_index":1,"duration_seconds":30,"side":"left"},
        {"set_index":2,"duration_seconds":30,"side":"right"}
      ]},
      {"slug":"hip-flexor-stretch","order":3,"sets":[
        {"set_index":1,"duration_seconds":30,"side":"left"},
        {"set_index":2,"duration_seconds":30,"side":"right"}
      ]},
      {"slug":"seated-straddle-stretch","order":4,"sets":[{"set_index":1,"duration_seconds":30}]},
      {"slug":"hamstring-stretch","order":5,"sets":[{"set_index":1,"duration_seconds":30}]}
    ]}
  ]$$::jsonb
);

-- ---------------------------------------------------------------------------
-- Cardio: A
-- ---------------------------------------------------------------------------
select seed_workout_template(
  'cardio-a', 'Cardio: A', 'cardio', 40, 'Steady-state incline walk bookended by a dynamic warm-up and cool-down.',
  $$[
    {"type":"warmup","title":"Warm-up","order":1,"exercises":[
      {"slug":"spine-rotation-stretch","order":1,"sets":[
        {"set_index":1,"duration_seconds":15,"side":"left"},
        {"set_index":2,"duration_seconds":15,"side":"right"}
      ]},
      {"slug":"bodyweight-standing-hip-rotation","order":2,"sets":[
        {"set_index":1,"duration_seconds":20,"side":"left"},
        {"set_index":2,"duration_seconds":20,"side":"right"}
      ]},
      {"slug":"standing-ankle-inversion-eversion","order":3,"sets":[
        {"set_index":1,"duration_seconds":30,"side":"left"},
        {"set_index":2,"duration_seconds":30,"side":"right"}
      ]},
      {"slug":"bodyweight-walking-lunge","order":4,"sets":[{"set_index":1,"duration_seconds":20}]}
    ]},
    {"type":"cardio","title":"Time To Move!","order":2,"exercises":[
      {"slug":"walk","order":1,"notes":"Set incline @ 1-2 and speed @ 3.4-3.7","sets":[{"set_index":1,"duration_seconds":1800}]}
    ]},
    {"type":"cooldown","title":"Cool-Down","order":3,"exercises":[
      {"slug":"standing-quad-stretch","order":1,"sets":[
        {"set_index":1,"duration_seconds":30,"side":"left"},
        {"set_index":2,"duration_seconds":30,"side":"right"}
      ]},
      {"slug":"standing-hamstring-stretch","order":2,"sets":[{"set_index":1,"duration_seconds":30}]},
      {"slug":"calf-stretch","order":3,"sets":[
        {"set_index":1,"duration_seconds":30,"side":"left"},
        {"set_index":2,"duration_seconds":30,"side":"right"}
      ]}
    ]}
  ]$$::jsonb
);

drop function seed_workout_template(text, text, text, integer, text, jsonb);
