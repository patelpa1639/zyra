'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const OLIVE = '#8C9A2E'
const OLIVE_LIGHT = '#A8B840'
const WARM = '#C4A84F'
const TEAL = '#4A9B8E'

const stats = [
  { label: 'Recovery', value: '87', unit: '%', color: OLIVE, sub: '+12 from yesterday' },
  { label: 'HRV', value: '68', unit: 'ms', color: WARM, sub: '↑ trending up' },
  { label: 'Sleep Score', value: '91', unit: '', color: TEAL, sub: '7h 42m' },
  { label: 'Strain', value: '14.2', unit: '', color: OLIVE_LIGHT, sub: 'High effort' },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0906] text-white overflow-hidden">

      {/* Subtle warm grid */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(140,154,46,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(140,154,46,0.03)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

      {/* Glow orbs */}
      <div className="fixed top-[-200px] left-[20%] w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none" style={{ background: 'rgba(140,154,46,0.07)' }} />
      <div className="fixed top-[40%] right-[-100px] w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none" style={{ background: 'rgba(196,168,79,0.05)' }} />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-10 py-5 border-b border-white/[0.04]">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-black" style={{ background: `linear-gradient(135deg, ${OLIVE}, ${WARM})` }}>Z</div>
          <span className="text-lg font-semibold tracking-tight">Zyra</span>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="hidden md:flex items-center gap-8 text-sm text-gray-400">
          {['Features', 'Pricing', 'Teams', 'Blog'].map((item) => (
            <a key={item} href="#" className="hover:text-white transition-colors">{item}</a>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-2">Sign in</Link>
          <Link href="/signup" className="text-sm font-medium px-4 py-2 rounded-lg text-black transition-colors" style={{ background: `linear-gradient(135deg, ${OLIVE_LIGHT}, ${WARM})` }}>
            Get started
          </Link>
        </motion.div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs mb-8"
          style={{ borderColor: 'rgba(140,154,46,0.3)', background: 'rgba(140,154,46,0.08)', color: OLIVE_LIGHT }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: OLIVE_LIGHT }} />
          Now with AI game plans for teams
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-6xl md:text-8xl font-bold mb-6 tracking-tight leading-[1.05]"
        >
          Know your body.<br />
          <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(135deg, ${OLIVE_LIGHT}, ${WARM}, ${TEAL})` }}>
            Own your performance.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-gray-400 max-w-xl mb-10 leading-relaxed"
        >
          Zyra unifies your health data from Strava, Garmin, and Apple Health — then applies AI to surface insights you'd never find on your own.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex items-center gap-4 mb-20"
        >
          <Link href="/signup" className="px-6 py-3 font-semibold rounded-xl text-black text-sm transition-all hover:scale-105" style={{ background: `linear-gradient(135deg, ${OLIVE_LIGHT}, ${WARM})` }}>
            Start for free
          </Link>
          <Link href="/dashboard" className="px-6 py-3 border border-white/10 text-gray-300 font-medium rounded-xl hover:border-white/20 hover:text-white transition-all text-sm">
            View live demo →
          </Link>
        </motion.div>

        {/* Stats preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="w-full max-w-3xl rounded-2xl border border-white/[0.06] p-6 shadow-2xl"
          style={{ background: '#0f0e0b' }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Today's Overview</p>
              <p className="text-sm text-gray-300">Wednesday, March 4</p>
            </div>
            <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border" style={{ color: OLIVE_LIGHT, background: 'rgba(140,154,46,0.08)', borderColor: 'rgba(140,154,46,0.2)' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: OLIVE_LIGHT }} />
              Live syncing
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                className="rounded-xl p-4 border border-white/[0.04]"
                style={{ background: '#141210' }}
              >
                <p className="text-xs text-gray-500 mb-2">{stat.label}</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</span>
                  {stat.unit && <span className="text-sm text-gray-400">{stat.unit}</span>}
                </div>
                <p className="text-xs text-gray-500">{stat.sub}</p>
                <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(parseFloat(stat.value), 100)}%` }}
                    transition={{ delay: 0.6 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: stat.color }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Integrations */}
      <section className="relative z-10 border-t border-white/[0.04] py-10">
        <p className="text-center text-xs text-gray-600 uppercase tracking-widest mb-6">Connects with</p>
        <div className="flex items-center justify-center gap-10 flex-wrap px-8">
          {['Strava', 'Garmin', 'Apple Health', 'Whoop', 'Oura Ring'].map((name, i) => (
            <motion.span key={name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.05 }}
              className="text-gray-500 font-medium hover:text-gray-300 transition-colors cursor-default text-sm">
              {name}
            </motion.span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-8 py-24 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 tracking-tight">Everything your performance demands</h2>
          <p className="text-gray-400 max-w-lg mx-auto">Built for athletes who take recovery as seriously as training.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: '⚡', title: 'Unified data', desc: 'All your fitness platforms in one place. No switching tabs.' },
            { icon: '🧠', title: 'AI insights', desc: 'Claude-powered analysis of your trends, anomalies, and patterns.' },
            { icon: '📈', title: 'Deep charts', desc: 'HRV trends, sleep stages, heart rate zones — visualized beautifully.' },
            { icon: '💬', title: 'Health chat', desc: 'Ask your AI anything. "Am I overtraining?" gets a real answer.' },
            { icon: '🏆', title: 'Team game plans', desc: 'Feed opponent data and video. Get an AI fitness prep plan.' },
            { icon: '🔄', title: 'Auto sync', desc: 'Data updates in the background. Always fresh when you open it.' },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -4 }}
              className="p-6 rounded-2xl border border-white/[0.05] hover:border-white/10 transition-all"
              style={{ background: '#0f0e0b' }}
            >
              <div className="text-2xl mb-4">{f.icon}</div>
              <h3 className="font-semibold mb-2 text-sm">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 text-center px-8 py-24 border-t border-white/[0.04]">
        <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-4xl font-bold mb-4 tracking-tight">
          Ready to train smarter?
        </motion.h2>
        <p className="text-gray-400 mb-8">Free forever. No credit card required.</p>
        <Link href="/signup" className="inline-block px-8 py-4 font-semibold rounded-xl text-black transition-all hover:scale-105" style={{ background: `linear-gradient(135deg, ${OLIVE_LIGHT}, ${WARM})` }}>
          Create your account
        </Link>
      </section>
    </main>
  )
}
