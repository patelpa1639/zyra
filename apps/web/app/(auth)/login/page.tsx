'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { motion } from 'framer-motion'

const OLIVE = '#8C9A2E'
const OLIVE_LIGHT = '#A8B840'
const WARM = '#C4A84F'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email || !password) { setError('Email and password are required'); return }
    setLoading(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) { setError(signInError.message); setLoading(false); return }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#0a0906] text-white flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(140,154,46,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(140,154,46,0.03)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />
      <div className="fixed top-[-200px] left-[20%] w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none" style={{ background: 'rgba(140,154,46,0.06)' }} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="relative w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-black" style={{ background: `linear-gradient(135deg, ${OLIVE}, ${WARM})` }}>Z</div>
          <span className="text-lg font-semibold tracking-tight">Zyra</span>
        </Link>

        <div className="rounded-2xl border border-white/[0.06] p-8" style={{ background: '#0f0e0b' }}>
          <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
          <p className="text-gray-500 text-sm mb-8">Sign in to your Zyra account</p>

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl text-sm border border-red-500/20 text-red-400"
              style={{ background: 'rgba(239,68,68,0.06)' }}>{error}</motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@email.com" disabled={loading}
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 border border-white/[0.06] bg-white/[0.03] focus:outline-none focus:border-white/20 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" disabled={loading}
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 border border-white/[0.06] bg-white/[0.03] focus:outline-none focus:border-white/20 transition-colors" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-black transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              style={{ background: `linear-gradient(135deg, ${OLIVE_LIGHT}, ${WARM})` }}>
              {loading
                ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />Signing in...</span>
                : 'Sign in'}
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-6 p-3 rounded-xl border border-white/[0.04] text-xs text-gray-600" style={{ background: 'rgba(255,255,255,0.02)' }}>
            Demo account: <span className="text-gray-400">demo@zyra.ai</span> / <span className="text-gray-400">Demo1234!</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
