-- Adds 10 new "Extras" workouts aimed at fat loss with a chest/core focus
-- (full-body + core conditioning — spot-reduction isn't real physiology, so
-- these build overall conditioning and strengthen/tone chest and abs rather
-- than promise to target belly fat specifically), and backfills your main
-- weekday schedule + these 10 extras across the next 3 months. Purely
-- additive: new exercises, new workout templates, new scheduled_workouts
-- rows. Nothing existing is modified or deleted.

-- ---------------------------------------------------------------------------
-- New exercises
-- ---------------------------------------------------------------------------
insert into exercises (name, slug, category, equipment, primary_muscles, secondary_muscles, instructions, default_unit)
values
  ('Push Up', 'push-up', 'strength', '{bodyweight}', '{chest}', '{triceps,shoulders}', 'Hands under shoulders, lower your chest to the floor keeping your body in a straight line, then press back up.', 'bodyweight'),
  ('Burpee', 'burpee', 'cardio', '{bodyweight}', '{full body}', '{}', 'Drop into a squat, kick your feet back to a plank, do a push-up, jump your feet back in, then explode up into a jump.', 'bodyweight'),
  ('Mountain Climbers', 'mountain-climbers', 'cardio', '{bodyweight}', '{core}', '{shoulders}', 'From a plank position, drive your knees toward your chest one at a time at a quick pace.', 'time'),
  ('Jumping Jacks', 'jumping-jacks', 'cardio', '{bodyweight}', '{full body}', '{}', 'Jump your feet out while raising your arms overhead, then jump back to the starting position.', 'time'),
  ('High Knees', 'high-knees', 'cardio', '{bodyweight}', '{legs,core}', '{}', 'Run in place, driving your knees up toward hip height as quickly as you can.', 'time'),
  ('Bicycle Crunch', 'bicycle-crunch', 'core', '{bodyweight}', '{abs,obliques}', '{}', 'Lying on your back, bring opposite elbow to opposite knee in a smooth pedaling motion.', 'bodyweight'),
  ('V-Up', 'v-up', 'core', '{bodyweight}', '{abs}', '{}', 'Lying flat, simultaneously lift your legs and torso to form a V, reaching your hands toward your toes.', 'bodyweight'),
  ('Dead Bug', 'dead-bug', 'core', '{bodyweight}', '{abs}', '{lower back}', 'Lying on your back with arms up and knees bent 90°, slowly extend the opposite arm and leg while keeping your lower back pressed into the floor.', 'bodyweight'),
  ('Plank Shoulder Tap', 'plank-shoulder-tap', 'core', '{bodyweight}', '{abs,shoulders}', '{}', 'From a plank, alternate tapping each hand to the opposite shoulder while keeping your hips as still as possible.', 'bodyweight'),
  ('Side Plank', 'side-plank', 'core', '{bodyweight}', '{obliques}', '{}', 'Balance on one forearm and the side of your foot, keeping your body in a straight line with your hips lifted.', 'time'),
  ('Dumbbell Squat To Press', 'dumbbell-squat-to-press', 'strength', '{dumbbell}', '{legs,shoulders}', '{}', 'Holding dumbbells at your shoulders, squat down, then stand and press the dumbbells overhead as you rise.', 'lb'),
  ('Jump Squat', 'jump-squat', 'cardio', '{bodyweight}', '{quads,glutes}', '{}', 'Squat down, then explode upward into a jump, landing softly back into the squat.', 'bodyweight'),
  ('Flutter Kicks', 'flutter-kicks', 'core', '{bodyweight}', '{abs}', '{}', 'Lying on your back with legs extended, alternate small up-and-down kicks a few inches off the floor.', 'time')
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- 10 new workout templates
-- ---------------------------------------------------------------------------
select seed_workout_template(
  'fat-burn-hiit-a', 'Fat Burn HIIT A', 'cardio', 20, 'Fast-paced full-body intervals to maximize calorie burn.',
  $$[
    {"type":"warmup","title":"Warm-up","order":1,"exercises":[
      {"slug":"jumping-jacks","order":1,"sets":[{"set_index":1,"duration_seconds":30}]},
      {"slug":"arm-circle","order":2,"sets":[{"set_index":1,"duration_seconds":20}]},
      {"slug":"bodyweight-standing-hip-rotation","order":3,"sets":[
        {"set_index":1,"duration_seconds":20,"side":"left"},
        {"set_index":2,"duration_seconds":20,"side":"right"}
      ]}
    ]},
    {"type":"circuit","title":"Metabolic Circuit","order":2,"repeat":3,"exercises":[
      {"slug":"burpee","order":1,"rest_seconds":15,"sets":[{"set_index":1,"reps":10}]},
      {"slug":"mountain-climbers","order":2,"rest_seconds":15,"sets":[{"set_index":1,"duration_seconds":30}]},
      {"slug":"jump-squat","order":3,"rest_seconds":15,"sets":[{"set_index":1,"reps":12}]},
      {"slug":"push-up","order":4,"rest_seconds":15,"sets":[{"set_index":1,"reps":10}]}
    ]},
    {"type":"cooldown","title":"Cool-Down","order":3,"exercises":[
      {"slug":"standing-quad-stretch","order":1,"sets":[
        {"set_index":1,"duration_seconds":30,"side":"left"},
        {"set_index":2,"duration_seconds":30,"side":"right"}
      ]},
      {"slug":"childs-pose","order":2,"sets":[{"set_index":1,"duration_seconds":30}]}
    ]}
  ]$$::jsonb
);

