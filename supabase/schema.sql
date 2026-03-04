-- Zyra Database Schema
-- PostgreSQL schema for Supabase with RLS policies

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- Users Table (extends auth.users)
-- ============================================================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'teams')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON public.users(email);

-- ============================================================================
-- Health Metrics Table
-- ============================================================================
CREATE TABLE public.health_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('strava', 'garmin', 'apple_health', 'manual')),
  type TEXT NOT NULL CHECK (type IN ('steps', 'heart_rate', 'sleep', 'workout', 'calories', 'hrv')),
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_health_metrics_user_id ON public.health_metrics(user_id);
CREATE INDEX idx_health_metrics_recorded_at ON public.health_metrics(recorded_at DESC);
CREATE INDEX idx_health_metrics_type ON public.health_metrics(type);
CREATE INDEX idx_health_metrics_user_recorded ON public.health_metrics(user_id, recorded_at DESC);

-- ============================================================================
-- Workouts Table
-- ============================================================================
CREATE TABLE public.workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('strava', 'garmin', 'apple_health', 'manual')),
  type TEXT NOT NULL,
  duration INTEGER NOT NULL, -- seconds
  distance NUMERIC, -- meters
  calories NUMERIC,
  avg_heart_rate NUMERIC,
  max_heart_rate NUMERIC,
  elevation_gain NUMERIC,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workouts_user_id ON public.workouts(user_id);
CREATE INDEX idx_workouts_started_at ON public.workouts(started_at DESC);
CREATE INDEX idx_workouts_user_started ON public.workouts(user_id, started_at DESC);
CREATE INDEX idx_workouts_type ON public.workouts(type);

-- ============================================================================
-- AI Insights Table
-- ============================================================================
CREATE TABLE public.ai_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('recommendation', 'warning', 'achievement', 'game_plan')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  metric_type TEXT, -- optional: link to specific metric type
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_insights_user_id ON public.ai_insights(user_id);
CREATE INDEX idx_ai_insights_created_at ON public.ai_insights(created_at DESC);
CREATE INDEX idx_ai_insights_type ON public.ai_insights(type);
CREATE INDEX idx_ai_insights_user_created ON public.ai_insights(user_id, created_at DESC);

-- ============================================================================
-- OAuth Tokens Table (encrypted)
-- ============================================================================
CREATE TABLE public.oauth_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('strava', 'garmin', 'apple_health')),
  access_token TEXT NOT NULL, -- encrypt in production
  refresh_token TEXT,
  token_type TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  scope TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, provider)
);

CREATE INDEX idx_oauth_tokens_user_id ON public.oauth_tokens(user_id);
CREATE INDEX idx_oauth_tokens_provider ON public.oauth_tokens(provider);

-- ============================================================================
-- Teams Table (Pro tier)
-- ============================================================================
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  description TEXT,
  avatar_url TEXT,
  sport TEXT, -- e.g., 'running', 'cycling', 'soccer', 'football'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_teams_owner_id ON public.teams(owner_id);
CREATE INDEX idx_teams_created_at ON public.teams(created_at DESC);

-- ============================================================================
-- Team Members Table
-- ============================================================================
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'athlete' CHECK (role IN ('admin', 'coach', 'athlete')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id, user_id)
);

CREATE INDEX idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);

-- ============================================================================
-- Game Plans Table (Pro tier)
-- ============================================================================
CREATE TABLE public.game_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  opponent_data JSONB DEFAULT '{}',
  video_analysis TEXT, -- URL or embedded
  fitness_recommendations TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_game_plans_team_id ON public.game_plans(team_id);
CREATE INDEX idx_game_plans_created_at ON public.game_plans(created_at DESC);

-- ============================================================================
-- Row-Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_plans ENABLE ROW LEVEL SECURITY;

-- Users: can only read own profile
CREATE POLICY "Users can read own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- Health Metrics: can only read/write own
CREATE POLICY "Users can read own health metrics"
  ON public.health_metrics
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health metrics"
  ON public.health_metrics
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health metrics"
  ON public.health_metrics
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own health metrics"
  ON public.health_metrics
  FOR DELETE
  USING (auth.uid() = user_id);

