'use client'

import { motion } from 'framer-motion'

const insights = [
  {
    type: 'warning',
    title: 'Sleep debt detected',
    body: "You've averaged 5.8 hours of sleep over the last 5 nights. This is reducing your recovery capacity. Aim for 7.5–9 hours to restore HRV and performance.",
    tag: 'Sleep',
    color: 'border-yellow-500/30 bg-yellow-500/5',
    tagColor: 'bg-yellow-500/10 text-yellow-400',
    icon: '⚠️',
  },
  {
    type: 'recommendation',
    title: 'Increase Zone 2 training',
    body: "Your last 4 weeks show 85% of workouts at high intensity. Adding 2 Zone 2 sessions per week (30–45 min easy cardio) will improve aerobic base and recovery.",
    tag: 'Training',
    color: 'border-blue-500/30 bg-blue-500/5',
    tagColor: 'bg-blue-500/10 text-blue-400',
    icon: '💡',
  },
  {
    type: 'achievement',
    title: 'New weekly distance PR',
    body: "You ran 42km this week — your highest weekly mileage ever. Your pace also improved by 8 seconds/km compared to your previous high volume week.",
    tag: 'Running',
    color: 'border-green-500/30 bg-green-500/5',
    tagColor: 'bg-green-500/10 text-green-400',
    icon: '🏆',
  },
  {
    type: 'recommendation',
    title: 'HRV trending down — take a rest day',
    body: "Your HRV has dropped 18% over 3 consecutive days. This is a strong signal of accumulated fatigue. Consider a full rest day or light mobility work today.",
    tag: 'Recovery',
    color: 'border-purple-500/30 bg-purple-500/5',
    tagColor: 'bg-purple-500/10 text-purple-400',
    icon: '💜',
  },
]

export default function InsightsPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold mb-2">AI Insights</h1>
        <p className="text-gray-400 text-sm">Personalized recommendations based on your health data</p>
      </motion.div>

      <div className="space-y-4">
        {insights.map((insight, i) => (
          <motion.div
            key={insight.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.01 }}
            className={`p-6 rounded-2xl border ${insight.color} transition-all cursor-pointer`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{insight.icon}</span>
                <h3 className="font-semibold text-white">{insight.title}</h3>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full ${insight.tagColor} font-medium`}>
                {insight.tag}
              </span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">{insight.body}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 p-4 rounded-xl border border-white/5 bg-white/[0.02] text-sm text-gray-400 text-center"
      >
        Insights update daily based on your latest data •{' '}
        <a href="/dashboard/chat" className="text-purple-400 hover:text-purple-300">Ask the AI anything</a>
      </motion.div>
    </div>
  )
}