select seed_workout_template(
  'fat-burn-hiit-b', 'Fat Burn HIIT B', 'cardio', 20, 'A second interval circuit to rotate in for variety.',
  $$[
    {"type":"warmup","title":"Warm-up","order":1,"exercises":[
      {"slug":"jumping-jacks","order":1,"sets":[{"set_index":1,"duration_seconds":30}]},
      {"slug":"high-knees","order":2,"sets":[{"set_index":1,"duration_seconds":30}]},
      {"slug":"arm-circle","order":3,"sets":[{"set_index":1,"duration_seconds":20}]}
    ]},
    {"type":"circuit","title":"Cardio Circuit","order":2,"repeat":3,"exercises":[
      {"slug":"high-knees","order":1,"rest_seconds":15,"sets":[{"set_index":1,"duration_seconds":30}]},
      {"slug":"push-up","order":2,"rest_seconds":15,"sets":[{"set_index":1,"reps":12}]},
      {"slug":"jump-squat","order":3,"rest_seconds":15,"sets":[{"set_index":1,"reps":15}]},
      {"slug":"mountain-climbers","order":4,"rest_seconds":15,"sets":[{"set_index":1,"duration_seconds":30}]}
    ]},
    {"type":"cooldown","title":"Cool-Down","order":3,"exercises":[
      {"slug":"hamstring-stretch","order":1,"sets":[{"set_index":1,"duration_seconds":30}]},
      {"slug":"cobra-stretch","order":2,"sets":[{"set_index":1,"duration_seconds":20}]}
    ]}
  ]$$::jsonb
);

select seed_workout_template(
  'chest-core-sculpt-a', 'Chest & Core Sculpt A', 'upper_body', 30, 'Chest strength paired with a core finisher.',
  $$[
    {"type":"warmup","title":"Warm-up","order":1,"exercises":[
      {"slug":"arm-circle","order":1,"sets":[{"set_index":1,"duration_seconds":20}]},
      {"slug":"wall-reach","order":2,"sets":[{"set_index":1,"duration_seconds":20}]}
    ]},
    {"type":"set","title":"Set A","order":2,"exercises":[
      {"slug":"push-up","order":1,"sets":[
        {"set_index":1,"reps":12},
        {"set_index":2,"reps":12},
        {"set_index":3,"reps":12}
      ]}
    ]},
    {"type":"superset","title":"Superset A","order":3,"repeat":2,"exercises":[
      {"slug":"single-arm-dumbbell-chest-fly","order":1,"sets":[{"set_index":1,"reps":12,"weight":10}]},
      {"slug":"dumbbell-front-raise","order":2,"sets":[{"set_index":1,"reps":12,"weight":10}]}
    ]},
    {"type":"circuit","title":"Core Finisher","order":4,"repeat":2,"exercises":[
      {"slug":"bicycle-crunch","order":1,"rest_seconds":15,"sets":[{"set_index":1,"reps":20}]},
      {"slug":"plank-shoulder-tap","order":2,"rest_seconds":15,"sets":[{"set_index":1,"reps":16}]},
      {"slug":"dead-bug","order":3,"rest_seconds":15,"sets":[{"set_index":1,"reps":12}]}
    ]},
    {"type":"stretching","title":"Stretching","order":5,"exercises":[
      {"slug":"pec-stretch","order":1,"sets":[
        {"set_index":1,"duration_seconds":20,"side":"left"},
        {"set_index":2,"duration_seconds":20,"side":"right"}
      ]},
      {"slug":"childs-pose","order":2,"sets":[{"set_index":1,"duration_seconds":20}]}
    ]}
  ]$$::jsonb
);

