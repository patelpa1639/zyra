import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('waitlist')
      .insert([{ email: email.toLowerCase().trim(), created_at: new Date().toISOString() }])

    if (error) {
      // Duplicate email — treat as success so we don't leak info
      if (error.code === '23505') {
        return NextResponse.json({ success: true, message: "You're already on the list!" })
      }
      throw error
    }

    return NextResponse.json({ success: true, message: "You're on the list!" })
  } catch (err) {
    console.error('Waitlist error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
