'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
  { href: '/dashboard', icon: '◎', label: 'Overview' },
  { href: '/dashboard/workouts', icon: '⚡', label: 'Workouts' },
  { href: '/dashboard/insights', icon: '🧠', label: 'AI Insights' },
  { href: '/dashboard/chat', icon: '💬', label: 'Chat' },
  { href: '/dashboard/connect', icon: '🔗', label: 'Connect' },
  { href: '/dashboard/team', icon: '🏆', label: 'Team', pro: true },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-white">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-60 border-r border-white/5 flex flex-col py-6 px-4 fixed h-full"
      >
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-8 px-2">
          Zyra
        </Link>

        <nav className="flex flex-col gap-1 flex-1">
          {nav.map((item) => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    active
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.pro && (
                    <span className="ml-auto text-xs px-1.5 py-0.5 rounded bg-purple-600/30 text-purple-300 border border-purple-500/20">
                      Pro
                    </span>
                  )}
                </motion.div>
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="border-t border-white/5 pt-4 px-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500" />
            <div>
              <p className="text-sm font-medium">Pranav</p>
              <p className="text-xs text-gray-500">Free plan</p>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <main className="ml-60 flex-1 p-8">
        {children}
      </main>
    </div>
  )
}