select seed_workout_template(
  'chest-core-sculpt-b', 'Chest & Core Sculpt B', 'upper_body', 30, 'Incline pressing strength with an ab-focused finisher.',
  $$[
    {"type":"warmup","title":"Warm-up","order":1,"exercises":[
      {"slug":"arm-circle","order":1,"sets":[{"set_index":1,"duration_seconds":20}]},
      {"slug":"cable-internal-rotation","order":2,"sets":[{"set_index":1,"reps":10,"weight":10}]},
      {"slug":"cable-external-rotation","order":3,"sets":[{"set_index":1,"reps":10,"weight":10}]}
    ]},
    {"type":"set","title":"Set A","order":2,"exercises":[
      {"slug":"dumbbell-incline-bench-press","order":1,"sets":[
        {"set_index":1,"reps":10,"weight":20},
        {"set_index":2,"reps":10,"weight":20},
        {"set_index":3,"reps":10,"weight":20}
      ]}
    ]},
    {"type":"superset","title":"Superset A","order":3,"repeat":2,"exercises":[
      {"slug":"dumbbell-tate-press","order":1,"sets":[{"set_index":1,"reps":12,"weight":15}]},
      {"slug":"dumbbell-lateral-raise","order":2,"sets":[{"set_index":1,"reps":12,"weight":10}]}
    ]},
    {"type":"circuit","title":"Core Finisher","order":4,"repeat":2,"exercises":[
      {"slug":"v-up","order":1,"rest_seconds":15,"sets":[{"set_index":1,"reps":15}]},
      {"slug":"side-plank","order":2,"rest_seconds":15,"sets":[
        {"set_index":1,"duration_seconds":20,"side":"left"},
        {"set_index":2,"duration_seconds":20,"side":"right"}
      ]},
      {"slug":"reverse-crunch","order":3,"rest_seconds":15,"sets":[{"set_index":1,"reps":15}]}
    ]},
    {"type":"stretching","title":"Stretching","order":5,"exercises":[
      {"slug":"pec-stretch","order":1,"sets":[
        {"set_index":1,"duration_seconds":20,"side":"left"},
        {"set_index":2,"duration_seconds":20,"side":"right"}
      ]},
      {"slug":"tricep-stretch","order":2,"sets":[
        {"set_index":1,"duration_seconds":20,"side":"left"},
        {"set_index":2,"duration_seconds":20,"side":"right"}
      ]},
      {"slug":"cobra-stretch","order":3,"sets":[{"set_index":1,"duration_seconds":20}]}
    ]}
  ]$$::jsonb
);

