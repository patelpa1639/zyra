'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import React, { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts'

const OLIVE = '#8C9A2E'
const OLIVE_LIGHT = '#A8B840'
const WARM = '#C4A84F'
const TEAL = '#4A9B8E'

type WorkoutType = 'Run' | 'Ride' | 'Swim' | 'Strength'
type SourceFilter = 'All' | 'Strava' | 'Garmin' | 'Apple Health'

interface Workout {
  id: number
  name: string
  type: WorkoutType
  date: string
  source: string
  distance: string
  duration: string
  heartRate: string
  calories: number
  strain: number
  notes: string
}

const workouts: Workout[] = [
  {
    id: 1,
    name: 'Morning Tempo Run',
    type: 'Run',
    date: 'Mar 3, 2026',
    source: 'Strava',
    distance: '8.4 km',
    duration: '42 min',
    heartRate: '148 bpm',
    calories: 512,
    strain: 13,
    notes: 'Felt strong through the first half. Legs heavy at the end but hit target pace.',
  },
  {
    id: 2,
    name: 'Trail Ride – River Loop',
    type: 'Ride',
    date: 'Mar 2, 2026',
    source: 'Garmin',
    distance: '34.2 km',
    duration: '1h 22 min',
    heartRate: '141 bpm',
    calories: 780,
    strain: 15,
    notes: 'Windy conditions slowed average speed. Good cadence throughout.',
  },
  {
    id: 3,
    name: 'Upper Body Strength',
    type: 'Strength',
    date: 'Mar 1, 2026',
    source: 'Apple Health',
    distance: '—',
    duration: '55 min',
    heartRate: '122 bpm',
    calories: 310,
    strain: 7,
    notes: 'New PR on bench. Kept rest intervals tight. Shoulder felt fine.',
  },
  {
    id: 4,
    name: 'Open Water Swim',
    type: 'Swim',
    date: 'Feb 28, 2026',
    source: 'Garmin',
    distance: '2.1 km',
    duration: '48 min',
    heartRate: '135 bpm',
    calories: 420,
    strain: 10,
    notes: 'Chilly water but sighting was clean. Breathing rhythm dialed in.',
  },
  {
    id: 5,
    name: 'Easy Recovery Run',
    type: 'Run',
    date: 'Feb 27, 2026',
    source: 'Apple Health',
    distance: '5.0 km',
    duration: '30 min',
    heartRate: '128 bpm',
    calories: 295,
    strain: 5,
    notes: 'Zone 1 the whole way. Shakeout after Saturday ride.',
  },
  {
    id: 6,
    name: 'Long Ride – Coast Road',
    type: 'Ride',
    date: 'Feb 26, 2026',
    source: 'Strava',
    distance: '68.0 km',
    duration: '2h 41 min',
    heartRate: '152 bpm',
    calories: 1340,
    strain: 18,
    notes: 'Big effort. Nutrition on point — no bonk. Quads a little cooked by km 55.',
  },
  {
    id: 7,
    name: 'Threshold Intervals',
    type: 'Run',
    date: 'Feb 25, 2026',
    source: 'Strava',
    distance: '10.2 km',
    duration: '52 min',
    heartRate: '162 bpm',
    calories: 640,
    strain: 16,
    notes: '5×1000m at threshold. Hit 3:58 avg. Last rep was a fight.',
  },
  {
    id: 8,
    name: 'Pool Swim – Drills',
    type: 'Swim',
    date: 'Feb 24, 2026',
    source: 'Apple Health',
    distance: '1.5 km',
    duration: '38 min',
    heartRate: '118 bpm',
    calories: 290,
    strain: 4,
    notes: 'Focused on catch and pull. Worked on bilateral breathing.',
  },
  {
    id: 9,
    name: 'Full Body Circuit',
    type: 'Strength',
    date: 'Feb 23, 2026',
    source: 'Apple Health',
    distance: '—',
    duration: '45 min',
    heartRate: '138 bpm',
    calories: 390,
    strain: 9,
    notes: 'High-rep circuit with minimal rest. Heart rate stayed elevated.',
  },
  {
    id: 10,
    name: 'Sunday Long Run',
    type: 'Run',
    date: 'Feb 22, 2026',
    source: 'Garmin',
    distance: '18.5 km',
    duration: '1h 44 min',
    heartRate: '144 bpm',
    calories: 1020,
    strain: 14,
    notes: 'Best long run of the block. Even splits and strong finish.',
  },
  {
    id: 11,
    name: 'Criterium Ride',
    type: 'Ride',
    date: 'Feb 21, 2026',
    source: 'Strava',
    distance: '45.0 km',
    duration: '1h 35 min',
    heartRate: '157 bpm',
    calories: 1010,
    strain: 17,
    notes: 'Punchy efforts around the circuit. Legs came around after lap 3.',
  },
  {
    id: 12,
    name: 'Legs & Core',
    type: 'Strength',
    date: 'Feb 20, 2026',
    source: 'Apple Health',
    distance: '—',
    duration: '60 min',
    heartRate: '130 bpm',
    calories: 410,
    strain: 8,
    notes: 'Squats, deadlifts, and plank variations. Glutes fired well today.',
  },
]

