-- ============================================================================
-- Zyra Demo Seed Script
-- Run this in Supabase SQL Editor AFTER creating demo@zyra.ai in Auth > Users
-- Password: Demo1234!
-- ============================================================================

DO $$
DECLARE
  demo_id UUID;
BEGIN

  -- Get the demo user's UUID from auth
  SELECT id INTO demo_id FROM auth.users WHERE email = 'demo@zyra.ai';

  IF demo_id IS NULL THEN
    RAISE EXCEPTION 'User demo@zyra.ai not found. Go to Supabase → Authentication → Users → Add User, create demo@zyra.ai with password Demo1234!, then re-run this script.';
  END IF;

  -- Clean up any existing seed data for this user
  DELETE FROM public.ai_insights   WHERE user_id = demo_id;
  DELETE FROM public.workouts      WHERE user_id = demo_id;
  DELETE FROM public.health_metrics WHERE user_id = demo_id;
  DELETE FROM public.users          WHERE id = demo_id;

  -- ── User profile ────────────────────────────────────────────────────────────
  INSERT INTO public.users (id, email, name, plan)
  VALUES (demo_id, 'demo@zyra.ai', 'Pranav', 'pro');

  -- ── Health Metrics: 30 days ─────────────────────────────────────────────────

  -- HRV (garmin) — starts ~58ms, trends up to ~68ms with wave variation
  INSERT INTO public.health_metrics (user_id, source, type, value, unit, recorded_at)
  SELECT
    demo_id, 'garmin', 'hrv',
    ROUND((58 + (d * 0.33) + (4 * SIN(d * 1.1)))::numeric, 1),
    'ms',
    (NOW() - INTERVAL '1 day' * (30 - d))::timestamptz
  FROM generate_series(0, 29) d;

  -- Sleep (apple_health) — 6.0–8.5h, realistic variation
  INSERT INTO public.health_metrics (user_id, source, type, value, unit, recorded_at)
  SELECT
    demo_id, 'apple_health', 'sleep',
    ROUND((7.2 + (1.3 * SIN(d * 0.8 + 1.2)) + (0.4 * COS(d * 1.9)))::numeric, 1),
    'hours',
    (NOW() - INTERVAL '1 day' * (30 - d))::timestamptz
  FROM generate_series(0, 29) d;

  -- Resting heart rate (garmin) — 52–64 bpm, slight downward trend (fitness improving)
  INSERT INTO public.health_metrics (user_id, source, type, value, unit, recorded_at)
  SELECT
    demo_id, 'garmin', 'heart_rate',
    ROUND((60 - (d * 0.15) + (3 * SIN(d * 1.4)))::numeric, 0),
    'bpm',
    (NOW() - INTERVAL '1 day' * (30 - d))::timestamptz
  FROM generate_series(0, 29) d;

  -- Steps (apple_health) — 7000–13500/day
  INSERT INTO public.health_metrics (user_id, source, type, value, unit, recorded_at)
  SELECT
    demo_id, 'apple_health', 'steps',
    ROUND((9800 + (2200 * SIN(d * 0.7 + 0.5)) + (800 * COS(d * 1.3)))::numeric, 0),
    'steps',
    (NOW() - INTERVAL '1 day' * (30 - d))::timestamptz
  FROM generate_series(0, 29) d;

  -- Calories (apple_health) — 2100–3200 kcal/day
  INSERT INTO public.health_metrics (user_id, source, type, value, unit, recorded_at)
  SELECT
    demo_id, 'apple_health', 'calories',
    ROUND((2600 + (450 * SIN(d * 0.6 + 0.8)) + (200 * COS(d * 1.7)))::numeric, 0),
    'kcal',
    (NOW() - INTERVAL '1 day' * (30 - d))::timestamptz
  FROM generate_series(0, 29) d;

  -- ── Workouts: 20 sessions ───────────────────────────────────────────────────

  -- Runs
  INSERT INTO public.workouts (user_id, source, type, duration, distance, calories, avg_heart_rate, max_heart_rate, elevation_gain, started_at, ended_at, notes)
  VALUES
    (demo_id, 'strava', 'run', 2580, 8400,  620, 148, 171, 82,  NOW() - INTERVAL '1 day',   NOW() - INTERVAL '1 day'   + INTERVAL '43 min',  'Morning easy run, felt great'),
    (demo_id, 'strava', 'run', 3900, 13200, 890, 155, 178, 140, NOW() - INTERVAL '3 days',  NOW() - INTERVAL '3 days'  + INTERVAL '65 min',  'Long run — new 13k PR'),
    (demo_id, 'strava', 'run', 1800, 5000,  420, 142, 165, 45,  NOW() - INTERVAL '5 days',  NOW() - INTERVAL '5 days'  + INTERVAL '30 min',  'Recovery jog'),
    (demo_id, 'strava', 'run', 3120, 10100, 740, 158, 182, 95,  NOW() - INTERVAL '8 days',  NOW() - INTERVAL '8 days'  + INTERVAL '52 min',  'Tempo run, good effort'),
    (demo_id, 'strava', 'run', 4500, 15200, 1020,162, 188, 205, NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days' + INTERVAL '75 min',  'Weekend long run'),
    (demo_id, 'strava', 'run', 2280, 7200,  580, 146, 168, 60,  NOW() - INTERVAL '13 days', NOW() - INTERVAL '13 days' + INTERVAL '38 min',  NULL),
    (demo_id, 'strava', 'run', 3300, 11000, 810, 154, 176, 110, NOW() - INTERVAL '17 days', NOW() - INTERVAL '17 days' + INTERVAL '55 min',  'Hills workout'),
    (demo_id, 'strava', 'run', 4800, 16100, 1090,160, 185, 220, NOW() - INTERVAL '24 days', NOW() - INTERVAL '24 days' + INTERVAL '80 min',  'Long run — best pace in 3 months');

  -- Rides
  INSERT INTO public.workouts (user_id, source, type, duration, distance, calories, avg_heart_rate, max_heart_rate, elevation_gain, started_at, ended_at, notes)
  VALUES
    (demo_id, 'strava', 'ride', 4320, 28600, 980, 152, 174, 310, NOW() - INTERVAL '2 days',  NOW() - INTERVAL '2 days'  + INTERVAL '72 min',  'Evening ride, headwind on the way back'),
    (demo_id, 'strava', 'ride', 7200, 48000, 1520,158, 181, 520, NOW() - INTERVAL '7 days',  NOW() - INTERVAL '7 days'  + INTERVAL '2 hours', 'Saturday century attempt — cut short'),
    (demo_id, 'strava', 'ride', 2700, 18200, 680, 138, 162, 180, NOW() - INTERVAL '11 days', NOW() - INTERVAL '11 days' + INTERVAL '45 min',  'Recovery spin'),
    (demo_id, 'strava', 'ride', 5400, 36000, 1180,155, 178, 420, NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days' + INTERVAL '90 min',  'Group ride — pushed hard on climbs'),
    (demo_id, 'garmin',  'ride', 3600, 24000, 890, 144, 169, 245, NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days' + INTERVAL '60 min',  NULL);

  -- Strength
  INSERT INTO public.workouts (user_id, source, type, duration, distance, calories, avg_heart_rate, max_heart_rate, elevation_gain, started_at, ended_at, notes)
  VALUES
    (demo_id, 'apple_health', 'strength', 3300, NULL, 480, 132, 158, NULL, NOW() - INTERVAL '4 days',  NOW() - INTERVAL '4 days'  + INTERVAL '55 min',  'Upper body — chest & shoulders'),
    (demo_id, 'apple_health', 'strength', 2700, NULL, 420, 128, 152, NULL, NOW() - INTERVAL '6 days',  NOW() - INTERVAL '6 days'  + INTERVAL '45 min',  'Core & mobility'),
    (demo_id, 'apple_health', 'strength', 3600, NULL, 530, 138, 162, NULL, NOW() - INTERVAL '9 days',  NOW() - INTERVAL '9 days'  + INTERVAL '60 min',  'Legs — squat & deadlift'),
    (demo_id, 'apple_health', 'strength', 3000, NULL, 460, 130, 155, NULL, NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days' + INTERVAL '50 min',  'Full body circuit'),
    (demo_id, 'apple_health', 'strength', 3300, NULL, 490, 134, 160, NULL, NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days' + INTERVAL '55 min',  'Upper body pull'),
    (demo_id, 'apple_health', 'strength', 2700, NULL, 410, 126, 150, NULL, NOW() - INTERVAL '23 days', NOW() - INTERVAL '23 days' + INTERVAL '45 min',  NULL),
    (demo_id, 'apple_health', 'strength', 3600, NULL, 540, 140, 165, NULL, NOW() - INTERVAL '27 days', NOW() - INTERVAL '27 days' + INTERVAL '60 min',  'Heavy leg day');

  -- ── AI Insights ─────────────────────────────────────────────────────────────
  INSERT INTO public.ai_insights (user_id, type, title, body, metric_type, is_read, created_at)
  VALUES
    (demo_id, 'achievement', 'New monthly distance PR 🏆',
     'You ran 53.9km this month — your highest monthly mileage ever. Your average pace also improved by 12 seconds/km compared to last month. Your aerobic base is building strongly.',
     'workout', false, NOW() - INTERVAL '1 day'),

    (demo_id, 'recommendation', 'Add Zone 2 sessions to your plan',
     'Your last 4 weeks show 82% of workouts at high intensity (Zone 4–5). Adding 2 Zone 2 sessions per week — 30–45 min of easy conversational-pace cardio — will improve your aerobic base, speed up recovery, and reduce injury risk.',
     'heart_rate', false, NOW() - INTERVAL '2 days'),

    (demo_id, 'warning', 'Sleep debt accumulating',
     'You have averaged 6.4 hours of sleep over the past 5 nights — 1.1 hours below your 7.5-hour baseline. This is measurably reducing your HRV and recovery capacity. Prioritise sleep tonight: aim for 8+ hours to start repaying the debt.',
     'sleep', false, NOW() - INTERVAL '3 days'),

    (demo_id, 'recommendation', 'HRV trending up — peak window this weekend',
     'Your HRV has been above your 30-day baseline for 4 consecutive days and is trending up. This is your best recovery window of the month. Ideal time to attempt a hard effort or long run PR this weekend.',
     'hrv', true, NOW() - INTERVAL '5 days'),

    (demo_id, 'recommendation', 'Your resting HR dropped 4 bpm this month',
     'Resting heart rate fell from 62 bpm to 58 bpm over 30 days — a strong indicator your cardiovascular fitness is improving. Keep the current training mix: 3 runs, 1–2 rides, 1–2 strength sessions per week.',
     'heart_rate', true, NOW() - INTERVAL '8 days');

  RAISE NOTICE 'Seed complete for user: %', demo_id;

END $$;
