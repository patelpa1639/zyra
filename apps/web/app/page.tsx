'use client'

import { motion, AnimatePresence, useInView } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'

const OLIVE = '#8C9A2E'
const OLIVE_LIGHT = '#A8B840'
const WARM = '#C4A84F'
const TEAL = '#4A9B8E'

// ─── Sparkline ───────────────────────────────────────────────────────────────
function Sparkline({ data, color, height = 40 }: { data: number[], color: string, height?: number }) {
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1
  const w = 120, h = height
  const pts = (d: number[]) => d.map((v, i) => `${(i / (d.length - 1)) * w},${h - ((v - min) / range) * (h - 8) - 4}`)
  const area = `M ${pts(data).join(' L ')} L ${w},${h} L 0,${h} Z`
  const id = `g${color.replace('#', '')}`
  return (
    <svg width={w} height={h} className="overflow-visible">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" /><stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <polyline points={pts(data).join(' ')} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Dashboard Preview ────────────────────────────────────────────────────────
function DashboardPreview() {
  const cards = [
    { label: 'Recovery', value: '87%', color: OLIVE, data: [72, 78, 85, 80, 75, 82, 87] },
    { label: 'HRV', value: '68ms', color: WARM, data: [62, 65, 68, 64, 59, 63, 68] },
    { label: 'Sleep', value: '91', color: TEAL, data: [78, 82, 88, 85, 79, 87, 91] },
    { label: 'Strain', value: '14.2', color: OLIVE_LIGHT, data: [8, 12, 14, 11, 9, 13, 14] },
  ]
  return (
    <div className="rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl" style={{ background: '#080808' }}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.05]" style={{ background: '#0c0c0c' }}>
        <div className="w-3 h-3 rounded-full bg-red-500/50" /><div className="w-3 h-3 rounded-full bg-yellow-500/50" /><div className="w-3 h-3 rounded-full bg-green-500/50" />
        <div className="ml-3 px-3 py-1 rounded text-[10px] text-gray-600 border border-white/[0.04]" style={{ background: '#141414' }}>app.zyra.ai/dashboard</div>
      </div>
      <div className="flex h-[380px]">
        <div className="w-40 border-r border-white/[0.04] py-4 px-2 flex-shrink-0">
          <div className="flex items-center gap-2 px-2 mb-5">
            <div className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold text-black" style={{ background: `linear-gradient(135deg, ${OLIVE}, ${WARM})` }}>Z</div>
            <span className="text-xs font-semibold">Zyra</span>
          </div>
          {[{ l: 'Overview', a: true }, { l: 'Activity' }, { l: 'Insights' }, { l: 'AI Chat' }, { l: 'Connect' }].map(item => (
            <div key={item.l} className={`flex items-center gap-2 px-2 py-2 rounded-lg mb-0.5 text-[10px] ${item.a ? 'text-white' : 'text-gray-600'}`}
              style={item.a ? { background: 'rgba(140,154,46,0.12)', borderLeft: '2px solid #8C9A2E' } : {}}>{item.l}</div>
          ))}
        </div>
        <div className="flex-1 p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[9px] text-gray-600 uppercase tracking-widest">Wednesday, March 4</p>
              <p className="text-sm font-semibold">Good morning, Pranav</p>
            </div>
            <div className="flex items-center gap-1 text-[9px] px-2 py-1 rounded-full border" style={{ color: OLIVE_LIGHT, background: 'rgba(140,154,46,0.08)', borderColor: 'rgba(140,154,46,0.2)' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: OLIVE_LIGHT }} />Synced
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {cards.map(c => (
              <div key={c.label} className="rounded-xl p-2.5 border border-white/[0.04]" style={{ background: '#111' }}>
                <p className="text-[8px] text-gray-600 mb-1">{c.label}</p>
                <p className="text-sm font-bold mb-1" style={{ color: c.color }}>{c.value}</p>
                <Sparkline data={c.data} color={c.color} height={24} />
              </div>
            ))}
          </div>
          <div className="rounded-xl p-3 border mb-3" style={{ background: 'rgba(140,154,46,0.05)', borderColor: 'rgba(140,154,46,0.15)' }}>
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 rounded flex-shrink-0 flex items-center justify-center text-[7px] font-bold text-black mt-0.5" style={{ background: `linear-gradient(135deg, ${OLIVE}, ${WARM})` }}>Z</div>
              <p className="text-[10px] text-gray-400 leading-relaxed">HRV trending up after 3 days of Zone 2 work. Perfect time for a threshold session tomorrow.</p>
            </div>
          </div>
          <div className="space-y-1.5">
            {[{ n: 'Morning Run', t: '42min · 8.4km', hr: '148bpm' }, { n: 'Strength — Upper', t: '55min', hr: '132bpm' }].map(w => (
              <div key={w.n} className="flex items-center justify-between px-2.5 py-2 rounded-lg border border-white/[0.03]" style={{ background: '#111' }}>
                <p className="text-[10px] font-medium">{w.n}</p>
                <div className="flex gap-3 text-[9px] text-gray-600"><span>{w.t}</span><span style={{ color: WARM }}>{w.hr}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Integration Hub ──────────────────────────────────────────────────────────
const integrations = [
  { name: 'Strava',        icon: '🏃', color: '#FC4C02', angle: -90  },
  { name: 'Garmin',        icon: '⌚', color: '#00A0D2', angle: -30  },
  { name: 'Apple Health',  icon: '❤️', color: '#FF375F', angle:  30  },
  { name: 'Whoop',         icon: '💪', color: OLIVE_LIGHT, angle: 90  },
  { name: 'Oura Ring',     icon: '💍', color: WARM,     angle: 150  },
  { name: 'Google Fit',    icon: '📊', color: TEAL,     angle: 210  },
]

function IntegrationHub() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const cx = 300, cy = 240, r = 170

  return (
    <div ref={ref} className="relative flex items-center justify-center">
      <svg viewBox="0 0 600 480" className="w-full max-w-2xl" style={{ overflow: 'visible' }}>
        <defs>
          {/* Radial glow for center */}
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={OLIVE} stopOpacity="0.35" />
            <stop offset="100%" stopColor={OLIVE} stopOpacity="0" />
          </radialGradient>
          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {integrations.map(({ name, color }) => (
            <radialGradient key={name} id={`ng-${name.replace(/\s/g,'')}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={color} stopOpacity="0.2" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </radialGradient>
          ))}
        </defs>

        {/* Outer orbit ring */}
        <motion.circle
          cx={cx} cy={cy} r={r + 8}
          fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1 }}
        />
        <motion.circle
          cx={cx} cy={cy} r={r - 8}
          fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" strokeDasharray="4 8"
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1, rotate: 360 } : {}}
          transition={{ opacity: { duration: 1 }, rotate: { duration: 40, repeat: Infinity, ease: 'linear' } }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />

        {integrations.map(({ name, icon, color, angle }, i) => {
          const rad = (angle * Math.PI) / 180
          const nx = cx + r * Math.cos(rad)
          const ny = cy + r * Math.sin(rad)
          // Control point for slight curve
          const mx = (cx + nx) / 2 + (cy - ny) * 0.08
          const my = (cy + ny) / 2 + (nx - cx) * 0.08
          const pathD = `M ${nx} ${ny} Q ${mx} ${my} ${cx} ${cy}`

          return (
            <g key={name}>
              {/* Connecting line */}
              <motion.path
                d={pathD}
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeOpacity="0.25"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={inView ? { pathLength: 1, opacity: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
              />
              {/* Traveling dot along path */}
              {inView && (
                <motion.circle
                  r="3" fill={color} filter="url(#glow)"
                  initial={{ offsetDistance: '0%', opacity: 0 }}
                  animate={{ offsetDistance: '100%', opacity: [0, 1, 1, 0] }}
                  transition={{ duration: 1.8, delay: 1 + i * 0.3, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
                  style={{ offsetPath: `path('${pathD}')` } as React.CSSProperties}
                />
              )}
              {/* Arrow head near center */}
              <motion.circle
                cx={cx + (nx - cx) * 0.18}
                cy={cy + (ny - cy) * 0.18}
                r="2"
                fill={color}
                fillOpacity="0.6"
                initial={{ scale: 0, opacity: 0 }}
                animate={inView ? { scale: 1, opacity: 0.6 } : {}}
                transition={{ duration: 0.4, delay: 1.1 + i * 0.1 }}
              />

              {/* Node glow */}
              <motion.circle cx={nx} cy={ny} r="32"
                fill={`url(#ng-${name.replace(/\s/g,'')})`}
                initial={{ scale: 0, opacity: 0 }}
                animate={inView ? { scale: 1, opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
              />
              {/* Node circle */}
              <motion.circle cx={nx} cy={ny} r="24"
                fill="#111" stroke={color} strokeWidth="1.5" strokeOpacity="0.4"
                initial={{ scale: 0, opacity: 0 }}
                animate={inView ? { scale: 1, opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1, type: 'spring', stiffness: 200 }}
              />
              {/* Node icon */}
              <motion.text x={nx} y={ny + 6} textAnchor="middle" fontSize="16"
                initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: 0.5 + i * 0.1 }}
              >{icon}</motion.text>
              {/* Node label */}
              <motion.text x={nx} y={ny + (angle > 60 && angle < 240 ? 44 : -32)} textAnchor="middle"
                fill="rgba(255,255,255,0.45)" fontSize="10" fontFamily="system-ui, sans-serif" fontWeight="500"
                initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: 0.6 + i * 0.1 }}
              >{name}</motion.text>
            </g>
          )
        })}

        {/* Center glow pulse */}
        <motion.circle cx={cx} cy={cy} r="70"
          fill="url(#centerGlow)"
          animate={inView ? { scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />
        {/* Center ring */}
        <motion.circle cx={cx} cy={cy} r="44"
          fill="#0a0906" stroke={OLIVE} strokeWidth="1.5" strokeOpacity="0.5"
          initial={{ scale: 0 }} animate={inView ? { scale: 1 } : {}}
          transition={{ duration: 0.6, type: 'spring', stiffness: 150, delay: 0.1 }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />
        {/* Center inner circle */}
        <motion.circle cx={cx} cy={cy} r="36"
          fill="#111"
          initial={{ scale: 0 }} animate={inView ? { scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />
        {/* Center Z */}
        <motion.text x={cx} y={cy + 10} textAnchor="middle"
          fill="transparent"
          fontSize="28" fontFamily="system-ui, sans-serif" fontWeight="800"
          initial={{ opacity: 0, scale: 0.5 }} animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.6, duration: 0.4 }}
          style={{ transformOrigin: `${cx}px ${cy}px`, fill: `url(#cg)` }}
        >
          {/* Gradient fill for Z */}
        </motion.text>
        <defs>
          <linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={OLIVE_LIGHT} /><stop offset="100%" stopColor={WARM} />
          </linearGradient>
        </defs>
        <motion.text x={cx} y={cy + 10} textAnchor="middle"
          fill="url(#cg)"
          fontSize="28" fontFamily="system-ui, sans-serif" fontWeight="800"
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
        >Z</motion.text>
        <motion.text x={cx} y={cy + 26} textAnchor="middle"
          fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="system-ui, sans-serif" letterSpacing="2"
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
        >ZYRA</motion.text>
      </svg>
    </div>
  )
}

// ─── AI Chat Demo ─────────────────────────────────────────────────────────────
const chatMessages = [
  { role: 'user', text: 'Why is my HRV lower this week?' },
  { role: 'ai', text: "Your HRV dropped 18% — likely Tuesday's HIIT session combined with only 6.2h sleep two nights running. Your body is signaling it needs more recovery.", tags: [
    { label: 'Training Load', value: 'High', color: '#E85D4A' },
    { label: 'Sleep Debt', value: '1.6h', color: WARM },
    { label: 'Recommendation', value: 'Active Recovery', color: OLIVE_LIGHT },
  ]},
  { role: 'user', text: 'Should I train hard today?' },
  { role: 'ai', text: "Not hard. Recovery at 87% — Zone 2 cardio only. 45 min easy ride max. Push harder and you risk digging a hole for the whole week.", tags: [
    { label: 'Recovery', value: '87%', color: OLIVE },
    { label: 'Ideal Strain', value: '8–11', color: TEAL },
  ]},
]

function AIChatDemo() {
  const [visible, setVisible] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  useEffect(() => {
    if (!inView) return
    let i = 0
    const tick = () => { i++; setVisible(i); if (i < chatMessages.length) setTimeout(tick, 950) }
    setTimeout(tick, 500)
  }, [inView])

  return (
    <div ref={ref} className="space-y-3 max-w-lg w-full">
      <AnimatePresence>
        {chatMessages.slice(0, visible).map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'ai' && (
              <div className="w-6 h-6 rounded-lg mr-2 mt-1 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-black"
                style={{ background: `linear-gradient(135deg, ${OLIVE}, ${WARM})` }}>Z</div>
            )}
            <div className="max-w-[85%]">
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'rounded-br-sm' : 'border border-white/[0.06] text-gray-200 rounded-bl-sm'}`}
                style={msg.role === 'user'
                  ? { background: `linear-gradient(135deg, ${OLIVE}, ${WARM})`, color: '#000' }
                  : { background: '#141210' }}>
                {msg.text}
              </div>
              {msg.role === 'ai' && msg.tags && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {msg.tags.map(t => (
                    <div key={t.label} className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-white/[0.05] text-[10px]" style={{ background: '#141210' }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: t.color }} />
                      <span className="text-gray-500">{t.label}:</span>
                      <span className="font-medium" style={{ color: t.color }}>{t.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      {visible > 0 && visible < chatMessages.length && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1 pl-8">
          {[0, 1, 2].map(i => (
            <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.1, delay: i * 0.2 }}
              className="w-1.5 h-1.5 rounded-full" style={{ background: OLIVE_LIGHT }} />
          ))}
        </motion.div>
      )}
    </div>
  )
}

// ─── Waitlist Form ────────────────────────────────────────────────────────────
function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || status === 'loading') return
    setStatus('loading')
    try {
      const res = await fetch('/api/waitlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
      const data = await res.json()
      if (res.ok) { setStatus('success'); setMessage(data.message || "You're on the list!"); setEmail('') }
      else { setStatus('error'); setMessage(data.error || 'Something went wrong') }
    } catch { setStatus('error'); setMessage('Something went wrong. Try again.') }
  }

  return (
    <form onSubmit={submit} className="w-full max-w-md">
      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div key="ok" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 px-5 py-4 rounded-2xl border text-sm font-medium"
            style={{ background: 'rgba(140,154,46,0.1)', borderColor: 'rgba(140,154,46,0.3)', color: OLIVE_LIGHT }}>
            <span>✓</span><span>{message} We'll email you when we launch.</span>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 border border-white/[0.08] focus:outline-none focus:border-white/20 transition-colors"
              style={{ background: '#111' }} />
            <button type="submit" disabled={status === 'loading' || !email.trim()}
              className="px-5 py-3 rounded-xl text-sm font-semibold text-black transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              style={{ background: `linear-gradient(135deg, ${OLIVE_LIGHT}, ${WARM})` }}>
              {status === 'loading' ? <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin block" /> : 'Notify me'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {status === 'error' && <p className="text-xs text-red-400 mt-2 ml-1">{message}</p>}
    </form>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0906] text-white overflow-hidden">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(140,154,46,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(140,154,46,0.03)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />
      <div className="fixed top-[-200px] left-[20%] w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none" style={{ background: 'rgba(140,154,46,0.07)' }} />
      <div className="fixed top-[40%] right-[-100px] w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none" style={{ background: 'rgba(196,168,79,0.05)' }} />
      <div className="fixed top-[70%] left-[-50px] w-[300px] h-[300px] rounded-full blur-[80px] pointer-events-none" style={{ background: 'rgba(74,155,142,0.04)' }} />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-10 py-5 border-b border-white/[0.04]">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-black" style={{ background: `linear-gradient(135deg, ${OLIVE}, ${WARM})` }}>Z</div>
          <span className="text-lg font-semibold tracking-tight">Zyra</span>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="text-xs px-3 py-1.5 rounded-full border"
          style={{ borderColor: 'rgba(140,154,46,0.3)', background: 'rgba(140,154,46,0.08)', color: OLIVE_LIGHT }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block mr-2 align-middle" style={{ background: OLIVE_LIGHT }} />
          Coming soon
        </motion.div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs mb-8"
          style={{ borderColor: 'rgba(196,168,79,0.3)', background: 'rgba(196,168,79,0.08)', color: WARM }}>
          🏋️ Built for serious athletes
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="text-6xl md:text-8xl font-bold mb-6 tracking-tight leading-[1.05]">
          Know your body.<br />
          <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(135deg, ${OLIVE_LIGHT}, ${WARM}, ${TEAL})` }}>
            Own your performance.
          </span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="text-lg text-gray-400 max-w-xl mb-10 leading-relaxed">
          Zyra unifies your health data from Strava, Garmin, and Apple Health — then applies AI to surface insights you'd never find on your own.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="flex flex-col items-center gap-3 mb-4 w-full max-w-md">
          <WaitlistForm />
          <p className="text-xs text-gray-600">No spam. First access when we launch.</p>
        </motion.div>

        {/* Dashboard preview */}
        <motion.div initial={{ opacity: 0, y: 40, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.35, duration: 0.7, ease: 'easeOut' }}
          className="w-full max-w-4xl relative mt-12">
          <div className="absolute inset-x-0 -bottom-8 h-32 blur-3xl opacity-25 pointer-events-none rounded-full"
            style={{ background: `linear-gradient(to right, ${OLIVE}, ${WARM})` }} />
          <DashboardPreview />
          <div className="absolute inset-x-0 bottom-0 h-24 pointer-events-none rounded-b-2xl"
            style={{ background: 'linear-gradient(to bottom, transparent, #0a0906)' }} />
        </motion.div>
      </section>

      {/* Integration Hub */}
      <section className="relative z-10 border-t border-white/[0.04] py-24 px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs mb-6"
              style={{ borderColor: 'rgba(74,155,142,0.3)', background: 'rgba(74,155,142,0.08)', color: TEAL }}>
              🔗 All your data, one place
            </div>
            <h2 className="text-4xl font-bold tracking-tight mb-4">Everything flows into Zyra</h2>
            <p className="text-gray-400 max-w-md mx-auto">Connect once. Zyra pulls your data automatically — workouts, sleep, HRV, recovery — from every platform you already use.</p>
          </motion.div>
          <IntegrationHub />
        </div>
      </section>

      {/* AI Chat Demo */}
      <section className="relative z-10 border-t border-white/[0.04] py-24 px-8">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs mb-6"
              style={{ borderColor: 'rgba(196,168,79,0.3)', background: 'rgba(196,168,79,0.08)', color: WARM }}>
              💬 AI that actually gets it
            </div>
            <h2 className="text-4xl font-bold mb-4 tracking-tight leading-tight">
              Ask anything.<br />
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(135deg, ${WARM}, ${OLIVE_LIGHT})` }}>Get real answers.</span>
            </h2>
            <p className="text-gray-400 leading-relaxed mb-6">
              Zyra's AI knows your full training history. Ask about recovery, overtraining, injury risk, race prep — and get specific, data-backed answers.
            </p>
            <div className="flex flex-col gap-3">
              {['"Am I overtraining this month?"', '"When should I peak for my marathon?"', '"Why did my sleep score drop?"'].map(q => (
                <div key={q} className="flex items-center gap-2 text-sm text-gray-500">
                  <span style={{ color: OLIVE_LIGHT }}>→</span><span>{q}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
            className="rounded-2xl border border-white/[0.06] p-5" style={{ background: '#0f0e0b' }}>
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/[0.05]">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-black"
                style={{ background: `linear-gradient(135deg, ${OLIVE}, ${WARM})` }}>Z</div>
              <span className="text-sm font-medium">Zyra AI</span>
              <div className="ml-auto flex items-center gap-1.5 text-xs" style={{ color: OLIVE_LIGHT }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: OLIVE_LIGHT }} />Online
              </div>
            </div>
            <AIChatDemo />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 border-t border-white/[0.04] px-8 py-24 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 tracking-tight">What's coming</h2>
          <p className="text-gray-400 max-w-lg mx-auto">Built for athletes who take recovery as seriously as training.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: '⚡', title: 'Unified data', desc: 'All your fitness platforms in one place. No switching tabs.', color: OLIVE_LIGHT },
            { icon: '🧠', title: 'AI insights', desc: 'Claude-powered analysis of your trends, anomalies, and patterns.', color: WARM },
            { icon: '📈', title: 'Deep charts', desc: 'HRV trends, sleep stages, heart rate zones — visualized beautifully.', color: TEAL },
            { icon: '💬', title: 'Health chat', desc: 'Ask your AI anything. "Am I overtraining?" gets a real answer.', color: OLIVE },
            { icon: '🏆', title: 'Team game plans', desc: 'Feed opponent data and video. Get an AI fitness prep plan.', color: WARM },
            { icon: '🔄', title: 'Auto sync', desc: 'Data updates in the background. Always fresh when you open it.', color: OLIVE_LIGHT },
          ].map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }} whileHover={{ y: -4 }}
              className="p-6 rounded-2xl border border-white/[0.05] hover:border-white/[0.08] transition-all"
              style={{ background: '#0f0e0b' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4"
                style={{ background: `${f.color}15`, border: `1px solid ${f.color}20` }}>{f.icon}</div>
              <h3 className="font-semibold mb-2 text-sm">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 border-t border-white/[0.04] py-28 px-8 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }} className="max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-8 flex items-center justify-center text-2xl font-bold text-black"
            style={{ background: `linear-gradient(135deg, ${OLIVE}, ${WARM})` }}>Z</div>
          <h2 className="text-4xl font-bold mb-4 tracking-tight">
            Be first in line.<br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(135deg, ${OLIVE_LIGHT}, ${WARM})` }}>Launch is soon.</span>
          </h2>
          <p className="text-gray-400 mb-10 text-lg">Join the waitlist and get early access when we open the doors.</p>
          <div className="flex justify-center"><WaitlistForm /></div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-8 px-10 flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold text-black"
            style={{ background: `linear-gradient(135deg, ${OLIVE}, ${WARM})` }}>Z</div>
          <span>Zyra © 2025</span>
        </div>
        <div className="flex gap-6">
          <a href="/privacy" className="hover:text-gray-400 transition-colors">Privacy</a>
          <a href="mailto:contact-us@joinzyra.com" className="hover:text-gray-400 transition-colors">Contact</a>
        </div>
      </footer>
    </main>
  )
}
