-- Two unrelated additions bundled together:
--
-- 1. Shoulder-injury recovery week: replaces the recurring Mon-Fri strength
--    split with a cardio + shoulder-friendly bodyweight circuit for
--    2026-09-21 through 2026-09-27 only (Sun rest). The recurring split
--    already scheduled beyond 09-27 by migration 0008 is untouched, so
--    normal strength training resumes automatically the following week.
--    Any not-yet-completed row in that window is cleared first; completed
--    rows are never touched.
--
-- 2. Adds all workouts to the Builder workout library (as roysamrat216's own
--    composer workouts, so they show up under /builder/workouts and can be
--    edited/reordered there): the 3 new cardio+circuit workouts above, plus
--    an 8-day custom split saved as "Workout 001 - Day 1" .. "Day 8". These
--    are only added to the library - nothing is scheduled from them beyond
--    the recovery week above.

-- ---------------------------------------------------------------------------
-- New exercises
-- ---------------------------------------------------------------------------
insert into exercises (name, slug, category, equipment, primary_muscles, secondary_muscles, instructions, default_unit)
values
  ('Incline Treadmill Walk', 'incline-treadmill-walk', 'cardio', '{treadmill}', '{legs,cardio}', '{glutes}', 'Set the treadmill to an incline (roughly 8-10% grade) and walk at a steady, brisk pace.', 'time'),
  ('Elliptical', 'elliptical', 'cardio', '{elliptical}', '{legs,cardio}', '{}', 'Keep your hands on the static side handles (not the moving arm handles) and maintain a steady pace.', 'time'),
  ('Glute Bridge', 'glute-bridge', 'strength', '{bodyweight}', '{glutes}', '{hamstrings}', 'Lying on your back with knees bent and feet flat, drive your hips up by squeezing your glutes, then lower with control.', 'bodyweight'),
  ('Wall Sit', 'wall-sit', 'strength', '{bodyweight}', '{quads}', '{glutes}', 'Slide your back down a wall until your knees are at roughly 90 degrees and hold the position.', 'time'),
  ('Calf Raise', 'calf-raise', 'strength', '{bodyweight}', '{calves}', '{}', 'Standing tall, rise up onto the balls of your feet, then lower back down with control.', 'bodyweight'),
  ('Posture Assessment (Lordosis)', 'posture-assessment-lordosis', 'mobility', '{bodyweight}', '{lower back,core}', '{}', 'Coach check-in: stand tall against a wall and assess lower-back curve (lordosis) before starting the session.', 'time'),
  ('Dynamic Stretch', 'dynamic-stretch', 'warmup', '{bodyweight}', '{full body}', '{}', 'Move through a light dynamic warm-up flow (leg swings, arm circles, walking lunges) to raise body temperature.', 'time'),
  ('Foam Roll', 'foam-roll', 'mobility', '{foam roller}', '{full body}', '{}', 'Roll slowly over tight areas (quads, glutes, upper back), pausing on tender spots for 20-30 seconds.', 'time'),
  ('Clamshell', 'clamshell', 'strength', '{bodyweight}', '{glutes}', '{hips}', 'Lying on your side with knees bent and stacked, keep feet together and open your top knee like a clamshell.', 'bodyweight'),
  ('Bird Dog', 'bird-dog', 'core', '{bodyweight}', '{core,lower back}', '{glutes}', 'From all fours, extend the opposite arm and leg while keeping your hips and back still, then switch sides.', 'bodyweight'),
  ('Weighted Core Twist', 'weighted-core-twist', 'core', '{dumbbell}', '{obliques,abs}', '{}', 'Seated or standing, rotate a light weight from hip to hip while keeping your core braced.', 'lb'),
  ('Crab Walk', 'crab-walk', 'cardio', '{bodyweight}', '{glutes,core}', '{shoulders}', 'In a reverse tabletop position, walk forward and backward on hands and feet.', 'time'),
  ('Step Back Lunge', 'step-back-lunge', 'strength', '{bodyweight}', '{quads,glutes}', '{}', 'From standing, step one foot back into a lunge, then return to standing and repeat.', 'bodyweight'),
  ('Banded Squat', 'banded-squat', 'strength', '{resistance band,bodyweight}', '{quads,glutes}', '{}', 'With a light band around your thighs or ankles, squat down while pressing your knees out against the band.', 'bodyweight'),
  ('Single Leg Glute Bridge', 'single-leg-glute-bridge', 'strength', '{bodyweight,dumbbell}', '{glutes}', '{hamstrings}', 'Lying on your back with one foot planted, drive your hips up on that single leg, keeping the other leg extended. Add a light dumbbell on the hips for extra load.', 'bodyweight'),
  ('Y-to-T Raise', 'y-to-t-raise', 'strength', '{dumbbell}', '{shoulders,upper back}', '{}', 'Hinged forward with light weights, raise your arms into a Y shape overhead, then out to a T at shoulder height.', 'lb'),
  ('Suitcase Crunch', 'suitcase-crunch', 'core', '{medicine ball}', '{abs}', '{}', 'Lying on your back holding a med ball overhead, crunch up bringing knees and ball together like closing a suitcase.', 'bodyweight'),
  ('Sumo Squat', 'sumo-squat', 'strength', '{medicine ball,dumbbell}', '{quads,glutes}', '{adductors}', 'Feet wide and turned out, hold a weight at your chest and squat down between your knees.', 'lb'),
  ('Step Up With Knee Drive', 'step-up-knee-drive', 'strength', '{box,bodyweight}', '{quads,glutes}', '{}', 'Step up onto a box or bench, driving the trailing knee up toward hip height at the top, then step back down.', 'bodyweight'),
  ('Plank Clamshell', 'plank-clamshell', 'core', '{resistance band,bodyweight}', '{glutes,abs}', '{shoulders}', 'From a forearm plank with a band around your knees, open one knee out to the side and back, keeping hips level.', 'bodyweight'),
  ('Knee Hover', 'knee-hover', 'core', '{bodyweight}', '{abs}', '{}', 'From a tabletop or kneeling position, hover your knees just off the floor and hold, keeping your back flat.', 'time'),
  ('Dumbbell Skull Crusher', 'dumbbell-skull-crusher', 'strength', '{dumbbell,bench}', '{triceps}', '{}', 'Lying on a bench, lower dumbbells toward your forehead by bending only your elbows, then press back up.', 'lb'),
  ('Dumbbell Shoulder Press', 'dumbbell-shoulder-press', 'strength', '{dumbbell}', '{shoulders}', '{triceps}', 'Press dumbbells from shoulder height straight overhead until arms are extended.', 'lb'),
  ('Dumbbell Bicep Curl', 'dumbbell-bicep-curl', 'strength', '{dumbbell}', '{biceps}', '{forearms}', 'Standing tall, curl the dumbbells up toward your shoulders with control, keeping elbows pinned to your sides.', 'lb'),
  ('Glute Rainbow', 'glute-rainbow', 'strength', '{bodyweight}', '{glutes}', '{hips}', 'From all fours, sweep one leg in a slow arc from side to side behind you, like tracing a rainbow.', 'bodyweight'),
  ('Dumbbell Chest Press', 'dumbbell-chest-press', 'strength', '{dumbbell,bench}', '{chest}', '{triceps,shoulders}', 'Lying on a bench or floor, press dumbbells up from chest level until arms are extended.', 'lb'),
  ('Dumbbell Chest Fly', 'dumbbell-chest-fly', 'strength', '{dumbbell,bench}', '{chest}', '{shoulders}', 'Lying on a bench with a slight elbow bend, lower the dumbbells out to the sides, then bring them back over your chest.', 'lb'),
  ('Tricep Dip', 'tricep-dip', 'strength', '{bench,bodyweight}', '{triceps}', '{shoulders}', 'Hands on a bench behind you, lower your hips toward the floor by bending your elbows, then press back up.', 'time'),
  ('Scissor Kick', 'scissor-kick', 'core', '{bodyweight}', '{abs}', '{}', 'Lying on your back with legs extended a few inches off the floor, alternate crossing them up and down.', 'time'),
  ('Dumbbell Squat', 'dumbbell-squat', 'strength', '{dumbbell}', '{quads,glutes}', '{}', 'Holding dumbbells at your sides, squat down keeping your chest tall, then drive back up to standing.', 'lb'),
  ('Farmer''s Carry', 'farmers-carry', 'cardio', '{dumbbell,kettlebell}', '{full body,grip}', '{}', 'Holding a heavy weight in each hand, walk with tall posture and a braced core for the given distance or time.', 'time'),
  ('Dumbbell Side Bend', 'dumbbell-side-bend', 'core', '{dumbbell}', '{obliques}', '{}', 'Standing with a dumbbell in one hand, bend sideways toward that hand, then squeeze your obliques to return upright.', 'lb'),
  ('Jumping Lunge', 'jumping-lunge', 'cardio', '{bodyweight}', '{quads,glutes}', '{}', 'From a lunge position, jump and switch legs in the air, landing softly back into a lunge.', 'bodyweight'),
  ('Broad Jump', 'broad-jump', 'cardio', '{bodyweight}', '{quads,glutes}', '{}', 'From standing, swing your arms and jump forward as far as possible, landing softly with bent knees.', 'bodyweight'),
  ('Kettlebell Gorilla Row', 'kettlebell-gorilla-row', 'strength', '{kettlebell}', '{back}', '{biceps}', 'Hinged over with two kettlebells on the floor, row one at a time while the other hand braces on its handle.', 'lb'),
  ('Y-Balance Reach', 'y-balance', 'mobility', '{bodyweight}', '{hips,ankles}', '{}', 'Balancing on one leg, reach the other leg forward, then to the side, then behind you in a Y pattern.', 'time')
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Recovery-week workouts (cardio + shoulder-friendly circuit)
-- ---------------------------------------------------------------------------
select seed_workout_template(
  'incline-treadmill-steady-circuit', 'Incline Treadmill + Circuit', 'cardio', 55, 'Steady incline treadmill cardio followed by a shoulder-friendly bodyweight circuit. Temporary substitute for strength training during recovery week.',
  $$[{"type":"cardio","title":"Incline Treadmill","order":1,"exercises":[{"slug":"incline-treadmill-walk","order":1,"sets":[{"set_index":1,"duration_seconds":2400}],"notes":"Steady pace, 8-10% grade incline."}]},{"type":"circuit","title":"Circuit","order":2,"exercises":[{"slug":"bodyweight-squat","order":1,"sets":[{"set_index":1,"reps":15}]},{"slug":"bodyweight-reverse-lunge","order":2,"sets":[{"set_index":1,"reps":10,"side":"left"},{"set_index":2,"reps":10,"side":"right"}],"side":"alternating"},{"slug":"glute-bridge","order":3,"sets":[{"set_index":1,"reps":15}]},{"slug":"wall-sit","order":4,"sets":[{"set_index":1,"duration_seconds":30}]},{"slug":"calf-raise","order":5,"sets":[{"set_index":1,"reps":15}],"rest_seconds":60}],"repeat":3,"notes":"3 rounds; rest 1 minute between rounds. Shoulder-friendly - no overhead or pressing movements."}]$$::jsonb
);

