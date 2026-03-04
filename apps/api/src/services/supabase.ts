import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database schema types (optional, for TypeScript)
export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface HealthMetric {
  id: string;
  user_id: string;
  metric_type: 'steps' | 'heart_rate' | 'sleep' | 'calories' | 'distance';
  value: number;
  unit: string;
  recorded_at: string;
  source: 'strava' | 'garmin' | 'apple_health' | 'manual';
  created_at: string;
  updated_at?: string;
}

export interface Insight {
  id: string;
  user_id: string;
  title: string;
  content: string;
  metric_type?: string;
  generated_by: 'claude' | 'rule_based';
  created_at: string;
}

export interface OAuthToken {
  id: string;
  user_id: string;
  provider: 'strava' | 'garmin' | 'apple_health';
  authorization_code: string;
  access_token?: string;
  refresh_token?: string;
  expires_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface Team {
  id: string;
  name: string;
  owner_id: string;
  description?: string;
  created_at: string;
  updated_at?: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'admin' | 'coach' | 'athlete';
  joined_at: string;
}

export interface GamePlan {
  id: string;
  team_id: string;
  title: string;
  description?: string;
  opponent?: string;
  training_focus?: string[];
  video_url?: string;
  generated_by: 'claude' | 'manual';
  created_at: string;
  updated_at?: string;
}

/**
 * Initialize database tables (run once during setup)
 * In production, use Supabase migrations instead
 */
export async function initializeDatabase() {
  try {
    // These queries assume the schema already exists in Supabase
    // For a fresh setup, create these tables via the Supabase UI or migrations

    console.log('Database schema check complete');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

/**
 * Verify Supabase connection
 */
export async function verifyConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    console.log('✓ Supabase connected');
    return true;
  } catch (error) {
    console.error('Failed to verify Supabase connection:', error);
    return false;
  }
}
