'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@supabase/supabase-js'

const OLIVE = '#8C9A2E'
const OLIVE_LIGHT = '#A8B840'
const WARM = '#C4A84F'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const suggestions = [
  'How was my sleep this week?',
  'Am I overtraining?',
  'What should I focus on to improve my HRV?',
  'Give me a recovery plan for this week',
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: "Hey! I'm your Zyra AI. I have access to your health data from Strava, Garmin, and Apple Health. Ask me anything about your fitness, recovery, or what to focus on next.",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { data } = await supabase.auth.getUser()
      if (!cancelled) {
        setUserId(data.user?.id ?? null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const send = async (text: string) => {
    if (!text.trim() || loading) return

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text }
    setMessages(m => [...m, userMsg])
    setInput('')
    setLoading(true)

    // Placeholder for streaming response
    const assistantId = Date.now().toString() + '-ai'
    setMessages(m => [...m, { id: assistantId, role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          userId,
        }),
      })

      if (!res.ok) throw new Error('API error')

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const parsed = JSON.parse(line.slice(6))
                if (parsed.text) {
                  accumulated += parsed.text
                  setMessages(m => m.map(msg =>
                    msg.id === assistantId ? { ...msg, content: accumulated } : msg
                  ))
                }
              } catch {}
            }
          }
        }
      }
    } catch {
      setMessages(m => m.map(msg =>
        msg.id === assistantId
          ? { ...msg, content: 'Sorry, something went wrong. Make sure your ANTHROPIC_API_KEY is set in .env.local.' }
          : msg
      ))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold">AI Health Chat</h1>
        <p className="text-gray-400 text-sm">Ask anything about your health data</p>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg mr-3 mt-1 flex-shrink-0 flex items-center justify-center text-[11px] font-bold text-black"
                  style={{ background: `linear-gradient(135deg, ${OLIVE}, ${WARM})` }}>Z</div>
              )}
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' ? 'rounded-br-sm' : 'border border-white/[0.06] text-gray-200 rounded-bl-sm'
                }`}
                style={msg.role === 'user'
                  ? { background: `linear-gradient(135deg, ${OLIVE}, ${WARM})`, color: '#000' }
                  : { background: '#141210' }
                }
              >
                {msg.content || (loading && msg.role === 'assistant' && (
                  <span className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <motion.span key={i} animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                        className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: OLIVE_LIGHT }} />
                    ))}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-2 mb-4">
          {suggestions.map((s) => (
            <button key={s} onClick={() => send(s)}
              className="text-xs px-3 py-2 rounded-lg border border-white/[0.08] text-gray-400 hover:text-white hover:border-white/20 transition-colors"
            >{s}</button>
          ))}
        </motion.div>
      )}

      {/* Input */}
      <div className="flex gap-3">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(input)}
          placeholder="Ask about your health data..."
          className="flex-1 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/20 transition-colors"
          style={{ background: '#111' }}
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim() || loading}
          className="px-5 py-3 rounded-xl text-sm font-semibold text-black disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-[1.02]"
          style={{ background: `linear-gradient(135deg, ${OLIVE_LIGHT}, ${WARM})` }}
        >
          Send
        </button>
      </div>
    </div>
  )
}
