import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { supabase } from '../services/supabase';

interface HealthMetric {
  id?: string;
  user_id: string;
  metric_type: 'steps' | 'heart_rate' | 'sleep' | 'calories' | 'distance';
  value: number;
  unit: string;
  recorded_at: string;
  source?: 'strava' | 'garmin' | 'apple_health' | 'manual';
}

export async function healthRoutes(fastify: FastifyInstance) {
  // GET all health metrics for authenticated user
  fastify.get<{ Querystring: { limit?: number; offset?: number } }>(
    '/api/health/metrics',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.code(401).send({ error: 'Unauthorized' });
        }

        const limit = Math.min(request.query.limit || 50, 100);
        const offset = request.query.offset || 0;

        const { data, error, count } = await supabase
          .from('health_metrics')
          .select('*', { count: 'exact' })
          .eq('user_id', userId)
          .order('recorded_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (error) throw error;

        return reply.send({
          data,
          pagination: {
            total: count,
            limit,
            offset,
          },
        });
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ error: 'Failed to fetch metrics' });
      }
    }
  );

  // GET metrics by type
  fastify.get<{ Params: { type: string } }>(
    '/api/health/metrics/:type',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.code(401).send({ error: 'Unauthorized' });
        }

        const { type } = request.params;

        const { data, error } = await supabase
          .from('health_metrics')
          .select('*')
          .eq('user_id', userId)
          .eq('metric_type', type)
          .order('recorded_at', { ascending: false })
          .limit(100);

        if (error) throw error;

        return reply.send({ data });
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ error: 'Failed to fetch metrics by type' });
      }
    }
  );

  // POST new health metric
  fastify.post<{ Body: HealthMetric }>(
    '/api/health/metrics',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.code(401).send({ error: 'Unauthorized' });
        }

        const { metric_type, value, unit, recorded_at, source } = request.body;

        const { data, error } = await supabase
          .from('health_metrics')
          .insert([
            {
              user_id: userId,
              metric_type,
              value,
              unit,
              recorded_at: recorded_at || new Date().toISOString(),
              source: source || 'manual',
            },
          ])
          .select();

        if (error) throw error;

        return reply.code(201).send(data[0]);
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ error: 'Failed to create metric' });
      }
    }
  );

  // PUT update health metric
  fastify.put<{ Params: { id: string }; Body: Partial<HealthMetric> }>(
    '/api/health/metrics/:id',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.code(401).send({ error: 'Unauthorized' });
        }

        const { id } = request.params;

        // Verify ownership
        const { data: existing, error: checkError } = await supabase
          .from('health_metrics')
          .select('user_id')
          .eq('id', id)
          .single();

        if (checkError || existing?.user_id !== userId) {
          return reply.code(403).send({ error: 'Forbidden' });
        }

        const { data, error } = await supabase
          .from('health_metrics')
          .update(request.body)
          .eq('id', id)
          .select();

        if (error) throw error;

        return reply.send(data[0]);
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ error: 'Failed to update metric' });
      }
    }
  );

  // DELETE health metric
  fastify.delete<{ Params: { id: string } }>(
    '/api/health/metrics/:id',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.code(401).send({ error: 'Unauthorized' });
        }

        const { id } = request.params;

        // Verify ownership
        const { data: existing, error: checkError } = await supabase
          .from('health_metrics')
          .select('user_id')
          .eq('id', id)
          .single();

        if (checkError || existing?.user_id !== userId) {
          return reply.code(403).send({ error: 'Forbidden' });
        }

        const { error } = await supabase
          .from('health_metrics')
          .delete()
          .eq('id', id);

        if (error) throw error;

        return reply.code(204).send();
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ error: 'Failed to delete metric' });
      }
    }
  );
}
