'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

const integrations = [
  {
    id: 'strava',
    name: 'Strava',
    desc: 'Sync runs, rides, swims and all activities',
    color: 'from-orange-500 to-red-500',
    icon: '🚴',
    available: true,
  },
  {
    id: 'garmin',
    name: 'Garmin',
    desc: 'Sync sleep, HRV, heart rate and fitness metrics',
    color: 'from-blue-500 to-cyan-500',
    icon: '⌚',
    available: true,
  },
  {
    id: 'apple_health',
    name: 'Apple Health',
    desc: 'Sync steps, workouts, vitals from your iPhone',
    color: 'from-gray-400 to-gray-600',
    icon: '🍎',
    available: true,
  },
  {
    id: 'whoop',
    name: 'Whoop',
    desc: 'Sync strain, recovery and sleep performance',
    color: 'from-green-500 to-emerald-500',
    icon: '💪',
    available: false,
  },
  {
    id: 'oura',
    name: 'Oura Ring',
    desc: 'Sync readiness, sleep stages and activity',
    color: 'from-purple-500 to-violet-500',
    icon: '💍',
    available: false,
  },
]

export default function ConnectPage() {
  const [connected, setConnected] = useState<string[]>([])
  const [connecting, setConnecting] = useState<string | null>(null)

  const handleConnect = async (id: string) => {
    if (connected.includes(id)) return
    setConnecting(id)
    await new Promise((r) => setTimeout(r, 1500))
    setConnected((c) => [...c, id])
    setConnecting(null)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Connect your devices</h1>
        <p className="text-gray-400 text-sm">Link your fitness apps and devices to start getting AI insights</p>
      </motion.div>

      <div className="space-y-4">
        {integrations.map((integration, i) => {
          const isConnected = connected.includes(integration.id)
          const isConnecting = connecting === integration.id

          return (
            <motion.div
              key={integration.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`flex items-center justify-between p-5 rounded-2xl border transition-colors ${
                isConnected
                  ? 'border-green-500/30 bg-green-500/5'
                  : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${integration.color} flex items-center justify-center text-2xl`}>
                  {integration.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{integration.name}</p>
                    {!integration.available && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-500 border border-white/10">
                        Coming soon
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">{integration.desc}</p>
                </div>
              </div>

              <button
                onClick={() => integration.available && handleConnect(integration.id)}
                disabled={!integration.available || isConnected || isConnecting}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isConnected
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : isConnecting
                    ? 'bg-white/5 text-gray-400 cursor-wait'
                    : integration.available
                    ? 'bg-purple-600 hover:bg-purple-500 text-white'
                    : 'bg-white/5 text-gray-600 cursor-not-allowed'
                }`}
              >
                {isConnected ? '✓ Connected' : isConnecting ? 'Connecting...' : 'Connect'}
              </button>
            </motion.div>
          )
        })}
      </div>

      {connected.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 text-sm text-purple-300"
        >
          🎉 {connected.length} integration{connected.length > 1 ? 's' : ''} connected! Head to your dashboard to see your data.
        </motion.div>
      )}
    </div>
  )
}
