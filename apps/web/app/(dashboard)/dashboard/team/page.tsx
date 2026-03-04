'use client'

import { motion } from 'framer-motion'

export default function TeamPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold mb-2">Team (coming soon)</h1>
        <p className="text-gray-400 text-sm">
          You&apos;ll be able to create teams, invite athletes, and share game plans here.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] text-sm text-gray-300"
      >
        For now, you can explore your own data in the overview, activity, insights, and AI chat
        tabs. Team dashboards and shared AI game plans are on the roadmap.
      </motion.div>
    </div>
  )
}

