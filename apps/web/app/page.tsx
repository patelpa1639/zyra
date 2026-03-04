'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const features = [
  { icon: '⚡', title: 'Real-time Sync', desc: 'Connect Strava, Garmin, Apple Health and see all your data in one place.' },
  { icon: '🧠', title: 'AI Insights', desc: 'Get personalized recommendations powered by Claude AI based on your health data.' },
  { icon: '📊', title: 'Deep Analytics', desc: 'Visualize trends in sleep, HRV, heart rate, workouts, and more.' },
  { icon: '🏆', title: 'Team Game Plans', desc: 'Pro teams can ingest opponent data and video to generate AI-powered fitness prep plans.' },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden relative">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-white/5">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
        >
          Zyra
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex gap-4"
        >
          <Link href="/login" className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
            Sign in
          </Link>
          <Link href="/signup" className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors">
            Get started
          </Link>
        </motion.div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-24 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          AI-powered health intelligence
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-6xl md:text-7xl font-bold mb-6 leading-tight"
        >
          Your health data,{' '}
          <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 bg-clip-text text-transparent">
            finally unified
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xl text-gray-400 max-w-2xl mb-10"
        >
          Connect Strava, Garmin, and Apple Health. Get AI insights, personalized recommendations,
          and for teams — a complete fitness game plan built from your data.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex gap-4"
        >
          <Link
            href="/signup"
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl font-semibold text-lg transition-all hover:scale-105"
          >
            Start for free
          </Link>
          <Link
            href="/dashboard"
            className="px-8 py-4 border border-white/10 hover:border-white/20 rounded-xl font-semibold text-lg text-gray-300 hover:text-white transition-all"
          >
            View demo
          </Link>
        </motion.div>

        {/* Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Features */}
      <section className="px-8 pb-32 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.03 }}
              className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Integrations */}
      <section className="px-8 pb-32 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-gray-500 text-sm mb-6 uppercase tracking-widest"
        >
          Connects with
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-8 flex-wrap"
        >
          {['Strava', 'Garmin', 'Apple Health', 'Whoop', 'Oura'].map((name) => (
            <span key={name} className="text-gray-400 font-medium text-lg hover:text-white transition-colors cursor-default">
              {name}
            </span>
          ))}
        </motion.div>
      </section>
    </main>
  )
}