select seed_workout_template(
  'elliptical-circuit', 'Elliptical + Circuit', 'cardio', 55, 'Steady elliptical cardio followed by a shoulder-friendly bodyweight circuit. Temporary substitute for strength training during recovery week.',
  $$[{"type":"cardio","title":"Elliptical","order":1,"exercises":[{"slug":"elliptical","order":1,"sets":[{"set_index":1,"duration_seconds":2400}],"notes":"Hands on the static handles, steady pace."}]},{"type":"circuit","title":"Circuit","order":2,"exercises":[{"slug":"bodyweight-squat","order":1,"sets":[{"set_index":1,"reps":15}]},{"slug":"bodyweight-reverse-lunge","order":2,"sets":[{"set_index":1,"reps":10,"side":"left"},{"set_index":2,"reps":10,"side":"right"}],"side":"alternating"},{"slug":"glute-bridge","order":3,"sets":[{"set_index":1,"reps":15}]},{"slug":"wall-sit","order":4,"sets":[{"set_index":1,"duration_seconds":30}]},{"slug":"calf-raise","order":5,"sets":[{"set_index":1,"reps":15}],"rest_seconds":60}],"repeat":3,"notes":"3 rounds; rest 1 minute between rounds. Shoulder-friendly - no overhead or pressing movements."}]$$::jsonb
);

