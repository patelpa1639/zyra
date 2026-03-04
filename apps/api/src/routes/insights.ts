import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { supabase } from '../services/supabase';
import { generateInsight, generateGamePlan } from '../services/claude';

interface GenerateInsightRequest {
  metric_type?: string; // optional: focus on specific metric type
  include_workouts?: boolean; // optional: include workout data
  days?: number; // optional: how many days back to analyze
}

interface GenerateGamePlanRequest {
  team_id: string;
  opponent?: string;
  training_focus?: string[];
  video_urls?: string[];
  timeframe?: string;
}

export async function insightRoutes(fastify: FastifyInstance) {
  // GET user's insights (paginated)
  fastify.get<{ Querystring: { limit?: number; offset?: number; type?: string } }>(
    '/api/insights',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.code(401).send({ error: 'Unauthorized' });
        }

        const limit = Math.min(request.query.limit || 50, 100);
        const offset = request.query.offset || 0;
        const type = request.query.type;

        let query = supabase
          .from('ai_insights')
          .select('*', { count: 'exact' })
          .eq('user_id', userId);

        if (type) {
          query = query.eq('type', type);
        }

        const { data, error, count } = await query
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (error) throw error;

        return reply.send({
          data: data?.map(i => ({
            ...i,
            createdAt: i.created_at,
            updatedAt: i.updated_at,
            userId: i.user_id,
            metricType: i.metric_type,
            isRead: i.is_read,
          })),
          pagination: {
            total: count,
            limit,
            offset,
          },
        });
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ error: 'Failed to fetch insights' });
      }
    }
  );

  // GET single insight
  fastify.get<{ Params: { id: string } }>(
    '/api/insights/:id',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.code(401).send({ error: 'Unauthorized' });
        }

        const { id } = request.params;

        const { data, error } = await supabase
          .from('ai_insights')
          .select('*')
          .eq('id', id)
          .eq('user_id', userId)
          .single();

        if (error) throw error;

        if (!data) {
          return reply.code(404).send({ error: 'Insight not found' });
        }

        return reply.send({
          ...data,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          userId: data.user_id,
          metricType: data.metric_type,
          isRead: data.is_read,
        });
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ error: 'Failed to fetch insight' });
      }
    }
  );

  // POST generate new insight using Claude
  fastify.post<{ Body: GenerateInsightRequest }>(
    '/api/insights/generate',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.code(401).send({ error: 'Unauthorized' });
        }

        const { metric_type, include_workouts, days } = request.body;

        // Fetch user's recent health metrics
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - (days || 7));

        const { data: metricsData, error: metricsError } = await supabase
          .from('health_metrics')
          .select('*')
          .eq('user_id', userId)
          .gte('recorded_at', startDate.toISOString())
          .limit(100);

        if (metricsError) throw metricsError;

        // Fetch user profile for context
        const { data: userProfile, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (userError) throw userError;

        // Fetch workouts if requested
        let workoutData = [];
        if (include_workouts) {
          const { data: workouts, error: workoutsError } = await supabase
            .from('workouts')
            .select('*')
            .eq('user_id', userId)
            .gte('started_at', startDate.toISOString())
            .limit(50);

          if (workoutsError) throw workoutsError;
          workoutData = workouts || [];
        }

        // Filter metrics by type if specified
        const filteredMetrics = metric_type
          ? (metricsData || []).filter(m => m.type === metric_type)
          : metricsData || [];

        if (filteredMetrics.length === 0) {
          return reply.code(400).send({
            error: 'No health data available for insight generation',
          });
        }

        // Generate insight using Claude
        const insight = await generateInsight({
          userId,
          age: userProfile?.age,
          fitnessGoals: userProfile?.fitness_goals,
          recentMetrics: filteredMetrics.map(m => ({
            type: m.type as any,
            value: m.value,
            unit: m.unit,
            recordedAt: m.recorded_at,
          })),
          workouts: workoutData,
        });

        // Save insight to database
        const { data: savedInsight, error: saveError } = await supabase
          .from('ai_insights')
          .insert([
            {
              user_id: userId,
              type: insight.type || 'recommendation',
              title: insight.title,
              body: insight.content,
              metric_type: metric_type || null,
              data: {
                urgency: insight.urgency,
                recommendation: insight.recommendation,
              },
            },
          ])
          .select();

        if (saveError) throw saveError;

        const saved = savedInsight[0];
        return reply.code(201).send({
          ...saved,
          createdAt: saved.created_at,
          updatedAt: saved.updated_at,
          userId: saved.user_id,
          metricType: saved.metric_type,
          isRead: saved.is_read,
        });
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ error: 'Failed to generate insight' });
      }
    }
  );

  // PUT mark insight as read
  fastify.put<{ Params: { id: string } }>(
    '/api/insights/:id/read',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.code(401).send({ error: 'Unauthorized' });
        }

        const { id } = request.params;

        // Verify ownership
        const { data: existing, error: checkError } = await supabase
          .from('ai_insights')
          .select('user_id')
          .eq('id', id)
          .single();

        if (checkError || existing?.user_id !== userId) {
          return reply.code(403).send({ error: 'Forbidden' });
        }

        const { data, error } = await supabase
          .from('ai_insights')
          .update({ is_read: true })
          .eq('id', id)
          .select();

        if (error) throw error;

        const updated = data[0];
        return reply.send({
          ...updated,
          createdAt: updated.created_at,
          updatedAt: updated.updated_at,
          userId: updated.user_id,
          metricType: updated.metric_type,
          isRead: updated.is_read,
        });
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ error: 'Failed to mark insight as read' });
      }
    }
  );

  // DELETE insight
  fastify.delete<{ Params: { id: string } }>(
    '/api/insights/:id',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.code(401).send({ error: 'Unauthorized' });
        }

        const { id } = request.params;

        // Verify ownership
        const { data: existing, error: checkError } = await supabase
          .from('ai_insights')
          .select('user_id')
          .eq('id', id)
          .single();

        if (checkError || existing?.user_id !== userId) {
          return reply.code(403).send({ error: 'Forbidden' });
        }

        const { error } = await supabase
          .from('ai_insights')
          .delete()
          .eq('id', id);

        if (error) throw error;

        return reply.code(204).send();
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ error: 'Failed to delete insight' });
      }
    }
  );

  // POST generate game plan (Pro tier)
  fastify.post<{ Body: GenerateGamePlanRequest }>(
    '/api/insights/game-plan',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.code(401).send({ error: 'Unauthorized' });
        }

        const { team_id, opponent, training_focus, video_urls, timeframe } =
          request.body;

        // Verify user is team admin/coach
        const { data: member, error: memberError } = await supabase
          .from('team_members')
          .select('role')
          .eq('team_id', team_id)
          .eq('user_id', userId)
          .single();

        if (memberError || (member && !['admin', 'coach'].includes(member.role))) {
          return reply.code(403).send({ error: 'Only coaches and admins can generate game plans' });
        }

        // Fetch team info
        const { data: team, error: teamError } = await supabase
          .from('teams')
          .select('*')
          .eq('id', team_id)
          .single();

        if (teamError) throw teamError;

        // Fetch team members' recent workouts for context
        const { data: teamMembers, error: membersError } = await supabase
          .from('team_members')
          .select('user_id')
          .eq('team_id', team_id);

        if (membersError) throw membersError;

        // Generate game plan using Claude
        const gamePlan = await generateGamePlan({
          teamName: team.name,
          opponent,
          athleteCount: teamMembers?.length || 1,
          mainGoal: training_focus?.join(', ') || 'Performance improvement',
          injuries: [], // Could fetch from team health data
          videos: video_urls || [],
          timeframe,
        });

        // Save game plan to database
        const { data: savedPlan, error: saveError } = await supabase
          .from('game_plans')
          .insert([
            {
              team_id,
              title: gamePlan.title,
              opponent_data: {
                opponent,
                video_analysis: video_urls,
              },
              fitness_recommendations: gamePlan.content.split('\n').filter(l => l.trim()),
              metadata: {
                urgency: gamePlan.urgency,
                training_focus,
              },
            },
          ])
          .select();

        if (saveError) throw saveError;

        const saved = savedPlan[0];
        return reply.code(201).send({
          ...saved,
          createdAt: saved.created_at,
          updatedAt: saved.updated_at,
          teamId: saved.team_id,
          opponentData: saved.opponent_data,
          fitnessRecommendations: saved.fitness_recommendations,
        });
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ error: 'Failed to generate game plan' });
      }
    }
  );
}
