'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
  { href: '/dashboard', icon: '◎', label: 'Overview' },
  { href: '/dashboard/workouts', icon: '⚡', label: 'Activity' },
  { href: '/dashboard/insights', icon: '🧠', label: 'Insights' },
  { href: '/dashboard/chat', icon: '💬', label: 'AI Chat' },
  { href: '/dashboard/connect', icon: '🔗', label: 'Connect' },
  { href: '/dashboard/team', icon: '🏆', label: 'Team', pro: true },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-[#080808] text-white">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-56 border-r border-white/[0.04] flex flex-col py-5 px-3 fixed h-full bg-[#080808]"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 px-2 mb-8">
          <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-black" style={{ background: 'linear-gradient(135deg, #A8B840, #C4A84F)' }}>Z</div>
          <span className="font-semibold tracking-tight">Zyra</span>
        </Link>

        <nav className="flex flex-col gap-0.5 flex-1">
          {nav.map((item) => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                    active
                      ? 'text-white'
                      : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]'
                  }`}
                  style={active ? { background: 'rgba(140,154,46,0.12)', borderLeft: '2px solid #8C9A2E' } : {}}
                >
                  <span className="text-base w-5 text-center">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.pro && (
                    <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-md bg-purple-500/15 text-purple-400 border border-purple-500/20">
                      Pro
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="border-t border-white/[0.04] pt-4 px-2">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium truncate">Pranav</p>
              <p className="text-[11px] text-gray-600">Free plan</p>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main */}
      <main className="ml-56 flex-1 p-7 min-h-screen">
        {children}
      </main>
    </div>
  )
}
