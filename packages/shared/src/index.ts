// Shared types across web, mobile, and api

export interface User {
  id: string
  email: string
  name: string
  plan: 'free' | 'pro' | 'teams'
  createdAt: string
}

export interface HealthMetric {
  id: string
  userId: string
  source: 'strava' | 'garmin' | 'apple_health' | 'manual'
  type: 'steps' | 'heart_rate' | 'sleep' | 'workout' | 'calories' | 'hrv'
  value: number
  unit: string
  recordedAt: string
}

export interface Workout {
  id: string
  userId: string
  source: 'strava' | 'garmin' | 'apple_health' | 'manual'
  type: string
  duration: number // seconds
  distance?: number // meters
  calories?: number
  avgHeartRate?: number
  startedAt: string
}

export interface AIInsight {
  id: string
  userId: string
  type: 'recommendation' | 'warning' | 'achievement' | 'game_plan'
  title: string
  body: string
  data?: Record<string, unknown>
  createdAt: string
}

export interface GamePlan {
  id: string
  teamId: string
  title: string
  opponentData?: Record<string, unknown>
  videoAnalysis?: string
  fitnessRecommendations: string[]
  createdAt: string
}