select seed_workout_template(
  'metabolic-full-body-a', 'Metabolic Full Body A', 'full_body', 25, 'Full-body circuit mixing strength and cardio for calorie burn.',
  $$[
    {"type":"warmup","title":"Warm-up","order":1,"exercises":[
      {"slug":"bodyweight-squat","order":1,"sets":[{"set_index":1,"reps":12}]},
      {"slug":"walking-frankenstein","order":2,"sets":[{"set_index":1,"duration_seconds":20}]},
      {"slug":"arm-circle","order":3,"sets":[{"set_index":1,"duration_seconds":20}]}
    ]},
    {"type":"circuit","title":"Full Body Circuit","order":2,"repeat":3,"exercises":[
      {"slug":"dumbbell-squat-to-press","order":1,"rest_seconds":15,"sets":[{"set_index":1,"reps":10,"weight":15}]},
      {"slug":"push-up","order":2,"rest_seconds":15,"sets":[{"set_index":1,"reps":10}]},
      {"slug":"mountain-climbers","order":3,"rest_seconds":15,"sets":[{"set_index":1,"duration_seconds":30}]},
      {"slug":"jump-squat","order":4,"rest_seconds":15,"sets":[{"set_index":1,"reps":10}]}
    ]},
    {"type":"stretching","title":"Stretching","order":3,"exercises":[
      {"slug":"standing-quad-stretch","order":1,"sets":[
        {"set_index":1,"duration_seconds":20,"side":"left"},
        {"set_index":2,"duration_seconds":20,"side":"right"}
      ]},
      {"slug":"standing-calf-stretch","order":2,"sets":[
        {"set_index":1,"duration_seconds":20,"side":"left"},
        {"set_index":2,"duration_seconds":20,"side":"right"}
      ]}
    ]}
  ]$$::jsonb
);

select seed_workout_template(
  'metabolic-full-body-b', 'Metabolic Full Body B', 'full_body', 25, 'A second full-body metabolic circuit for variety.',
  $$[
    {"type":"warmup","title":"Warm-up","order":1,"exercises":[
      {"slug":"jumping-jacks","order":1,"sets":[{"set_index":1,"duration_seconds":30}]},
      {"slug":"bodyweight-standing-hip-rotation","order":2,"sets":[
        {"set_index":1,"duration_seconds":20,"side":"left"},
        {"set_index":2,"duration_seconds":20,"side":"right"}
      ]}
    ]},
    {"type":"circuit","title":"Full Body Circuit","order":2,"repeat":3,"exercises":[
      {"slug":"burpee","order":1,"rest_seconds":15,"sets":[{"set_index":1,"reps":8}]},
      {"slug":"dumbbell-walking-lunge","order":2,"rest_seconds":15,"sets":[{"set_index":1,"reps":10,"weight":15}]},
      {"slug":"plank-shoulder-tap","order":3,"rest_seconds":15,"sets":[{"set_index":1,"reps":16}]},
      {"slug":"high-knees","order":4,"rest_seconds":15,"sets":[{"set_index":1,"duration_seconds":30}]}
    ]},
    {"type":"stretching","title":"Stretching","order":3,"exercises":[
      {"slug":"hip-flexor-stretch","order":1,"sets":[
        {"set_index":1,"duration_seconds":20,"side":"left"},
        {"set_index":2,"duration_seconds":20,"side":"right"}
      ]},
      {"slug":"hamstring-stretch","order":2,"sets":[{"set_index":1,"duration_seconds":20}]}
    ]}
  ]$$::jsonb
);

select seed_workout_template(
  'core-blast-quick-10', 'Core Blast (Quick 10)', 'core', 12, 'A short, intense ab circuit for a day you''re short on time.',
  $$[
    {"type":"warmup","title":"Warm-up","order":1,"exercises":[
      {"slug":"spine-rotation-stretch","order":1,"sets":[
        {"set_index":1,"duration_seconds":15,"side":"left"},
        {"set_index":2,"duration_seconds":15,"side":"right"}
      ]},
      {"slug":"cobra-stretch","order":2,"sets":[{"set_index":1,"duration_seconds":15}]}
    ]},
    {"type":"circuit","title":"Core Circuit","order":2,"repeat":3,"exercises":[
      {"slug":"bicycle-crunch","order":1,"rest_seconds":10,"sets":[{"set_index":1,"reps":20}]},
      {"slug":"reverse-crunch","order":2,"rest_seconds":10,"sets":[{"set_index":1,"reps":15}]},
      {"slug":"plank","order":3,"rest_seconds":10,"sets":[{"set_index":1,"duration_seconds":30}]},
      {"slug":"flutter-kicks","order":4,"rest_seconds":10,"sets":[{"set_index":1,"duration_seconds":30}]}
    ]},
    {"type":"stretching","title":"Stretching","order":3,"exercises":[
      {"slug":"childs-pose","order":1,"sets":[{"set_index":1,"duration_seconds":20}]}
    ]}
  ]$$::jsonb
);