select seed_workout_template(
  'incline-treadmill-intervals-circuit', 'Incline Treadmill Intervals + Circuit', 'cardio', 55, 'Incline treadmill intervals (2 min steep / 2 min flat) followed by the shoulder-friendly bodyweight circuit. Temporary substitute for strength training during recovery week.',
  $$[{"type":"circuit","title":"Incline Intervals","order":1,"exercises":[{"slug":"incline-treadmill-walk","order":1,"sets":[{"set_index":1,"duration_seconds":120,"notes":"Steep incline (8-10% grade)"},{"set_index":2,"duration_seconds":120,"notes":"Flat / recovery pace"}]}],"repeat":10,"notes":"10 rounds of 2 min steep / 2 min flat = 40 min total."},{"type":"circuit","title":"Circuit","order":2,"exercises":[{"slug":"bodyweight-squat","order":1,"sets":[{"set_index":1,"reps":15}]},{"slug":"bodyweight-reverse-lunge","order":2,"sets":[{"set_index":1,"reps":10,"side":"left"},{"set_index":2,"reps":10,"side":"right"}],"side":"alternating"},{"slug":"glute-bridge","order":3,"sets":[{"set_index":1,"reps":15}]},{"slug":"wall-sit","order":4,"sets":[{"set_index":1,"duration_seconds":30}]},{"slug":"calf-raise","order":5,"sets":[{"set_index":1,"reps":15}],"rest_seconds":60}],"repeat":3,"notes":"3 rounds; rest 1 minute between rounds. Shoulder-friendly - no overhead or pressing movements."}]$$::jsonb
);

