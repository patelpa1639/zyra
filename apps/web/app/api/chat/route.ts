import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequestBody {
  messages: ChatMessage[];
  userId?: string | null;
  system?: string;
  max_tokens?: number;
}

async function buildUserContext(userId?: string | null): Promise<string | null> {
  if (!supabase) return null;

  let uid = userId ?? null;

  if (!uid) {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'demo@zyra.ai')
      .single();

    if (error || !data) return null;
    uid = data.id as string;
  }

  const sinceIso = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [metricsRes, workoutsRes, insightsRes, oauthRes] = await Promise.all([
    supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', uid)
      .gte('recorded_at', sinceIso)
      .order('recorded_at', { ascending: true }),
    supabase
      .from('workouts')
      .select('*')
      .eq('user_id', uid)
      .order('started_at', { ascending: false })
      .limit(10),
    supabase
      .from('ai_insights')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('oauth_tokens')
      .select('provider, created_at')
      .eq('user_id', uid),
  ]);

  const rawMetrics = metricsRes.data ?? [];
  const rawWorkouts = workoutsRes.data ?? [];
  const rawInsights = insightsRes.data ?? [];
  const rawOauth = oauthRes.data ?? [];

  if (
    (!rawMetrics || rawMetrics.length === 0) &&
    (!rawWorkouts || rawWorkouts.length === 0) &&
    (!rawInsights || rawInsights.length === 0)
  ) {
    return null;
  }

  const parts: string[] = [];

  if (rawOauth.length > 0) {
    const providers = Array.from(
      new Set(rawOauth.map((o: any) => o.provider as string)),
    );
    parts.push(
      `Connected platforms: ${providers.join(', ')}. Use them when you refer to data sources.`,
    );
  }

  if (rawMetrics.length > 0) {
    const byType = (type: string) =>
      rawMetrics
        .filter((m: any) => m.type === type)
        .sort(
          (a: any, b: any) =>
            new Date(a.recorded_at).getTime() -
            new Date(b.recorded_at).getTime(),
        );

    const hrv = byType('hrv');
    if (hrv.length >= 2) {
      const first = Number(hrv[0].value);
      const last = Number(hrv[hrv.length - 1].value);
      const change = last - first;
      const pct = first ? Math.round((change / first) * 100) : 0;
      parts.push(
        `HRV: last 30 days trend is ${pct >= 0 ? 'up' : 'down'} about ${Math.abs(
          pct,
        )}% (${Math.round(first)}→${Math.round(
          last,
        )} ms). Higher is better for recovery.`,
      );
    }

    const rhr = byType('heart_rate');
    if (rhr.length >= 2) {
      const first = Number(rhr[0].value);
      const last = Number(rhr[rhr.length - 1].value);
      const change = last - first;
      if (Math.abs(change) >= 2) {
        parts.push(
          `Resting heart rate moved from ${Math.round(first)} to ${Math.round(
            last,
          )} bpm over 30 days (${change < 0 ? 'down' : 'up'} ${Math.abs(
            change,
          )} bpm). Lower is generally better, if not due to illness or overtraining.`,
        );
      }
    }

    const sleep = byType('sleep');
    if (sleep.length > 0) {
      const vals = sleep.map((s: any) => Number(s.value));
      const avg =
        vals.reduce((sum, v) => sum + v, 0) / (vals.length || 1);
      const shortNights = vals.filter((v) => v < 7).length;
      parts.push(
        `Sleep: averaging about ${avg.toFixed(
          1,
        )} hours per night in the last ${vals.length} days, with ${shortNights} nights under 7 hours (these contribute to sleep debt).`,
      );
    }

    const steps = byType('steps');
    if (steps.length > 0) {
      const vals = steps.map((s: any) => Number(s.value));
      const avg =
        vals.reduce((sum, v) => sum + v, 0) / (vals.length || 1);
      const highDays = vals.filter((v) => v >= 10_000).length;
      parts.push(
        `Steps: averaging ~${Math.round(
          avg,
        ).toLocaleString()} steps/day with ${highDays} days at or above 10,000 steps in the last ${
          vals.length
        }.`,
      );
    }
  }

  if (rawWorkouts.length > 0) {
    const totalMins =
      rawWorkouts.reduce(
        (sum: number, w: any) => sum + (w.duration || 0),
        0,
      ) / 60;
    const hiSessions = rawWorkouts.filter(
      (w: any) =>
        (w.type === 'run' || w.type === 'ride') &&
        (w.avg_heart_rate ?? 0) >= 150,
    ).length;
    parts.push(
      `Workouts: ${rawWorkouts.length} sessions in the last month (~${Math.round(
        totalMins / 60,
      )} hours total). Roughly ${hiSessions} of those look like high-intensity days (runs/rides with avg HR ≥150 bpm).`,
    );
  }

  if (rawInsights.length > 0) {
    const latest = rawInsights[0] as any;
    parts.push(
      `Most recent AI insight: "${latest.title}" – ${latest.body}`,
    );
  }

  return parts.join('\n');
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatRequestBody;

    const { messages, userId, system, max_tokens = 1024 } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required and must not be empty' },
        { status: 400 },
      );
    }

    const context = await buildUserContext(userId);

    const baseSystem =
      system ||
      'You are Zyra, an AI health and fitness coach. You specialise in interpreting HRV, sleep, training load and recovery for serious amateur athletes.';

    const finalSystem = context
      ? `${baseSystem}

Here is the user’s recent health and training data (roughly the last 30 days). Use these specifics heavily in your answers, and be concrete and concise:

${context}

When you respond, reference these numbers directly and give clear recommendations (e.g. what to do this week, what to watch, and where they’re trending).`
      : baseSystem;

    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === 'user')?.content;

    const encoder = new TextEncoder();

    if (!process.env.ANTHROPIC_API_KEY) {
      const fallbackText =
        `Zyra is not connected to Claude yet (missing ANTHROPIC_API_KEY), so this is a built‑in heuristic answer.\n\n` +
        (context
          ? `Based on your recent data:\n${context}\n\n`
          : '') +
        (lastUserMessage
          ? `Question: "${lastUserMessage}"\n\n`
          : '') +
        `High‑level guidance: keep your easy days truly easy, protect 7–9 hours of sleep (especially on hard days), and aim for 2–3 low‑intensity sessions for every hard session.`;

      const stream = new ReadableStream({
        start(controller) {
          const sseData = `data: ${JSON.stringify({
            text: fallbackText,
            done: true,
          })}\n\n`;
          controller.enqueue(encoder.encode(sseData));
          controller.close();
        },
      });

      return new NextResponse(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }

    const stream = await anthropic.messages.stream({
      model: 'claude-3-5-haiku-20241022',
      max_tokens,
      system: finalSystem,
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    const encoder2 = new TextEncoder();
    let buffer = '';

    const customStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              const text = event.delta.text;
              buffer += text;

              const sseData = `data: ${JSON.stringify({ text })}\n\n`;
              controller.enqueue(encoder2.encode(sseData));
            } else if (event.type === 'message_stop') {
              const sseData = `data: ${JSON.stringify({
                done: true,
                content: buffer,
              })}\n\n`;
              controller.enqueue(encoder2.encode(sseData));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new NextResponse(customStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);

    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: error.message, status: error.status },
        { status: error.status || 500 },
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
