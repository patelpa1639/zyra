import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { supabase } from '../services/supabase';

interface CreateWorkoutRequest {
  source: 'strava' | 'garmin' | 'apple_health' | 'manual';
  type: string;
  duration: number; // seconds
  distance?: number; // meters
  calories?: number;
  avg_heart_rate?: number;
  max_heart_rate?: number;
  elevation_gain?: number;
  started_at: string;
  ended_at?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

interface UpdateWorkoutRequest {
  type?: string;
  duration?: number;
  distance?: number;
  calories?: number;
  avg_heart_rate?: number;
  max_heart_rate?: number;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export async function workoutRoutes(fastify: FastifyInstance) {
  // GET all workouts for authenticated user (paginated)
  fastify.get<{ Querystring: { limit?: number; offset?: number; days?: number } }>(
    '/api/workouts',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.code(401).send({ error: 'Unauthorized' });
        }

        const limit = Math.min(request.query.limit || 50, 100);
        const offset = request.query.offset || 0;
        const days = request.query.days || 30;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data, error, count } = await supabase
          .from('workouts')
          .select('*', { count: 'exact' })
          .eq('user_id', userId)
          .gte('started_at', startDate.toISOString())
          .order('started_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (error) throw error;

        return reply.send({
          data: data?.map(w => ({
            ...w,
            startedAt: w.started_at,
            endedAt: w.ended_at,
            avgHeartRate: w.avg_heart_rate,
            maxHeartRate: w.max_heart_rate,
            elevationGain: w.elevation_gain,
            createdAt: w.created_at,
            updatedAt: w.updated_at,
          })),
          pagination: {
            total: count,
            limit,
            offset,
            days,
          },
        });
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ error: 'Failed to fetch workouts' });
      }
    }
  );

  // GET single workout by ID
  fastify.get<{ Params: { id: string } }>(
    '/api/workouts/:id',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.code(401).send({ error: 'Unauthorized' });
        }

        const { id } = request.params;

        const { data, error } = await supabase
          .from('workouts')
          .select('*')
          .eq('id', id)
          .eq('user_id', userId)
          .single();

        if (error) throw error;

        if (!data) {
          return reply.code(404).send({ error: 'Workout not found' });
        }

        return reply.send({
          ...data,
          startedAt: data.started_at,
          endedAt: data.ended_at,
          avgHeartRate: data.avg_heart_rate,
          maxHeartRate: data.max_heart_rate,
          elevationGain: data.elevation_gain,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        });
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ error: 'Failed to fetch workout' });
      }
    }
  );

  // GET workouts by type
  fastify.get<{ Params: { type: string }; Querystring: { limit?: number } }>(
    '/api/workouts/type/:type',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.code(401).send({ error: 'Unauthorized' });
        }

        const { type } = request.params;
        const limit = Math.min(request.query.limit || 50, 100);

        const { data, error } = await supabase
          .from('workouts')
          .select('*')
          .eq('user_id', userId)
          .eq('type', type)
          .order('started_at', { ascending: false })
          .limit(limit);

        if (error) throw error;

        return reply.send({
          data: data?.map(w => ({
            ...w,
            startedAt: w.started_at,
            endedAt: w.ended_at,
            avgHeartRate: w.avg_heart_rate,
            maxHeartRate: w.max_heart_rate,
            elevationGain: w.elevation_gain,
            createdAt: w.created_at,
            updatedAt: w.updated_at,
          })),
        });
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ error: 'Failed to fetch workouts by type' });
      }
    }
  );

  // POST new workout
  fastify.post<{ Body: CreateWorkoutRequest }>(
    '/api/workouts',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.code(401).send({ error: 'Unauthorized' });
        }

        const {
          source,
          type,
          duration,
          distance,
          calories,
          avg_heart_rate,
          max_heart_rate,
          elevation_gain,
          started_at,
          ended_at,
          notes,
          metadata,
        } = request.body;

        if (!source || !type || !duration || !started_at) {
          return reply.code(400).send({
            error: 'Missing required fields: source, type, duration, started_at',
          });
        }

        const { data, error } = await supabase
          .from('workouts')
          .insert([
            {
              user_id: userId,
              source,
              type,
              duration,
              distance: distance || null,
              calories: calories || null,
              avg_heart_rate: avg_heart_rate || null,
              max_heart_rate: max_heart_rate || null,
              elevation_gain: elevation_gain || null,
              started_at,
              ended_at: ended_at || null,
              notes: notes || null,
              metadata: metadata || {},
            },
          ])
          .select();

        if (error) throw error;

        const workout = data[0];
        return reply.code(201).send({
          ...workout,
          startedAt: workout.started_at,
          endedAt: workout.ended_at,
          avgHeartRate: workout.avg_heart_rate,
          maxHeartRate: workout.max_heart_rate,
          elevationGain: workout.elevation_gain,
          createdAt: workout.created_at,
          updatedAt: workout.updated_at,
        });
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ error: 'Failed to create workout' });
      }
    }
  );

  // PUT update workout
  fastify.put<{ Params: { id: string }; Body: UpdateWorkoutRequest }>(
    '/api/workouts/:id',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.code(401).send({ error: 'Unauthorized' });
        }

        const { id } = request.params;

        // Verify ownership
        const { data: existing, error: checkError } = await supabase
          .from('workouts')
          .select('user_id')
          .eq('id', id)
          .single();

        if (checkError || existing?.user_id !== userId) {
          return reply.code(403).send({ error: 'Forbidden' });
        }

        const { data, error } = await supabase
          .from('workouts')
          .update(request.body)
          .eq('id', id)
          .select();

        if (error) throw error;

        const workout = data[0];
        return reply.send({
          ...workout,
          startedAt: workout.started_at,
          endedAt: workout.ended_at,
          avgHeartRate: workout.avg_heart_rate,
          maxHeartRate: workout.max_heart_rate,
          elevationGain: workout.elevation_gain,
          createdAt: workout.created_at,
          updatedAt: workout.updated_at,
        });
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ error: 'Failed to update workout' });
      }
    }
  );

  // DELETE workout
  fastify.delete<{ Params: { id: string } }>(
    '/api/workouts/:id',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.code(401).send({ error: 'Unauthorized' });
        }

        const { id } = request.params;

        // Verify ownership
        const { data: existing, error: checkError } = await supabase
          .from('workouts')
          .select('user_id')
          .eq('id', id)
          .single();

        if (checkError || existing?.user_id !== userId) {
          return reply.code(403).send({ error: 'Forbidden' });
        }

        const { error } = await supabase
          .from('workouts')
          .delete()
          .eq('id', id);

        if (error) throw error;

        return reply.code(204).send();
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ error: 'Failed to delete workout' });
      }
    }
  );

  // GET workout stats (summary)
  fastify.get<{ Querystring: { days?: number } }>(
    '/api/workouts/stats/summary',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.code(401).send({ error: 'Unauthorized' });
        }

        const days = request.query.days || 7;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data, error } = await supabase
          .from('workouts')
          .select('*')
          .eq('user_id', userId)
          .gte('started_at', startDate.toISOString());

        if (error) throw error;

        const stats = {
          total_workouts: data?.length || 0,
          total_duration_seconds: data?.reduce((sum, w) => sum + (w.duration || 0), 0) || 0,
          total_distance_meters: data?.reduce((sum, w) => sum + (w.distance || 0), 0) || 0,
          total_calories: data?.reduce((sum, w) => sum + (w.calories || 0), 0) || 0,
          avg_heart_rate: data?.length
            ? Math.round(
                data
                  .filter(w => w.avg_heart_rate)
                  .reduce((sum, w) => sum + (w.avg_heart_rate || 0), 0) /
                  data.filter(w => w.avg_heart_rate).length
              )
            : null,
          workout_types: [...new Set(data?.map(w => w.type) || [])],
          period_days: days,
        };

        return reply.send(stats);
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ error: 'Failed to fetch workout stats' });
      }
    }
  );
}