-- ---------------------------------------------------------------------------
-- "Workout 001" - Day 1 through Day 8
-- ---------------------------------------------------------------------------
select seed_workout_template(
  'workout-001-day-1', 'Workout 001 - Day 1', 'core', 40, 'Posture check-in, glute activation, and a core finisher.',
  $$[{"type":"warmup","title":"Assessment & Warm-up","order":1,"exercises":[{"slug":"posture-assessment-lordosis","order":1,"sets":[{"set_index":1,"duration_seconds":60}]},{"slug":"dynamic-stretch","order":2,"sets":[{"set_index":1,"duration_seconds":180}]},{"slug":"foam-roll","order":3,"sets":[{"set_index":1,"duration_seconds":180}]}]},{"type":"circuit","title":"Glute Activation","order":2,"exercises":[{"slug":"clamshell","order":1,"sets":[{"set_index":1,"reps":15,"side":"left"},{"set_index":2,"reps":15,"side":"right"}]},{"slug":"glute-bridge","order":2,"sets":[{"set_index":1,"reps":10,"notes":"full rep"},{"set_index":2,"reps":10,"notes":"pulses"},{"set_index":3,"duration_seconds":10,"notes":"hold"}]}],"repeat":3},{"type":"circuit","title":"Core","order":3,"exercises":[{"slug":"bird-dog","order":1,"sets":[{"set_index":1,"reps":10,"side":"left"},{"set_index":2,"reps":10,"side":"right"}]},{"slug":"weighted-core-twist","order":2,"sets":[{"set_index":1,"reps":15,"weight":7.5}]},{"slug":"dead-bug","order":3,"sets":[{"set_index":1,"reps":12}],"notes":"Ball dead bugs - squeeze a ball between hands and knees."}],"repeat":3},{"type":"cooldown","title":"Finisher","order":4,"exercises":[{"slug":"plank","order":1,"sets":[{"set_index":1,"duration_seconds":30}]}]}]$$::jsonb
);

