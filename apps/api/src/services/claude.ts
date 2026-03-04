import Anthropic from '@anthropic-ai/sdk';

const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  throw new Error('Missing ANTHROPIC_API_KEY environment variable');
}

export const anthropic = new Anthropic({ apiKey });

export interface HealthMetricData {
  type: 'steps' | 'heart_rate' | 'sleep' | 'calories' | 'distance';
  value: number;
  unit: string;
  recordedAt: string;
}

export interface UserHealthContext {
  userId: string;
  age?: number;
  fitnessGoals?: string[];
  recentMetrics: HealthMetricData[];
}

export interface GeneratedInsight {
  title: string;
  content: string;
  recommendation?: string;
  urgency: 'low' | 'medium' | 'high';
}

/**
 * Generate health insights using Claude
 * Analyzes user health metrics and generates personalized recommendations
 */
export async function generateInsight(
  userContext: UserHealthContext
): Promise<GeneratedInsight> {
  try {
    // Build context from recent metrics
    const metricsContext = userContext.recentMetrics
      .map((m) => `${m.type}: ${m.value} ${m.unit} (${m.recordedAt})`)
      .join('\n');

    const goalsContext = userContext.fitnessGoals?.length
      ? `Fitness Goals: ${userContext.fitnessGoals.join(', ')}`
      : '';

    const userAge = userContext.age ? `Age: ${userContext.age}` : '';

    const systemPrompt = `You are a personal health and fitness AI coach. 
Analyze the user's health metrics and provide actionable, personalized insights and recommendations.
Focus on:
- Health trends and patterns
- Specific, actionable recommendations
- Encouragement and motivation
- Risk factors or areas of concern

Keep responses concise (2-3 sentences max) but impactful.`;

    const userPrompt = `Please analyze the following health data and provide an insight:

${userAge}
${goalsContext}

Recent Metrics:
${metricsContext}

Provide one key insight and one specific recommendation.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 300,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    // Extract text from response
    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse response into structured format
    const lines = responseText.split('\n').filter((line) => line.trim());
    const title = lines[0] || 'Health Insight';
    const content = lines.slice(1).join('\n') || responseText;

    // Determine urgency based on metrics
    let urgency: 'low' | 'medium' | 'high' = 'low';
    const hasHighHeartRate = userContext.recentMetrics.some(
      (m) => m.type === 'heart_rate' && m.value > 100
    );
    const hasLowSleep = userContext.recentMetrics.some(
      (m) => m.type === 'sleep' && m.value < 6
    );

    if (hasHighHeartRate || hasLowSleep) {
      urgency = 'high';
    }

    return {
      title,
      content,
      recommendation: lines[lines.length - 1] || undefined,
      urgency,
    };
  } catch (error) {
    console.error('Failed to generate insight:', error);
    throw error;
  }
}

/**
 * Generate a fitness game plan using Claude (Pro tier)
 * For teams competing or training together
 */
export async function generateGamePlan(
  teamContext: {
    teamName: string;
    opponent?: string;
    athleteCount: number;
    mainGoal: string;
    injuries?: string[];
    videos?: string[];
    timeframe?: string;
  }
): Promise<GeneratedInsight> {
  try {
    const injuriesContext = teamContext.injuries?.length
      ? `Injuries/Concerns: ${teamContext.injuries.join(', ')}`
      : '';

    const videosContext = teamContext.videos?.length
      ? `Available Video Analysis: ${teamContext.videos.length} video(s)`
      : '';

    const timeframeContext = teamContext.timeframe
      ? `Training Timeframe: ${teamContext.timeframe}`
      : 'Training Timeframe: 4-6 weeks';

    const systemPrompt = `You are an elite sports performance coach and training strategist.
Generate detailed, actionable game plans for team training and competition preparation.
Consider:
- Individual athlete fitness levels
- Opponent analysis (if provided)
- Injury prevention and management
- Progressive training load
- Recovery strategies
- Competitive strategy

Be specific with exercises, rep ranges, and timing.`;

    const userPrompt = `Generate a comprehensive game plan for:

Team: ${teamContext.teamName}
Athletes: ${teamContext.athleteCount}
${teamContext.opponent ? `Opponent: ${teamContext.opponent}` : ''}
Main Goal: ${teamContext.mainGoal}
${injuriesContext}
${videosContext}
${timeframeContext}

Provide a structured game plan with weekly focus areas and key training elements.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 800,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '';

    return {
      title: `Game Plan: ${teamContext.teamName}`,
      content: responseText,
      urgency: 'high',
    };
  } catch (error) {
    console.error('Failed to generate game plan:', error);
    throw error;
  }
}

/**
 * Stream insight generation for real-time updates
 */
export async function streamInsight(
  userContext: UserHealthContext,
  onChunk: (chunk: string) => void
): Promise<string> {
  try {
    const metricsContext = userContext.recentMetrics
      .map((m) => `${m.type}: ${m.value} ${m.unit}`)
      .join('\n');

    let fullResponse = '';

    const stream = await anthropic.messages.stream({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: `Analyze this health data and provide a quick insight:\n${metricsContext}`,
        },
      ],
    });

    for await (const chunk of stream) {
      if (
        chunk.type === 'content_block_delta' &&
        chunk.delta.type === 'text_delta'
      ) {
        onChunk(chunk.delta.text);
        fullResponse += chunk.delta.text;
      }
    }

    return fullResponse;
  } catch (error) {
    console.error('Failed to stream insight:', error);
    throw error;
  }
}
