-- Zyra Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =====================
-- USERS (extends auth.users)
-- =====================
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  plan text not null default 'free' check (plan in ('free', 'pro', 'teams')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================
-- HEALTH METRICS
-- =====================
create table public.health_metrics (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  source text not null check (source in ('strava', 'garmin', 'apple_health', 'manual')),
  type text not null check (type in ('steps', 'heart_rate', 'sleep', 'workout', 'calories', 'hrv', 'distance')),
  value numeric not null,
  unit text not null,
  recorded_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index health_metrics_user_id_idx on public.health_metrics(user_id);
create index health_metrics_recorded_at_idx on public.health_metrics(recorded_at desc);
create index health_metrics_type_idx on public.health_metrics(type);

-- =====================
-- WORKOUTS
-- =====================
create table public.workouts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  source text not null check (source in ('strava', 'garmin', 'apple_health', 'manual')),
  type text not null,
  duration integer not null, -- seconds
  distance numeric, -- meters
  calories numeric,
  avg_heart_rate numeric,
  started_at timestamptz not null,
  raw_data jsonb,
  created_at timestamptz not null default now()
);

create index workouts_user_id_idx on public.workouts(user_id);
create index workouts_started_at_idx on public.workouts(started_at desc);

-- =====================
-- AI INSIGHTS
-- =====================
create table public.ai_insights (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  type text not null check (type in ('recommendation', 'warning', 'achievement', 'game_plan', 'summary')),
  title text not null,
  body text not null,
  data jsonb,
  created_at timestamptz not null default now()
);

create index ai_insights_user_id_idx on public.ai_insights(user_id);
create index ai_insights_created_at_idx on public.ai_insights(created_at desc);

-- =====================
-- OAUTH TOKENS (Strava, Garmin, Apple)
-- =====================
create table public.oauth_tokens (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  provider text not null check (provider in ('strava', 'garmin', 'apple_health')),
  access_token text not null,
  refresh_token text,
  expires_at timestamptz,
  scope text,
  provider_user_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, provider)
);

-- =====================
-- TEAMS (Pro tier)
-- =====================
create table public.teams (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  owner_id uuid references public.users(id) on delete cascade not null,
  sport text,
  created_at timestamptz not null default now()
);

-- =====================
-- TEAM MEMBERS
-- =====================
create table public.team_members (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid references public.teams(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  role text not null default 'athlete' check (role in ('owner', 'coach', 'athlete')),
  joined_at timestamptz not null default now(),
  unique(team_id, user_id)
);

-- =====================
-- GAME PLANS (Teams tier)
-- =====================
create table public.game_plans (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid references public.teams(id) on delete cascade not null,
  created_by uuid references public.users(id) not null,
  title text not null,
  opponent_data jsonb,
  video_analysis text,
  fitness_recommendations jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create index game_plans_team_id_idx on public.game_plans(team_id);

-- =====================
-- RLS POLICIES
-- =====================
alter table public.users enable row level security;
alter table public.health_metrics enable row level security;
alter table public.workouts enable row level security;
alter table public.ai_insights enable row level security;
alter table public.oauth_tokens enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.game_plans enable row level security;

-- Users: only read/update own profile
create policy "users_select_own" on public.users for select using (auth.uid() = id);
create policy "users_update_own" on public.users for update using (auth.uid() = id);
create policy "users_insert_own" on public.users for insert with check (auth.uid() = id);

-- Health metrics: only own data
create policy "health_metrics_own" on public.health_metrics for all using (auth.uid() = user_id);

-- Workouts: only own data
create policy "workouts_own" on public.workouts for all using (auth.uid() = user_id);

-- AI insights: only own data
create policy "ai_insights_own" on public.ai_insights for all using (auth.uid() = user_id);

-- OAuth tokens: only own tokens
create policy "oauth_tokens_own" on public.oauth_tokens for all using (auth.uid() = user_id);

-- Teams: owner can do everything, members can read
create policy "teams_owner" on public.teams for all using (auth.uid() = owner_id);
create policy "teams_member_read" on public.teams for select using (
  exists (select 1 from public.team_members where team_id = id and user_id = auth.uid())
);

-- Team members: team owner manages, members can read own team
create policy "team_members_owner" on public.team_members for all using (
  exists (select 1 from public.teams where id = team_id and owner_id = auth.uid())
);
create policy "team_members_self" on public.team_members for select using (auth.uid() = user_id);

-- Game plans: team members can read, coaches/owners can create
create policy "game_plans_read" on public.game_plans for select using (
  exists (select 1 from public.team_members where team_id = game_plans.team_id and user_id = auth.uid())
);
create policy "game_plans_create" on public.game_plans for insert with check (
  exists (select 1 from public.team_members where team_id = game_plans.team_id and user_id = auth.uid() and role in ('owner', 'coach'))
);

-- =====================
-- AUTO-CREATE USER PROFILE ON SIGNUP
-- =====================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