select seed_workout_template(
  'workout-001-day-2', 'Workout 001 - Day 2', 'lower_body', 40, 'Core circuit paired with a lower-body strength circuit.',
  $$[{"type":"circuit","title":"Core","order":1,"exercises":[{"slug":"plank","order":1,"sets":[{"set_index":1,"duration_seconds":30}]},{"slug":"side-plank","order":2,"sets":[{"set_index":1,"duration_seconds":20,"side":"left"},{"set_index":2,"duration_seconds":20,"side":"right"}],"notes":"x2 per side"},{"slug":"mountain-climbers","order":3,"sets":[{"set_index":1,"duration_seconds":30}]}],"repeat":3},{"type":"circuit","title":"Lower Body","order":2,"exercises":[{"slug":"crab-walk","order":1,"sets":[{"set_index":1,"duration_seconds":30}]},{"slug":"step-back-lunge","order":2,"sets":[{"set_index":1,"reps":10,"side":"left"},{"set_index":2,"reps":10,"side":"right"}]},{"slug":"banded-squat","order":3,"sets":[{"set_index":1,"reps":15}]},{"slug":"single-leg-glute-bridge","order":4,"sets":[{"set_index":1,"reps":10,"weight":10,"side":"left"},{"set_index":2,"reps":10,"weight":10,"side":"right"}]}],"repeat":3}]$$::jsonb
);

select seed_workout_template(
  'workout-001-day-3', 'Workout 001 - Day 3', 'full_body', 40, 'Shoulder and core work paired with a lower-body circuit, plus a finisher.',
  $$[{"type":"circuit","title":"Upper & Core","order":1,"exercises":[{"slug":"y-to-t-raise","order":1,"sets":[{"set_index":1,"reps":12}]},{"slug":"suitcase-crunch","order":2,"sets":[{"set_index":1,"reps":12}],"notes":"Use a medicine ball."},{"slug":"plank","order":3,"sets":[{"set_index":1,"duration_seconds":30}]}],"repeat":3},{"type":"circuit","title":"Lower Body","order":2,"exercises":[{"slug":"sumo-squat","order":1,"sets":[{"set_index":1,"reps":12}],"notes":"Hold a medicine ball."},{"slug":"single-leg-glute-bridge","order":2,"sets":[{"set_index":1,"reps":10,"weight":10,"side":"left"},{"set_index":2,"reps":10,"weight":10,"side":"right"}]},{"slug":"step-up-knee-drive","order":3,"sets":[{"set_index":1,"reps":10,"side":"left"},{"set_index":2,"reps":10,"side":"right"}]}],"repeat":3},{"type":"cooldown","title":"Finisher","order":3,"exercises":[{"slug":"y-to-t-raise","order":1,"sets":[{"set_index":1,"reps":15}],"notes":"Y exercise - light reps to fatigue."}]}]$$::jsonb
);

select seed_workout_template(
  'workout-001-day-4', 'Workout 001 - Day 4', 'upper_body', 40, 'Core circuit paired with an upper-body dumbbell circuit.',
  $$[{"type":"circuit","title":"Core","order":1,"exercises":[{"slug":"dead-bug","order":1,"sets":[{"set_index":1,"reps":12}],"notes":"Ball dead-bugs."},{"slug":"plank-clamshell","order":2,"sets":[{"set_index":1,"reps":12,"side":"left"},{"set_index":2,"reps":12,"side":"right"}],"notes":"Band plank clamshells."},{"slug":"knee-hover","order":3,"sets":[{"set_index":1,"duration_seconds":20}]}],"repeat":3},{"type":"circuit","title":"Upper Body","order":2,"exercises":[{"slug":"dumbbell-skull-crusher","order":1,"sets":[{"set_index":1,"reps":12,"weight":5}]},{"slug":"dumbbell-shoulder-press","order":2,"sets":[{"set_index":1,"reps":12,"weight":6.25}],"notes":"5-7.5 lbs"},{"slug":"dumbbell-bicep-curl","order":3,"sets":[{"set_index":1,"reps":12,"weight":7.5}]}],"repeat":3}]$$::jsonb
);

