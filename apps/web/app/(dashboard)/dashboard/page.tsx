'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const COLORS = {
  hrv:        { color: '#C4A84F', bg: 'rgba(196,168,79,0.08)',  border: 'rgba(196,168,79,0.15)'  },
  sleep:      { color: '#4A9B8E', bg: 'rgba(74,155,142,0.08)',  border: 'rgba(74,155,142,0.15)'  },
  heart_rate: { color: '#8C9A2E', bg: 'rgba(140,154,46,0.08)',  border: 'rgba(140,154,46,0.15)'  },
  steps:      { color: '#A8B840', bg: 'rgba(168,184,64,0.08)',  border: 'rgba(168,184,64,0.15)'  },
  calories:   { color: '#C4A84F', bg: 'rgba(196,168,79,0.08)',  border: 'rgba(196,168,79,0.15)'  },
}

const LABELS: Record<string, { label: string, unit: string }> = {
  hrv:        { label: 'HRV',          unit: 'ms'    },
  sleep:      { label: 'Sleep',        unit: 'hrs'   },
  heart_rate: { label: 'Resting HR',   unit: 'bpm'   },
  steps:      { label: 'Steps',        unit: '/day'  },
  calories:   { label: 'Calories',     unit: 'kcal'  },
}

// Fallback mock data shown when not logged in / no data yet
const MOCK_METRICS = [
  { label: 'HRV',        value: '68',    unit: 'ms',   sub: '↑ trending up',       color: '#C4A84F', bg: 'rgba(196,168,79,0.08)',  border: 'rgba(196,168,79,0.15)',  data: [52,58,55,63,60,65,68].map(v => ({ v })) },
  { label: 'Sleep',      value: '7h 42m',unit: '',     sub: 'Score 91 · Deep 1h20m', color: '#4A9B8E', bg: 'rgba(74,155,142,0.08)',  border: 'rgba(74,155,142,0.15)',  data: [6.5,7.2,6.8,7.5,8.1,7.4,7.7].map(v => ({ v })) },
  { label: 'Resting HR', value: '58',    unit: 'bpm',  sub: '↓ 4bpm this month',   color: '#8C9A2E', bg: 'rgba(140,154,46,0.08)',  border: 'rgba(140,154,46,0.15)',  data: [63,62,61,60,59,59,58].map(v => ({ v })) },
  { label: 'Steps',      value: '9.8k',  unit: '/day', sub: 'Avg last 7 days',     color: '#A8B840', bg: 'rgba(168,184,64,0.08)',  border: 'rgba(168,184,64,0.15)',  data: [8200,9400,11200,8800,10100,9600,9800].map(v => ({ v })) },
]
const MOCK_WORKOUTS = [
  { name: 'Morning Run',     type: 'run',      duration: '43 min', distance: '8.4 km',  date: 'Today' },
  { name: 'Evening Ride',    type: 'ride',     duration: '72 min', distance: '28.6 km', date: 'Yesterday' },
  { name: 'Strength — Upper',type: 'strength', duration: '55 min', distance: null,      date: 'Mon' },
]
const MOCK_INSIGHTS = [
  { icon: '🏆', text: 'New monthly distance PR — 53.9km this month, your best ever.', color: '#A8B840' },
  { icon: '⚠️', text: 'Sleep debt building — averaging 6.4h vs your 7.5h baseline.', color: '#F59E0B' },
]

function workoutIcon(type: string) {
  if (type === 'run') return '🏃'
  if (type === 'ride') return '🚴'
  if (type === 'swim') return '🏊'
  return '🏋️'
}