const weeklyData = [
  { week: 'Jan 6',  load: 48, runs: 18, rides: 22, strength: 8  },
  { week: 'Jan 13', load: 55, runs: 22, rides: 24, strength: 9  },
  { week: 'Jan 20', load: 61, runs: 25, rides: 26, strength: 10 },
  { week: 'Jan 27', load: 44, runs: 14, rides: 20, strength: 10 },
  { week: 'Feb 3',  load: 70, runs: 28, rides: 30, strength: 12 },
  { week: 'Feb 10', load: 66, runs: 26, rides: 28, strength: 12 },
  { week: 'Feb 17', load: 78, runs: 30, rides: 34, strength: 14 },
  { week: 'Feb 24', load: 82, runs: 32, rides: 36, strength: 14 },
]

const hrZoneData = [
  { zone: 'Z1', minutes: 8  },
  { zone: 'Z2', minutes: 18 },
  { zone: 'Z3', minutes: 10 },
  { zone: 'Z4', minutes: 7  },
  { zone: 'Z5', minutes: 4  },
]

const FILTER_OPTIONS: Array<'All' | WorkoutType> = ['All', 'Run', 'Ride', 'Swim', 'Strength']
const SOURCE_OPTIONS: SourceFilter[] = ['All', 'Strava', 'Garmin', 'Apple Health']

function typeIcon(type: WorkoutType): string {
  switch (type) {
    case 'Run':      return '🏃'
    case 'Ride':     return '🚴'
    case 'Swim':     return '🏊'
    case 'Strength': return '💪'
  }
}

function strainColor(strain: number): { bg: string; text: string; label: string } {
  if (strain < 8)  return { bg: 'rgba(74,155,142,0.18)',  text: '#4A9B8E', label: 'Low'    }
  if (strain <= 14) return { bg: 'rgba(196,168,79,0.18)', text: '#C4A84F', label: 'Moderate' }
  return               { bg: 'rgba(210,75,75,0.18)',  text: '#D24B4B', label: 'High'   }
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        background: '#0f0e0b',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 8,
        padding: '10px 14px',
        fontSize: 12,
        color: '#ccc',
      }}
    >
      <p style={{ marginBottom: 6, color: '#fff', fontWeight: 600 }}>{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.dataKey} style={{ color: entry.fill, margin: '2px 0' }}>
          {entry.name}: <span style={{ color: '#fff' }}>{entry.value}</span>
        </p>
      ))}
    </div>
  )
}

const HRTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        background: '#0f0e0b',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 8,
        padding: '8px 12px',
        fontSize: 12,
        color: '#ccc',
      }}
    >
      <p style={{ color: '#fff', fontWeight: 600 }}>{label}</p>
      <p style={{ color: OLIVE_LIGHT, margin: '2px 0' }}>
        {payload[0].value} min
      </p>
    </div>
  )
}