-- Workouts: can only read/write own
CREATE POLICY "Users can read own workouts"
  ON public.workouts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts"
  ON public.workouts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts"
  ON public.workouts
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts"
  ON public.workouts
  FOR DELETE
  USING (auth.uid() = user_id);

-- AI Insights: can only read own
CREATE POLICY "Users can read own insights"
  ON public.ai_insights
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insights"
  ON public.ai_insights
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insights"
  ON public.ai_insights
  FOR UPDATE
  USING (auth.uid() = user_id);

-- OAuth Tokens: can only read/write own
CREATE POLICY "Users can read own oauth tokens"
  ON public.oauth_tokens
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own oauth tokens"
  ON public.oauth_tokens
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own oauth tokens"
  ON public.oauth_tokens
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Teams: owners can read own, members can read team
CREATE POLICY "Team owners can read own teams"
  ON public.teams
  FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Team members can read their teams"
  ON public.teams
  FOR SELECT
  USING (
    id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create teams"
  ON public.teams
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Team owners can update own teams"
  ON public.teams
  FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Team owners can delete own teams"
  ON public.teams
  FOR DELETE
  USING (auth.uid() = owner_id);

-- Team Members: team owners can manage, members can read own
CREATE POLICY "Team owners can manage members"
  ON public.team_members
  FOR ALL
  USING (
    team_id IN (
      SELECT id FROM public.teams WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can read their team memberships"
  ON public.team_members
  FOR SELECT
  USING (auth.uid() = user_id);

-- Game Plans: team owners/coaches can read/write, athletes can read
CREATE POLICY "Team members can read game plans"
  ON public.game_plans
  FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team owners and coaches can manage game plans"
  ON public.game_plans
  FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM public.team_members 
      WHERE user_id = auth.uid() AND role IN ('admin', 'coach')
    )
  );

CREATE POLICY "Team owners and coaches can update game plans"
  ON public.game_plans
  FOR UPDATE
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members 
      WHERE user_id = auth.uid() AND role IN ('admin', 'coach')
    )
  );

CREATE POLICY "Team owners and coaches can delete game plans"
  ON public.game_plans
  FOR DELETE
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members 
      WHERE user_id = auth.uid() AND role IN ('admin', 'coach')
    )
  );

-- ============================================================================
-- Triggers for updated_at timestamps
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_health_metrics_updated_at BEFORE UPDATE ON public.health_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workouts_updated_at BEFORE UPDATE ON public.workouts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_insights_updated_at BEFORE UPDATE ON public.ai_insights
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_oauth_tokens_updated_at BEFORE UPDATE ON public.oauth_tokens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_game_plans_updated_at BEFORE UPDATE ON public.game_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- Functions for common queries
-- ============================================================================

-- Get user's recent health metrics (last N days)
CREATE OR REPLACE FUNCTION public.get_recent_health_metrics(
  p_user_id UUID,
  p_days INTEGER DEFAULT 30,
  p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  source TEXT,
  type TEXT,
  value NUMERIC,
  unit TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    hm.id,
    hm.user_id,
    hm.source,
    hm.type,
    hm.value,
    hm.unit,
    hm.recorded_at,
    hm.created_at
  FROM public.health_metrics hm
  WHERE hm.user_id = p_user_id
    AND hm.recorded_at >= CURRENT_TIMESTAMP - INTERVAL '1 day' * p_days
  ORDER BY hm.recorded_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Get user's recent workouts
CREATE OR REPLACE FUNCTION public.get_recent_workouts(
  p_user_id UUID,
  p_days INTEGER DEFAULT 30,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  source TEXT,
  type TEXT,
  duration INTEGER,
  distance NUMERIC,
  calories NUMERIC,
  avg_heart_rate NUMERIC,
  started_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    w.id,
    w.user_id,
    w.source,
    w.type,
    w.duration,
    w.distance,
    w.calories,
    w.avg_heart_rate,
    w.started_at,
    w.created_at
  FROM public.workouts w
  WHERE w.user_id = p_user_id
    AND w.started_at >= CURRENT_TIMESTAMP - INTERVAL '1 day' * p_days
  ORDER BY w.started_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
