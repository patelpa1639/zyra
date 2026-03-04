import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
const envPath = path.join(__dirname, '../../api/.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars: Record<string, string> = {};
envContent.split('\n').forEach((line) => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const SUPABASE_URL = envVars.SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const DEMO_EMAIL = 'demo@zyra.ai';
const DEMO_PASSWORD = 'demo1234';

async function seed() {
  console.log('🌱 Starting Zyra demo data seed...\n');

  try {
    // 1. Create or get demo user in auth
    console.log('1️⃣  Creating demo user in Supabase auth...');
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
    });

    let userId = authUser?.user?.id;

    if (authError) {
      if (authError.message.includes('already exists')) {
        console.log('   ℹ️  Demo user already exists, fetching...');
        // Get existing user
        const { data: users, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) throw listError;
        const existingUser =
          users?.users?.find(
            (u: { email?: string | null; id: string }) => u.email === DEMO_EMAIL,
          );
        userId = existingUser?.id;
        if (!userId) throw new Error('Could not find or create demo user');
      } else {
        throw authError;
      }
    }

    console.log(`   ✓ User ID: ${userId}\n`);

    // 2. Create user profile
    console.log('2️⃣  Creating user profile...');
    const { error: profileError } = await supabase.from('users').upsert(
      [
        {
          id: userId,
          email: DEMO_EMAIL,
          name: 'Demo User',
          plan: 'pro',
          created_at: new Date().toISOString(),
        },
      ],
      { onConflict: 'id' }
    );

    if (profileError) throw profileError;
    console.log('   ✓ User profile created\n');

    // 3. Seed health metrics (30 days of data with trending improvement)
    console.log('3️⃣  Seeding 30 days of health metrics...');

    const healthMetrics: any[] = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString();

      // Trend: improving over time
      const dayProgress = (30 - i) / 30; // 0 to 1

      // Sleep (trending up: 6 to 8 hours)
      healthMetrics.push({
        user_id: userId,
        type: 'sleep',
        source: 'apple_health',
        value: 6 + 2 * dayProgress + (Math.random() - 0.5) * 0.5,
        unit: 'hours',
        recorded_at: dateStr,
      });

      // HRV (trending up: 35 to 65 ms)
      healthMetrics.push({
        user_id: userId,
        type: 'hrv',
        source: 'garmin',
        value: 35 + 30 * dayProgress + (Math.random() - 0.5) * 8,
        unit: 'ms',
        recorded_at: dateStr,
      });

      // Resting heart rate (trending down: 65 to 55 bpm)
      healthMetrics.push({
        user_id: userId,
        type: 'heart_rate',
        source: 'apple_health',
        value: 65 - 10 * dayProgress + (Math.random() - 0.5) * 4,
        unit: 'bpm',
        recorded_at: dateStr,
      });

      // Steps (varying: 6k to 14k)
      healthMetrics.push({
        user_id: userId,
        type: 'steps',
        source: 'strava',
        value: 8000 + Math.sin(i / 7) * 3000 + Math.random() * 2000,
        unit: 'steps',
        recorded_at: dateStr,
      });

      // Calories (varying: 1800 to 2400)
      healthMetrics.push({
        user_id: userId,
        type: 'calories',
        source: 'apple_health',
        value: 2000 + Math.sin(i / 5) * 300 + Math.random() * 200,
        unit: 'kcal',
        recorded_at: dateStr,
      });
    }

    const { error: metricsError } = await supabase.from('health_metrics').insert(healthMetrics);
    if (metricsError) throw metricsError;
    console.log(`   ✓ Inserted ${healthMetrics.length} health metrics\n`);

    // 4. Seed workouts (20 realistic workouts over 30 days)
    console.log('4️⃣  Seeding 20 workouts...');

    const workouts = [
      // Week 1
      {
        type: 'run',
        duration: 2700,
        distance: 6.5,
        calories: 620,
        avgHeartRate: 165,
        maxHeartRate: 180,
        elevation: 120,
        daysAgo: 28,
      },
      {
        type: 'strength',
        duration: 3300,
        distance: 0,
        calories: 380,
        avgHeartRate: 115,
        maxHeartRate: 140,
        elevation: 0,
        daysAgo: 26,
      },
      {
        type: 'ride',
        duration: 4500,
        distance: 32.5,
        calories: 920,
        avgHeartRate: 152,
        maxHeartRate: 185,
        elevation: 580,
        daysAgo: 24,
      },
      // Week 2
      {
        type: 'run',
        duration: 3000,
        distance: 7.2,
        calories: 680,
        avgHeartRate: 162,
        maxHeartRate: 178,
        elevation: 145,
        daysAgo: 21,
      },
      {
        type: 'swim',
        duration: 2400,
        distance: 3.2,
        calories: 350,
        avgHeartRate: 144,
        maxHeartRate: 165,
        elevation: 0,
        daysAgo: 19,
      },
      {
        type: 'strength',
        duration: 3600,
        distance: 0,
        calories: 420,
        avgHeartRate: 120,
        maxHeartRate: 150,
        elevation: 0,
        daysAgo: 17,
      },
      {
        type: 'ride',
        duration: 5400,
        distance: 38.2,
        calories: 1050,
        avgHeartRate: 155,
        maxHeartRate: 188,
        elevation: 720,
        daysAgo: 14,
      },
      // Week 3
      {
        type: 'run',
        duration: 3300,
        distance: 8.1,
        calories: 750,
        avgHeartRate: 160,
        maxHeartRate: 176,
        elevation: 180,
        daysAgo: 12,
      },
      {
        type: 'strength',
        duration: 3480,
        distance: 0,
        calories: 450,
        avgHeartRate: 122,
        maxHeartRate: 155,
        elevation: 0,
        daysAgo: 10,
      },
      {
        type: 'run',
        duration: 1800,
        distance: 4.2,
        calories: 380,
        avgHeartRate: 138,
        maxHeartRate: 158,
        elevation: 65,
        daysAgo: 8,
      },
      {
        type: 'ride',
        duration: 3600,
        distance: 28.5,
        calories: 780,
        avgHeartRate: 150,
        maxHeartRate: 180,
        elevation: 420,
        daysAgo: 6,
      },
      // Week 4
      {
        type: 'run',
        duration: 3600,
        distance: 9.2,
        calories: 850,
        avgHeartRate: 158,
        maxHeartRate: 174,
        elevation: 210,
        daysAgo: 5,
      },
      {
        type: 'swim',
        duration: 2700,
        distance: 3.6,
        calories: 400,
        avgHeartRate: 142,
        maxHeartRate: 162,
        elevation: 0,
        daysAgo: 4,
      },
      {
        type: 'strength',
        duration: 3600,
        distance: 0,
        calories: 480,
        avgHeartRate: 125,
        maxHeartRate: 160,
        elevation: 0,
        daysAgo: 3,
      },
      {
        type: 'run',
        duration: 2400,
        distance: 5.8,
        calories: 540,
        avgHeartRate: 155,
        maxHeartRate: 172,
        elevation: 95,
        daysAgo: 2,
      },
      {
        type: 'ride',
        duration: 4800,
        distance: 35.2,
        calories: 950,
        avgHeartRate: 153,
        maxHeartRate: 186,
        elevation: 650,
        daysAgo: 1,
      },
      {
        type: 'run',
        duration: 2700,
        distance: 6.8,
        calories: 620,
        avgHeartRate: 164,
        maxHeartRate: 179,
        elevation: 130,
        daysAgo: 0,
      },
      {
        type: 'strength',
        duration: 3300,
        distance: 0,
        calories: 400,
        avgHeartRate: 118,
        maxHeartRate: 145,
        elevation: 0,
        daysAgo: 0,
      },
    ];

    const workoutRows = workouts.map((w, idx) => {
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - w.daysAgo);
      startDate.setHours(Math.floor(Math.random() * 8) + 6); // 6am-2pm
      const endDate = new Date(startDate);
      endDate.setSeconds(endDate.getSeconds() + w.duration);

      const possibleSources =
        w.type === 'run' || w.type === 'ride'
          ? ['strava', 'garmin', 'apple_health']
          : ['apple_health', 'garmin', 'strava']

      const source =
        possibleSources[Math.floor(Math.random() * possibleSources.length)]

      return {
        user_id: userId,
        source,
        type: w.type,
        duration: w.duration,
        distance: w.distance || null,
        calories: w.calories,
        avg_heart_rate: w.avgHeartRate,
        max_heart_rate: w.maxHeartRate,
        elevation_gain: w.elevation || null,
        started_at: startDate.toISOString(),
        ended_at: endDate.toISOString(),
        notes:
          w.type === 'run'
            ? 'Good effort, felt strong'
            : w.type === 'ride'
            ? 'Hilly route, challenging'
            : 'Upper body focus',
        metadata: {},
      };
    });

    const { error: workoutsError } = await supabase.from('workouts').insert(workoutRows);
    if (workoutsError) throw workoutsError;
    console.log(`   ✓ Inserted ${workoutRows.length} workouts\n`);

    // 5. Seed AI insights
    console.log('5️⃣  Seeding 5 AI insights...');

    const insights = [
      {
        user_id: userId,
        type: 'recommendation',
        title: 'HRV Improvement Detected',
        body: 'Your HRV has been trending up over the past week, indicating better recovery. Keep maintaining your current training and sleep routine.',
        metric_type: 'hrv',
        data: { urgency: 'low' },
      },
      {
        user_id: userId,
        type: 'warning',
        title: 'Increase Training Load Gradually',
        body: 'You\'ve been ramping up intensity quickly. Consider adding a recovery day this week to prevent overtraining.',
        metric_type: 'heart_rate',
        data: { urgency: 'medium' },
      },
      {
        user_id: userId,
        type: 'achievement',
        title: '🎉 Fitness Milestone',
        body: 'You\'ve completed 20 workouts this month! Your consistency is paying off with improved metrics across the board.',
        metric_type: null,
        data: { urgency: 'low' },
      },
      {
        user_id: userId,
        type: 'recommendation',
        title: 'Sleep Optimization',
        body: 'Your sleep duration has improved to 7.5+ hours. This is contributing to better recovery and HRV gains.',
        metric_type: 'sleep',
        data: { urgency: 'low' },
      },
      {
        user_id: userId,
        type: 'achievement',
        title: 'Resting Heart Rate Down',
        body: 'Your resting heart rate has dropped 8 bpm this month. Excellent cardiovascular adaptation from your training!',
        metric_type: 'heart_rate',
        data: { urgency: 'low' },
      },
    ];

    const { error: insightsError } = await supabase.from('ai_insights').insert(insights);
    if (insightsError) throw insightsError;
    console.log(`   ✓ Inserted ${insights.length} AI insights\n`);

    // 6. Seed fake OAuth connections for each provider
    console.log('6️⃣  Seeding OAuth connections (simulated integrations)...');
    const { error: oauthError } = await supabase
      .from('oauth_tokens')
      .upsert(
        [
          {
            user_id: userId,
            provider: 'strava',
            access_token: 'demo-strava-token',
            token_type: 'bearer',
            created_at: new Date().toISOString(),
          },
          {
            user_id: userId,
            provider: 'garmin',
            access_token: 'demo-garmin-token',
            token_type: 'bearer',
            created_at: new Date().toISOString(),
          },
          {
            user_id: userId,
            provider: 'apple_health',
            access_token: 'demo-apple-health-token',
            token_type: 'bearer',
            created_at: new Date().toISOString(),
          },
        ],
        { onConflict: 'user_id,provider' }
      );
    if (oauthError) throw oauthError;
    console.log('   ✓ OAuth providers connected (Strava, Garmin, Apple Health)\n');

    console.log('✅ Demo data seed complete!\n');
    console.log('📧 Login with:');
    console.log(`   Email: ${DEMO_EMAIL}`);
    console.log(`   Password: ${DEMO_PASSWORD}\n`);
    console.log('The dashboard should now display real data for this user.\n');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

// Run the seed
seed().then(() => {
  console.log('Done!');
  process.exit(0);
});
