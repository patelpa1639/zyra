'use client'

import { motion } from 'framer-motion'
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'
import Link from 'next/link'

const recoveryData = [65, 72, 68, 80, 75, 87, 91].map((v, i) => ({ v }))
const hrvData = [52, 58, 55, 63, 60, 65, 68].map((v) => ({ v }))
const sleepData = [6.5, 7.2, 6.8, 7.5, 8.1, 7.4, 7.7].map((v) => ({ v }))
const strainData = [8, 11, 14, 10, 13, 9, 14].map((v) => ({ v }))

const metrics = [
  {
    label: 'Recovery',
    value: '87',
    unit: '%',
    sub: '+12 from yesterday',
    color: '#8C9A2E',
    bg: 'rgba(140,154,46,0.08)',
    border: 'rgba(140,154,46,0.15)',
    data: recoveryData,
    trend: 'up',
  },
  {
    label: 'HRV',
    value: '68',
    unit: 'ms',
    sub: '↑ 5ms this week',
    color: '#C4A84F',
    bg: 'rgba(196,168,79,0.08)',
    border: 'rgba(196,168,79,0.15)',
    data: hrvData,
    trend: 'up',
  },
  {
    label: 'Sleep',
    value: '7h 42m',
    unit: '',
    sub: 'Score 91 · Deep 1h 20m',
    color: '#4A9B8E',
    bg: 'rgba(74,155,142,0.08)',
    border: 'rgba(74,155,142,0.15)',
    data: sleepData,
    trend: 'up',
  },
  {
    label: 'Strain',
    value: '14.2',
    unit: '',
    sub: 'High · 847 kcal',
    color: '#A8B840',
    bg: 'rgba(168,184,64,0.08)',
    border: 'rgba(168,184,64,0.15)',
    data: strainData,
    trend: 'up',
  },
]

const recentWorkouts = [
  { name: 'Morning Run', type: 'Run', duration: '42 min', distance: '7.2 km', strain: 12.4, date: 'Today' },
  { name: 'Strength Training', type: 'Weights', duration: '58 min', distance: null, strain: 11.1, date: 'Yesterday' },
  { name: 'Evening Ride', type: 'Ride', duration: '1h 12m', distance: '28.4 km', strain: 14.8, date: 'Mon' },
]

const insights = [
  { icon: '💜', text: 'Your HRV has been trending up for 5 days — body is adapting well to training load.', color: '#8B5CF6' },
  { icon: '⚠️', text: 'Sleep debt building. You\'re 1.5 hrs short this week — prioritize sleep tonight.', color: '#F59E0B' },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Good morning, Pranav</h1>
            <p className="text-gray-500 text-sm mt-0.5">Wednesday, March 4 · Last synced 2 min ago</p>
          </div>
          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border" style={{ color: '#A8B840', background: 'rgba(140,154,46,0.08)', borderColor: 'rgba(140,154,46,0.2)' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#A8B840' }} />
            Live
          </div>
        </div>
      </motion.div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            whileHover={{ y: -2 }}
            className="rounded-2xl p-5 border cursor-pointer"
            style={{ background: m.bg, borderColor: m.border }}
          >
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
        {/* Weekly training load */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 rounded-2xl border border-white/[0.05] bg-[#0e0e0e] p-6"
        >
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
                { day: 'Mon', strain: 8, recovery: 72 },
                { day: 'Tue', strain: 11, recovery: 68 },
                { day: 'Wed', strain: 14, recovery: 75 },
                { day: 'Thu', strain: 10, recovery: 80 },
                { day: 'Fri', strain: 13, recovery: 77 },
                { day: 'Sat', strain: 9, recovery: 85 },
                { day: 'Sun', strain: 14, recovery: 87 },
              ]} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                <Area type="monotone" dataKey="recovery" stroke="#8C9A2E" strokeWidth={1.5} fill="#8C9A2E" fillOpacity={0.08} dot={false} />
                <Area type="monotone" dataKey="strain" stroke="#C4A84F" strokeWidth={1.5} fill="#C4A84F" fillOpacity={0.08} dot={false} />
                <Tooltip
                  contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#666' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-2.5 h-0.5 rounded" style={{ background: '#8C9A2E' }} />Recovery</div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-2.5 h-0.5 rounded" style={{ background: '#C4A84F' }} />Strain</div>
          </div>
        </motion.div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-2xl border border-white/[0.05] bg-[#0e0e0e] p-6 flex flex-col"
        >
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
          <Link href="/dashboard/chat" className="mt-5 w-full py-2.5 rounded-xl border border-white/[0.06] text-xs text-gray-400 hover:text-white hover:border-white/10 transition-colors text-center">
            Ask the AI →
          </Link>
        </motion.div>
      </div>

      {/* Recent workouts */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl border border-white/[0.05] bg-[#0e0e0e] p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-sm">Recent Activity</h3>
          <Link href="/dashboard/workouts" className="text-xs text-gray-500 hover:text-white transition-colors">View all →</Link>
        </div>
        <div className="space-y-3">
          {recentWorkouts.map((w, i) => (
            <motion.div
              key={w.name}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 + i * 0.06 }}
              className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0"
            >
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-sm">
                  {w.type === 'Run' ? '🏃' : w.type === 'Ride' ? '🚴' : '🏋️'}
                </div>
                <div>
                  <p className="text-sm font-medium">{w.name}</p>
                  <p className="text-xs text-gray-500">{w.duration}{w.distance ? ` · ${w.distance}` : ''}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-yellow-400">{w.strain}</p>
                <p className="text-xs text-gray-500">{w.date}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