select seed_workout_template(
  'workout-001-day-5', 'Workout 001 - Day 5', 'lower_body', 40, 'Core circuit paired with a lower-body strength circuit.',
  $$[{"type":"circuit","title":"Core","order":1,"exercises":[{"slug":"bird-dog","order":1,"sets":[{"set_index":1,"reps":10,"side":"left"},{"set_index":2,"reps":10,"side":"right"}]},{"slug":"plank-shoulder-tap","order":2,"sets":[{"set_index":1,"reps":16}]},{"slug":"side-plank","order":3,"sets":[{"set_index":1,"duration_seconds":20,"side":"left"},{"set_index":2,"duration_seconds":20,"side":"right"}]}],"repeat":3},{"type":"circuit","title":"Lower Body","order":2,"exercises":[{"slug":"bodyweight-squat","order":1,"sets":[{"set_index":1,"reps":15}]},{"slug":"wall-sit","order":2,"sets":[{"set_index":1,"duration_seconds":30}]},{"slug":"machine-leg-press","order":3,"sets":[{"set_index":1,"reps":12,"weight":90}]}],"repeat":3}]$$::jsonb
);

select seed_workout_template(
  'workout-001-day-6', 'Workout 001 - Day 6', 'full_body', 45, 'Lower-body strength, a glute finisher, and an upper-body dumbbell circuit.',
  $$[{"type":"circuit","title":"Lower Body","order":1,"exercises":[{"slug":"dumbbell-romanian-deadlift","order":1,"sets":[{"set_index":1,"reps":11,"weight":10}],"notes":"10-12 reps, 10 lbs x2. Rest 1 min after."},{"slug":"dumbbell-squat","order":2,"sets":[{"set_index":1,"reps":12,"weight":10}],"rest_seconds":60,"notes":"10-15 reps, 10 lbs x2."}],"repeat":3},{"type":"circuit","title":"Glute Finisher","order":2,"exercises":[{"slug":"glute-rainbow","order":1,"sets":[{"set_index":1,"reps":10,"side":"left"},{"set_index":2,"reps":10,"side":"right"}],"notes":"15-20 total reps, slow control."}],"repeat":2},{"type":"circuit","title":"Upper Body","order":3,"exercises":[{"slug":"dumbbell-chest-press","order":1,"sets":[{"set_index":1,"reps":11,"weight":10}],"notes":"10-12 reps, 10 lbs."},{"slug":"dumbbell-chest-fly","order":2,"sets":[{"set_index":1,"reps":11,"weight":8.75}],"notes":"10-12 reps, 7.5-10 lbs."},{"slug":"tricep-dip","order":3,"sets":[{"set_index":1,"duration_seconds":30}]},{"slug":"scissor-kick","order":4,"sets":[{"set_index":1,"duration_seconds":30}]}],"repeat":3},{"type":"cooldown","title":"Finisher","order":4,"exercises":[{"slug":"plank","order":1,"sets":[{"set_index":1,"duration_seconds":30},{"set_index":2,"duration_seconds":60}]}]}]$$::jsonb
);