export default function WorkoutsPage() {
  const [activeFilter, setActiveFilter] = useState<'All' | WorkoutType>('All')
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('All')
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)

  const filtered = workouts.filter((w) => {
    const typeOk = activeFilter === 'All' || w.type === activeFilter
    const sourceOk = sourceFilter === 'All' || w.source === sourceFilter
    return typeOk && sourceOk
  })

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#080808',
        color: '#e8e8e0',
        fontFamily: "'Inter', sans-serif",
        padding: '32px 28px',
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      {/* ── Page header ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 32,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: '-0.5px',
              margin: 0,
              color: '#f0efe8',
            }}
          >
            Activity
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#888' }}>
            Your training history
          </p>
        </div>

        {/* Sync badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(140,154,46,0.12)',
            border: '1px solid rgba(140,154,46,0.28)',
            borderRadius: 999,
            padding: '5px 14px',
            fontSize: 12,
            color: OLIVE_LIGHT,
            fontWeight: 500,
            alignSelf: 'flex-start',
          }}
        >
          <span style={{ position: 'relative', display: 'inline-flex', width: 8, height: 8 }}>
            <motion.span
              animate={{ scale: [1, 1.8, 1], opacity: [0.8, 0, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                background: OLIVE,
              }}
            />
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: OLIVE_LIGHT,
                display: 'block',
              }}
            />
          </span>
          Synced 3m ago
        </div>
      </motion.div>

      {/* ── Weekly training load ────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        style={{
          background: '#0f0e0b',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: 14,
          padding: '22px 20px 16px',
          marginBottom: 28,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#e0dfda', letterSpacing: '0.1px' }}>
              Weekly Training Load
            </p>
            <p style={{ margin: '3px 0 0', fontSize: 11, color: '#666' }}>Last 8 weeks</p>
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#888' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: OLIVE, display: 'inline-block' }} />
              Runs
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: WARM, display: 'inline-block' }} />
              Rides
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: TEAL, display: 'inline-block' }} />
              Strength
            </span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weeklyData} barSize={14} barGap={2} barCategoryGap="28%">
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="week"
              tick={{ fill: '#666', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#555', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="runs"     name="Runs"     stackId="a" fill={OLIVE} radius={[0, 0, 0, 0]} />
            <Bar dataKey="rides"    name="Rides"    stackId="a" fill={WARM}  radius={[0, 0, 0, 0]} />
            <Bar dataKey="strength" name="Strength" stackId="a" fill={TEAL}  radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* ── Filters ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, delay: 0.18 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          marginBottom: 20,
        }}
      >
        {/* Type filter */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {FILTER_OPTIONS.map((opt) => {
            const isActive = activeFilter === opt
            return (
              <button
                key={opt}
                onClick={() => setActiveFilter(opt)}
                style={{
                  padding: '6px 16px',
                  borderRadius: 999,
                  border: isActive
                    ? `1px solid ${OLIVE}`
                    : '1px solid rgba(255,255,255,0.07)',
                  background: isActive ? 'rgba(140,154,46,0.18)' : 'transparent',
                  color: isActive ? OLIVE_LIGHT : '#888',
                  fontSize: 12,
                  fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  letterSpacing: '0.2px',
                }}
              >
                {opt}
              </button>
            )
          })}
        </div>

        {/* Source filter */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {SOURCE_OPTIONS.map((src) => {
            const isActive = sourceFilter === src
            return (
              <button
                key={src}
                onClick={() => setSourceFilter(src)}
                style={{
                  padding: '5px 14px',
                  borderRadius: 999,
                  border: isActive
                    ? `1px solid ${TEAL}`
                    : '1px solid rgba(255,255,255,0.06)',
                  background: isActive ? 'rgba(74,155,142,0.18)' : 'transparent',
                  color: isActive ? TEAL : '#777',
                  fontSize: 11,
                  fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  letterSpacing: '0.2px',
                }}
              >
                {src === 'All' ? 'All sources' : src}
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* ── Workout list ───────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <AnimatePresence mode="popLayout">
          {filtered.map((workout, idx) => {
            const sc = strainColor(workout.strain)
            const isSelected = selectedWorkout?.id === workout.id
            return (
              <motion.div
                key={workout.id}
                layout
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.28, delay: idx * 0.04 }}
                onClick={() => setSelectedWorkout(workout)}
                style={{
                  background: isSelected ? 'rgba(140,154,46,0.07)' : '#0f0e0b',
                  border: isSelected
                    ? `1px solid rgba(140,154,46,0.30)`
                    : '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 12,
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  cursor: 'pointer',
                  transition: 'background 0.18s ease, border-color 0.18s ease',
                }}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.025)' }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: 'rgba(255,255,255,0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    flexShrink: 0,
                  }}
                >
                  {typeIcon(workout.type)}
                </div>

                {/* Name + date */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#e8e8e0',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {workout.name}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: '#666' }}>
                    {workout.date} · {workout.source}
                  </p>
                </div>

                {/* Stats row */}
                <div
                  style={{
                    display: 'flex',
                    gap: 20,
                    alignItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Stat label="Dist" value={workout.distance} />
                  <Stat label="Time" value={workout.duration} />
                  <Stat label="HR" value={workout.heartRate} />

                  {/* Strain badge */}
                  <div
                    style={{
                      background: sc.bg,
                      border: `1px solid ${sc.text}33`,
                      color: sc.text,
                      borderRadius: 6,
                      padding: '3px 9px',
                      fontSize: 11,
                      fontWeight: 700,
                      minWidth: 36,
                      textAlign: 'center',
                    }}
                  >
                    {workout.strain}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center', color: '#555', padding: '40px 0', fontSize: 13 }}
          >
            No workouts found for this filter.
          </motion.p>
        )}
      </div>

      {/* ── Detail panel (slide in from right) ─────────── */}
      <AnimatePresence>
        {selectedWorkout && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setSelectedWorkout(null)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.55)',
                zIndex: 40,
              }}
            />

            {/* Panel */}
            <motion.div
              key="panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 36 }}
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: 380,
                maxWidth: '92vw',
                background: '#0f0e0b',
                borderLeft: '1px solid rgba(255,255,255,0.06)',
                zIndex: 50,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Panel header */}
              <div
                style={{
                  padding: '22px 22px 18px',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 12,
                  position: 'sticky',
                  top: 0,
                  background: '#0f0e0b',
                  zIndex: 1,
                }}
              >
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', minWidth: 0 }}>
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 12,
                      background: 'rgba(140,154,46,0.10)',
                      border: '1px solid rgba(140,154,46,0.20)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                      flexShrink: 0,
                    }}
                  >
                    {typeIcon(selectedWorkout.type)}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 15,
                        fontWeight: 700,
                        color: '#f0efe8',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {selectedWorkout.name}
                    </p>
                    <p style={{ margin: '3px 0 0', fontSize: 11, color: '#666' }}>
                      {selectedWorkout.date} &middot; {selectedWorkout.type} &middot; {selectedWorkout.source}
                    </p>
                  </div>
                </div>

                {/* Close */}
                <button
                  onClick={() => setSelectedWorkout(null)}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#999',
                    borderRadius: 8,
                    width: 30,
                    height: 30,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: 16,
                    flexShrink: 0,
                    lineHeight: 1,
                    transition: 'color 0.15s',
                  }}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              {/* Stat grid */}
              <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 10,
                  }}
                >
                  <StatCard label="Distance"   value={selectedWorkout.distance}  />
                  <StatCard label="Duration"   value={selectedWorkout.duration}  />
                  <StatCard label="Heart Rate" value={selectedWorkout.heartRate} />
                  <StatCard label="Calories"   value={`${selectedWorkout.calories} kcal`} />
                </div>

                {/* Strain */}
                {(() => {
                  const sc = strainColor(selectedWorkout.strain)
                  return (
                    <div
                      style={{
                        background: sc.bg,
                        border: `1px solid ${sc.text}33`,
                        borderRadius: 10,
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <p style={{ margin: 0, fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                          Strain Score
                        </p>
                        <p style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 800, color: sc.text }}>
                          {selectedWorkout.strain}
                          <span style={{ fontSize: 13, fontWeight: 400, color: '#666', marginLeft: 4 }}>/20</span>
                        </p>
                      </div>
                      <div
                        style={{
                          background: `${sc.text}22`,
                          color: sc.text,
                          borderRadius: 6,
                          padding: '4px 10px',
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {sc.label}
                      </div>
                    </div>
                  )
                })()}

                {/* Notes */}
                <div
                  style={{
                    background: '#111',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: 10,
                    padding: '14px 16px',
                  }}
                >
                  <p style={{ margin: '0 0 8px', fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    Notes
                  </p>
                  <p style={{ margin: 0, fontSize: 13, color: '#bbb', lineHeight: 1.6 }}>
                    {selectedWorkout.notes}
                  </p>
                </div>

                {/* HR Zone chart */}
                <div
                  style={{
                    background: '#111',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: 10,
                    padding: '14px 16px 10px',
                  }}
                >
                  <p style={{ margin: '0 0 14px', fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    HR Zone Distribution
                  </p>
                  <ResponsiveContainer width="100%" height={120}>
                    <BarChart data={hrZoneData} barSize={20}>
                      <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
                      <XAxis
                        dataKey="zone"
                        tick={{ fill: '#666', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis hide />
                      <Tooltip content={<HRTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                      <Bar
                        dataKey="minutes"
                        name="Minutes"
                        fill={OLIVE}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Small helpers ────────────────────────────────────────── */

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#d0cfc8' }}>{value}</p>
      <p style={{ margin: '1px 0 0', fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</p>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: '#080808',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 10,
        padding: '12px 14px',
      }}
    >
      <p style={{ margin: 0, fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
        {label}
      </p>
      <p style={{ margin: '5px 0 0', fontSize: 15, fontWeight: 700, color: '#e8e8e0' }}>
        {value}
      </p>
    </div>
  )
}