function formatDuration(secs: number) {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m} min`
}

export default function DashboardPage() {
  const router = useRouter()
  const [userName, setUserName] = useState('there')
  const [metrics, setMetrics] = useState(MOCK_METRICS)
  const [workouts, setWorkouts] = useState(MOCK_WORKOUTS)
  const [insights, setInsights] = useState(MOCK_INSIGHTS)
  const [loading, setLoading] = useState(true)
  const [usingReal, setUsingReal] = useState(false)
  const [summary, setSummary] = useState<string[]>([])
  const [providers, setProviders] = useState<string[]>([])

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        // Not logged in — show mock data (demo mode)
        setLoading(false)
        return
      }

      const uid = session.user.id

      // Get user name
      const { data: profile } = await supabase
        .from('users').select('name').eq('id', uid).single()
      if (profile?.name) setUserName(profile.name)

      // Get last 30 days of health metrics
      const { data: rawMetrics } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('user_id', uid)
        .gte('recorded_at', new Date(Date.now() - 30 * 86400000).toISOString())
        .order('recorded_at', { ascending: true })

      // Get recent workouts
      const { data: rawWorkouts } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', uid)
        .order('started_at', { ascending: false })
        .limit(5)

      // Get AI insights
      const { data: rawInsights } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .limit(3)

      // Get connected providers (Strava, Garmin, Apple Health, etc.)
      const { data: rawOauth } = await supabase
        .from('oauth_tokens')
        .select('provider')
        .eq('user_id', uid)

      // Process metrics — group by type, take last 7 readings per type
      const summaryPoints: string[] = []

      if (rawMetrics && rawMetrics.length > 0) {
        const grouped: Record<string, number[]> = {}
        rawMetrics.forEach((m: any) => {
          if (!grouped[m.type]) grouped[m.type] = []
          grouped[m.type].push(parseFloat(m.value))
        })

        const processed = Object.entries(grouped)
          .filter(([type]) => COLORS[type as keyof typeof COLORS])
          .map(([type, values]) => {
            const last7 = values.slice(-7)
            const latest = values[values.length - 1]
            const prev   = values[values.length - 2] ?? latest
            const trend  = latest > prev ? '↑' : latest < prev ? '↓' : '→'
            const cfg = COLORS[type as keyof typeof COLORS]
            const meta = LABELS[type] ?? { label: type, unit: '' }

            let displayVal = ''
            if (type === 'sleep') {
              const h = Math.floor(latest), m = Math.round((latest - h) * 60)
              displayVal = `${h}h ${m}m`
            } else if (type === 'steps') {
              displayVal = (latest / 1000).toFixed(1) + 'k'
            } else {
              displayVal = Math.round(latest).toString()
            }

            return {
              label: meta.label, value: displayVal, unit: meta.unit,
              sub: `${trend} latest reading`,
              color: cfg.color, bg: cfg.bg, border: cfg.border,
              data: last7.map(v => ({ v })),
            }
          })

        if (processed.length >= 2) {
          setMetrics(processed)
          setUsingReal(true)
        }

        const byType = (type: string) =>
          rawMetrics
            .filter((m: any) => m.type === type)
            .sort(
              (a: any, b: any) =>
                new Date(a.recorded_at).getTime() -
                new Date(b.recorded_at).getTime()
            )

        const hrv = byType('hrv')
        if (hrv.length >= 2) {
          const first = Number(hrv[0].value)
          const last = Number(hrv[hrv.length - 1].value)
          const change = last - first
          const pct = first ? Math.round((change / first) * 100) : 0
          summaryPoints.push(
            change >= 0
              ? `HRV is up about ${pct}% over the last 30 days (${Math.round(
                  first
                )}→${Math.round(
                  last
                )} ms), a sign your recovery capacity is improving.`
              : `HRV is down about ${Math.abs(
                  pct
                )}% over the last 30 days (${Math.round(
                  first
                )}→${Math.round(
                  last
                )} ms), suggesting recovery has been under strain.`
          )
        }

        const rhr = byType('heart_rate')
        if (rhr.length >= 2) {
          const first = Number(rhr[0].value)
          const last = Number(rhr[rhr.length - 1].value)
          const change = last - first
          if (Math.abs(change) >= 2) {
            summaryPoints.push(
              change < 0
                ? `Resting heart rate has dropped from ${Math.round(
                    first
                  )} to ${Math.round(
                    last
                  )} bpm — consistent with improving aerobic fitness.`
                : `Resting heart rate has risen from ${Math.round(
                    first
                  )} to ${Math.round(
                    last
                  )} bpm — worth watching sleep, stress, and recovery.`
            )
          }
        }

        const sleep = byType('sleep')
        if (sleep.length > 0) {
          const vals = sleep.map((s: any) => Number(s.value))
          const avg =
            vals.reduce((sum, v) => sum + v, 0) / (vals.length || 1)
          const shortNights = vals.filter(v => v < 7).length
          summaryPoints.push(
            `You’ve averaged about ${avg.toFixed(
              1
            )} hours of sleep per night; ${shortNights} of the last ${
              vals.length
            } nights were under 7 hours, which is where sleep debt can start to add up.`
          )
        }

        const steps = byType('steps')
        if (steps.length > 0) {
          const vals = steps.map((s: any) => Number(s.value))
          const avg =
            vals.reduce((sum, v) => sum + v, 0) / (vals.length || 1)
          const highDays = vals.filter(v => v >= 10000).length
          summaryPoints.push(
            `Daily steps are averaging around ${Math.round(
              avg
            ).toLocaleString()} — with ${highDays} days above 10,000 steps in the last ${
              vals.length
            }, a solid baseline of movement.`
          )
        }
      }

      // Process workouts
      if (rawWorkouts && rawWorkouts.length > 0) {
        const now = Date.now()
        const totalMins =
          rawWorkouts.reduce(
            (sum: number, w: any) => sum + (w.duration || 0),
            0
          ) / 60
        const hiDays = rawWorkouts.filter(
          (w: any) =>
            (w.type === 'run' || w.type === 'ride') &&
            (w.avg_heart_rate ?? 0) >= 150
        ).length

        summaryPoints.push(
          `You logged ${rawWorkouts.length} workouts in the last 30 days, about ${Math.round(
            totalMins / 60
          )} total hours; ${hiDays} of those days look like high-intensity sessions.`
        )

        setWorkouts(
          rawWorkouts.map((w: any) => {
            const diff = now - new Date(w.started_at).getTime()
            const days = Math.floor(diff / 86400000)
            const dateLabel =
              days === 0
                ? 'Today'
                : days === 1
                ? 'Yesterday'
                : `${days}d ago`
            return {
              name:
                w.notes?.split(' — ')[0] ??
                (w.type.charAt(0).toUpperCase() + w.type.slice(1)),
              type: w.type,
              duration: formatDuration(w.duration),
              distance: w.distance ? `${(w.distance / 1000).toFixed(1)} km` : null,
              date: dateLabel,
            }
          })
        )
      }

      // Process insights
      if (rawInsights && rawInsights.length > 0) {
        const iconMap: Record<string, string> = {
          achievement: '🏆', recommendation: '💡', warning: '⚠️', game_plan: '📋'
        }
        const colorMap: Record<string, string> = {
          achievement: '#A8B840', recommendation: '#4A9B8E', warning: '#F59E0B', game_plan: '#C4A84F'
        }
        setInsights(rawInsights.map((ins: any) => ({
          icon: iconMap[ins.type] ?? '💡',
          text: ins.body,
          color: colorMap[ins.type] ?? '#A8B840',
        })))
      }

      if (rawOauth && rawOauth.length > 0) {
        const unique = Array.from(
          new Set(
            rawOauth.map((o: any) =>
              (o.provider as string | undefined)?.replace('_', ' ') ?? '',
            ),
          ),
        ).filter(Boolean)
        setProviders(unique)
      }

      if (summaryPoints.length > 0) {
        setSummary(summaryPoints)
      }

      setLoading(false)
    }
    load()
  }, [])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-white/10 border-t-[#A8B840] rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading your data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{greeting()}, {userName}</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              {usingReal ? ' · Live data' : ' · Demo mode'}
            </p>
            {usingReal && providers.length > 0 && (
              <p className="text-[11px] text-gray-500 mt-1">
                Connected:{' '}
                <span className="text-gray-300">
                  {providers.join(' · ')}
                </span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border"
            style={{ color: '#A8B840', background: 'rgba(140,154,46,0.08)', borderColor: 'rgba(140,154,46,0.2)' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#A8B840' }} />
            {usingReal ? 'Live' : 'Demo'}
          </div>
        </div>
      </motion.div>

      {/* Summary insights */}
      {summary.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-white/[0.06] bg-[#0e0e0e] p-5"
        >
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-[0.18em] mb-3">
            Last 30 days — headline takeaways
          </p>
          <ul className="space-y-2.5 text-sm text-gray-300">
            {summary.map((line, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-[5px] w-1.5 h-1.5 rounded-full bg-[#A8B840]" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }} whileHover={{ y: -2 }}
            className="rounded-2xl p-5 border cursor-pointer"
            style={{ background: m.bg, borderColor: m.border }}>
            <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider">{m.label}</p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-2xl font-bold" style={{ color: m.color }}>{m.value}</span>
              {m.unit && <span className="text-sm text-gray-500">{m.unit}</span>}
            </div>
            <p className="text-xs text-gray-500 mb-4">{m.sub}</p>
            <div className="h-12">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={m.data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <Area type="monotone" dataKey="v" stroke={m.color} strokeWidth={1.5} fill={m.color} fillOpacity={0.1} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Training load chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="lg:col-span-2 rounded-2xl border border-white/[0.05] bg-[#0e0e0e] p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-sm">Weekly Training Load</h3>
              <p className="text-xs text-gray-500 mt-0.5">Strain vs Recovery</p>
            </div>
            <span className="text-xs text-gray-600 border border-white/5 px-2 py-1 rounded-lg">Last 7 days</span>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { day: 'Mon', strain: 8,  recovery: 72 },
                { day: 'Tue', strain: 14, recovery: 65 },
                { day: 'Wed', strain: 11, recovery: 70 },
                { day: 'Thu', strain: 0,  recovery: 80 },
                { day: 'Fri', strain: 13, recovery: 75 },
                { day: 'Sat', strain: 15, recovery: 78 },
                { day: 'Sun', strain: 9,  recovery: 87 },
              ]} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                <Area type="monotone" dataKey="recovery" stroke="#8C9A2E" strokeWidth={1.5} fill="#8C9A2E" fillOpacity={0.08} dot={false} />
                <Area type="monotone" dataKey="strain"   stroke="#C4A84F" strokeWidth={1.5} fill="#C4A84F" fillOpacity={0.08} dot={false} />
                <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }} labelStyle={{ color: '#666' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-2.5 h-0.5 rounded bg-[#8C9A2E]" />Recovery</div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-2.5 h-0.5 rounded bg-[#C4A84F]" />Strain</div>
          </div>
        </motion.div>

        {/* AI Insights */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="rounded-2xl border border-white/[0.05] bg-[#0e0e0e] p-6 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-sm">AI Insights</h3>
            <Link href="/dashboard/insights" className="text-xs text-gray-500 hover:text-white transition-colors">View all →</Link>
          </div>
          <div className="space-y-4 flex-1">
            {insights.map((ins, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-lg flex-shrink-0">{ins.icon}</span>
                <p className="text-xs text-gray-400 leading-relaxed">{ins.text}</p>
              </div>
            ))}
          </div>
          <Link href="/dashboard/chat"
            className="mt-5 w-full py-2.5 rounded-xl border border-white/[0.06] text-xs text-gray-400 hover:text-white hover:border-white/10 transition-colors text-center">
            Ask the AI →
          </Link>
        </motion.div>
      </div>

      {/* Recent workouts */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="rounded-2xl border border-white/[0.05] bg-[#0e0e0e] p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-sm">Recent Activity</h3>
          <Link href="/dashboard/workouts" className="text-xs text-gray-500 hover:text-white transition-colors">View all →</Link>
        </div>
        <div className="space-y-3">
          {workouts.map((w, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 + i * 0.06 }}
              className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-sm">
                  {workoutIcon(w.type)}
                </div>
                <div>
                  <p className="text-sm font-medium">{w.name}</p>
                  <p className="text-xs text-gray-500">{w.duration}{w.distance ? ` · ${w.distance}` : ''}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">{w.date}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