select seed_workout_template(
  'upper-body-abs-combo', 'Upper Body & Abs Combo', 'upper_body', 30, 'Back and biceps strength with a chest and ab finisher.',
  $$[
    {"type":"warmup","title":"Warm-up","order":1,"exercises":[
      {"slug":"arm-circle","order":1,"sets":[{"set_index":1,"duration_seconds":20}]},
      {"slug":"incline-push-up","order":2,"sets":[{"set_index":1,"reps":10}]}
    ]},
    {"type":"set","title":"Set A","order":2,"exercises":[
      {"slug":"dumbbell-bench-one-arm-row","order":1,"sets":[
        {"set_index":1,"reps":12,"weight":20},
        {"set_index":2,"reps":12,"weight":20},
        {"set_index":3,"reps":12,"weight":20}
      ]}
    ]},
    {"type":"superset","title":"Superset A","order":3,"repeat":2,"exercises":[
      {"slug":"push-up","order":1,"sets":[{"set_index":1,"reps":12}]},
      {"slug":"dumbbell-hammer-curl","order":2,"sets":[{"set_index":1,"reps":12,"weight":15}]}
    ]},
    {"type":"circuit","title":"Core Finisher","order":4,"repeat":2,"exercises":[
      {"slug":"v-up","order":1,"rest_seconds":15,"sets":[{"set_index":1,"reps":15}]},
      {"slug":"toe-touch-crunch","order":2,"rest_seconds":15,"sets":[{"set_index":1,"reps":12}]},
      {"slug":"banana-hold","order":3,"rest_seconds":15,"sets":[{"set_index":1,"duration_seconds":30}]}
    ]},
    {"type":"stretching","title":"Stretching","order":5,"exercises":[
      {"slug":"shoulder-stretch","order":1,"sets":[
        {"set_index":1,"duration_seconds":20,"side":"left"},
        {"set_index":2,"duration_seconds":20,"side":"right"}
      ]},
      {"slug":"tricep-stretch","order":2,"sets":[
        {"set_index":1,"duration_seconds":20,"side":"left"},
        {"set_index":2,"duration_seconds":20,"side":"right"}
      ]}
    ]}
  ]$$::jsonb
);

select seed_workout_template(
  'cardio-core-finisher', 'Cardio + Core Finisher', 'cardio', 25, 'Cardio intervals followed by a core-focused finisher.',
  $$[
    {"type":"warmup","title":"Warm-up","order":1,"exercises":[
      {"slug":"standing-ankle-inversion-eversion","order":1,"sets":[
        {"set_index":1,"duration_seconds":15,"side":"left"},
        {"set_index":2,"duration_seconds":15,"side":"right"}
      ]},
      {"slug":"bodyweight-walking-lunge","order":2,"sets":[{"set_index":1,"duration_seconds":20}]}
    ]},
    {"type":"circuit","title":"Cardio Blast","order":2,"repeat":4,"exercises":[
      {"slug":"jumping-jacks","order":1,"rest_seconds":15,"sets":[{"set_index":1,"duration_seconds":30}]},
      {"slug":"high-knees","order":2,"rest_seconds":15,"sets":[{"set_index":1,"duration_seconds":30}]},
      {"slug":"mountain-climbers","order":3,"rest_seconds":15,"sets":[{"set_index":1,"duration_seconds":30}]}
    ]},
    {"type":"circuit","title":"Core Finisher","order":3,"repeat":2,"exercises":[
      {"slug":"dead-bug","order":1,"rest_seconds":15,"sets":[{"set_index":1,"reps":12}]},
      {"slug":"side-plank","order":2,"rest_seconds":15,"sets":[
        {"set_index":1,"duration_seconds":20,"side":"left"},
        {"set_index":2,"duration_seconds":20,"side":"right"}
      ]},
      {"slug":"bicycle-crunch","order":3,"rest_seconds":15,"sets":[{"set_index":1,"reps":20}]}
    ]},
    {"type":"stretching","title":"Stretching","order":4,"exercises":[
      {"slug":"standing-hamstring-stretch","order":1,"sets":[{"set_index":1,"duration_seconds":30}]},
      {"slug":"calf-stretch","order":2,"sets":[
        {"set_index":1,"duration_seconds":20,"side":"left"},
        {"set_index":2,"duration_seconds":20,"side":"right"}
      ]}
    ]}
  ]$$::jsonb
);