select seed_workout_template(
  'workout-001-day-7', 'Workout 001 - Day 7', 'full_body', 45, 'Full-body strength supersets finishing with a jump/burpee EMOM.',
  $$[{"type":"warmup","title":"Warm-up","order":1,"exercises":[{"slug":"dynamic-stretch","order":1,"sets":[{"set_index":1,"duration_seconds":120}]},{"slug":"calf-raise","order":2,"sets":[{"set_index":1,"reps":15}]}]},{"type":"superset","title":"Squats","order":2,"exercises":[{"slug":"dumbbell-squat","order":1,"sets":[{"set_index":1,"reps":10,"weight":10}]},{"slug":"jump-squat","order":2,"sets":[{"set_index":1,"reps":5}]}],"repeat":4},{"type":"superset","title":"Posterior Chain","order":3,"exercises":[{"slug":"dumbbell-romanian-deadlift","order":1,"sets":[{"set_index":1,"reps":8,"weight":10}]},{"slug":"dumbbell-reverse-lunge","order":2,"sets":[{"set_index":1,"reps":6,"weight":10,"side":"left"},{"set_index":2,"reps":6,"weight":10,"side":"right"}]}],"repeat":3},{"type":"circuit","title":"Carry & Core","order":4,"exercises":[{"slug":"farmers-carry","order":1,"sets":[{"set_index":1,"duration_seconds":60}],"notes":"Heavy-ish kettlebells, around the gym."},{"slug":"dumbbell-side-bend","order":2,"sets":[{"set_index":1,"reps":12,"side":"left"},{"set_index":2,"reps":12,"side":"right"}]}]},{"type":"circuit","title":"EMOM Finisher","order":5,"exercises":[{"slug":"jumping-lunge","order":1,"sets":[{"set_index":1,"duration_seconds":40}],"rest_seconds":20},{"slug":"broad-jump","order":2,"sets":[{"set_index":1,"duration_seconds":40}],"rest_seconds":20},{"slug":"burpee","order":3,"sets":[{"set_index":1,"reps":11,"notes":"round 1"},{"set_index":2,"reps":8,"notes":"round 2"},{"set_index":3,"reps":8,"notes":"round 3"}],"rest_seconds":20,"notes":"11, 8, 8 reps across rounds (27 total)."}],"repeat":3,"notes":"3 rounds EMOM-style: 40 sec on / 20 sec off per movement."}]$$::jsonb
);

select seed_workout_template(
  'workout-001-day-8', 'Workout 001 - Day 8', 'mobility', 20, 'Light accessory day: rows, calves, and balance work.',
  $$[{"type":"set","title":"Other","order":1,"exercises":[{"slug":"kettlebell-gorilla-row","order":1,"sets":[{"set_index":1,"reps":10,"weight":25,"side":"left"},{"set_index":2,"reps":10,"weight":25,"side":"right"}]},{"slug":"calf-raise","order":2,"sets":[{"set_index":1,"reps":15}],"notes":"On a raised plate for extra range of motion."},{"slug":"y-balance","order":3,"sets":[{"set_index":1,"duration_seconds":30,"side":"left"},{"set_index":2,"duration_seconds":30,"side":"right"}]}]}]$$::jsonb
);

-- ---------------------------------------------------------------------------
-- Attach all 11 new workouts to your coach account so they appear under
-- /builder/workouts and can be edited/reordered in the composer.
-- ---------------------------------------------------------------------------
update workouts
set created_by = (select id from auth.users where email = 'roysamrat216@gmail.com')
where slug in (
  'incline-treadmill-steady-circuit', 'elliptical-circuit', 'incline-treadmill-intervals-circuit',
  'workout-001-day-1', 'workout-001-day-2', 'workout-001-day-3', 'workout-001-day-4',
  'workout-001-day-5', 'workout-001-day-6', 'workout-001-day-7', 'workout-001-day-8'
);

-- ---------------------------------------------------------------------------
-- Recovery week schedule: clears next week (2026-09-21 - 2026-09-27) and
-- replaces Mon-Sat with the cardio+circuit workouts above. Sunday is left
-- with no main-slot row (rest day). Never touches an already-completed row.
-- ---------------------------------------------------------------------------
do $$
declare
  v_user_id uuid;
begin
  select id into v_user_id from auth.users where email = 'roysamrat216@gmail.com';
  if v_user_id is null then
    return;
  end if;

  delete from scheduled_workouts
  where user_id = v_user_id
    and scheduled_date between '2026-09-21' and '2026-09-27'
    and status <> 'completed';

  insert into scheduled_workouts (user_id, workout_id, scheduled_date, slot, status)
  select v_user_id, w.id, x.d, 'main', 'scheduled'
  from (values
    ('2026-09-21'::date, 'incline-treadmill-steady-circuit'),
    ('2026-09-22'::date, 'elliptical-circuit'),
    ('2026-09-23'::date, 'incline-treadmill-intervals-circuit'),
    ('2026-09-24'::date, 'elliptical-circuit'),
    ('2026-09-25'::date, 'incline-treadmill-steady-circuit'),
    ('2026-09-26'::date, 'elliptical-circuit')
  ) as x(d, slug)
  join workouts w on w.slug = x.slug;
end $$;
