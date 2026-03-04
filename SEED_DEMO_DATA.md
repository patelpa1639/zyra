# Seeding Demo Data for Zyra

## Quick Start

Run this command from the project root to seed realistic demo data:

```bash
cd apps/web
npx ts-node scripts/seed-demo.ts
```

## What Gets Created

The seed script creates:

- **Demo User Account**
  - Email: `demo@zyra.ai`
  - Password: `demo1234`

- **30 Days of Health Metrics**
  - Sleep (trending up: 6 → 8 hours)
  - HRV (trending up: 35 → 65 ms)
  - Resting Heart Rate (trending down: 65 → 55 bpm)
  - Daily Steps (6k-14k variation)
  - Daily Calories (1800-2400 variation)

- **20 Realistic Workouts**
  - Runs, rides, strength sessions, swimming
  - Realistic durations, distances, heart rates
  - Spread across 30 days
  - Multiple sources (Strava, Garmin, manual)

- **5 AI Insights**
  - Recommendations for training
  - Achievements and milestones
  - Health observations
  - Trending improvements

## Prerequisites

1. **Supabase project** set up and running
2. **Environment variables** configured:
   - `apps/api/.env` must contain `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
3. **Database schema** created (run `supabase/schema.sql`)
4. **Node.js** with `ts-node` installed

## Setup Steps

1. **Install dependencies** (if not already done):
   ```bash
   cd apps/web
   npm install
   ```

2. **Ensure your Supabase credentials** are in `apps/api/.env`:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. **Run the seed script**:
   ```bash
   npx ts-node scripts/seed-demo.ts
   ```

4. **Check the output**:
   ```
   ✅ Demo data seed complete!
   
   📧 Login with:
      Email: demo@zyra.ai
      Password: demo1234
   ```

## Testing the Dashboard

1. **Start the frontend**:
   ```bash
   cd apps/web
   npm run dev
   ```

2. **Navigate to login page**:
   ```
   http://localhost:3000/login
   ```

3. **Sign in** with the demo credentials:
   - Email: `demo@zyra.ai`
   - Password: `demo1234`

4. **View the dashboard** with real data:
   - Health metrics cards with trending data
   - Recent workouts with details
   - AI insights based on the data

## What's Next

Once demo data is seeded:

- The dashboard shows real health data instead of mock data
- The workouts page displays 20 workouts to browse and filter
- AI insights section shows personalized recommendations
- All data is accessible via the API endpoints

## Troubleshooting

**"Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"**
- Check that `apps/api/.env` exists and has these variables
- The script reads from the API .env file, not web .env

**"User already exists"**
- The script handles this gracefully and reuses the existing user
- All new data will be inserted for that user

**"Demo user not found after creation"**
- Ensure your Supabase project is running
- Check that the service role key is correct and has admin permissions

**Database errors**
- Ensure `supabase/schema.sql` has been applied to your database
- Verify the Supabase project URL is correct