select seed_workout_template(
  'active-recovery-core', 'Active Recovery + Core', 'mobility', 25, 'A lighter day: an easy walk plus gentle core work.',
  $$[
    {"type":"warmup","title":"Warm-up","order":1,"exercises":[
      {"slug":"spine-rotation-stretch","order":1,"sets":[
        {"set_index":1,"duration_seconds":15,"side":"left"},
        {"set_index":2,"duration_seconds":15,"side":"right"}
      ]},
      {"slug":"bodyweight-standing-hip-rotation","order":2,"sets":[
        {"set_index":1,"duration_seconds":20,"side":"left"},
        {"set_index":2,"duration_seconds":20,"side":"right"}
      ]}
    ]},
    {"type":"cardio","title":"Easy Walk","order":2,"exercises":[
      {"slug":"walk","order":1,"notes":"Keep it light and conversational.","sets":[{"set_index":1,"duration_seconds":600}]}
    ]},
    {"type":"circuit","title":"Gentle Core","order":3,"repeat":2,"exercises":[
      {"slug":"plank","order":1,"rest_seconds":15,"sets":[{"set_index":1,"duration_seconds":30}]},
      {"slug":"dead-bug","order":2,"rest_seconds":15,"sets":[{"set_index":1,"reps":12}]},
      {"slug":"banana-hold","order":3,"rest_seconds":15,"sets":[{"set_index":1,"duration_seconds":30}]}
    ]},
    {"type":"stretching","title":"Stretching","order":4,"exercises":[
      {"slug":"childs-pose","order":1,"sets":[{"set_index":1,"duration_seconds":20}]},
      {"slug":"butterfly-stretch","order":2,"sets":[{"set_index":1,"duration_seconds":20}]},
      {"slug":"cobra-stretch","order":3,"sets":[{"set_index":1,"duration_seconds":20}]}
    ]}
  ]$$::jsonb
);

-- ---------------------------------------------------------------------------
-- Backfill the next 90 days: main-slot weekday schedule (skips any date that
-- already has one) plus the 10 new workouts spread out as Extras, so there's
-- always a fresh one to grab whenever you feel like it.
-- ---------------------------------------------------------------------------
do $$
declare
  v_user_id uuid;
  v_extras text[] := array[
    'fat-burn-hiit-a', 'chest-core-sculpt-a', 'metabolic-full-body-a', 'core-blast-quick-10',
    'upper-body-abs-combo', 'fat-burn-hiit-b', 'chest-core-sculpt-b', 'metabolic-full-body-b',
    'cardio-core-finisher', 'active-recovery-core'
  ];
  v_day date;
  v_dow integer;
  v_slug text;
  i integer;
begin
  select id into v_user_id from auth.users where email = 'roysamrat216@gmail.com';
  if v_user_id is null then
    return;
  end if;

  for i in 0..89 loop
    v_day := current_date + i;
    v_dow := extract(dow from v_day);
    v_slug := case v_dow
      when 1 then 'upper-body-a'
      when 2 then 'lower-body-a'
      when 3 then 'cardio-a'
      when 4 then 'upper-body-b'
      when 5 then 'lower-body-b'
      else null
    end;

    if v_slug is not null and not exists (
      select 1 from scheduled_workouts
      where user_id = v_user_id and slot = 'main' and scheduled_date = v_day
    ) then
      insert into scheduled_workouts (user_id, workout_id, scheduled_date, slot, status)
      select v_user_id, w.id, v_day, 'main', 'scheduled'
      from workouts w where w.slug = v_slug;
    end if;
  end loop;

  for i in 0..9 loop
    v_day := current_date + (i * 9 + 3);
    insert into scheduled_workouts (user_id, workout_id, scheduled_date, slot, status)
    select v_user_id, w.id, v_day, 'extra', 'scheduled'
    from workouts w where w.slug = v_extras[i + 1];
  end loop;
end $$;
