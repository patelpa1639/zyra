import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { supabase } from '../services/supabase';

interface SignUpRequest {
  email: string;
  password: string;
  full_name?: string;
}

interface SignInRequest {
  email: string;
  password: string;
}

interface OAuthCallbackRequest {
  code: string;
  provider: 'strava' | 'garmin' | 'apple_health';
}

export async function authRoutes(fastify: FastifyInstance) {
  // Sign up
  fastify.post<{ Body: SignUpRequest }>(
    '/api/auth/signup',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { email, password, full_name } = request.body;

        if (!email || !password) {
          return reply.code(400).send({ error: 'Email and password required' });
        }

        const { data, error } = await supabase.auth.signUpWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Create user profile
        if (data.user) {
          await supabase.from('users').insert([
            {
              id: data.user.id,
              email,
              full_name: full_name || null,
              created_at: new Date().toISOString(),
            },
          ]);
        }

        return reply.code(201).send({
          user: data.user,
          session: data.session,
        });
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ error: 'Sign up failed' });
      }
    }
  );

  // Sign in
  fastify.post<{ Body: SignInRequest }>(
    '/api/auth/signin',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { email, password } = request.body;

        if (!email || !password) {
          return reply.code(400).send({ error: 'Email and password required' });
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        return reply.send({
          user: data.user,
          session: data.session,
        });
      } catch (err) {
        fastify.log.error(err);
        return reply.code(401).send({ error: 'Invalid credentials' });
      }
    }
  );

  // Refresh token
  fastify.post<{ Body: { refresh_token: string } }>(
    '/api/auth/refresh',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { refresh_token } = request.body;

        if (!refresh_token) {
          return reply.code(400).send({ error: 'Refresh token required' });
        }

        const { data, error } = await supabase.auth.refreshSession({
          refresh_token,
        });

        if (error) throw error;

        return reply.send({
          session: data.session,
          user: data.user,
        });
      } catch (err) {
        fastify.log.error(err);
        return reply.code(401).send({ error: 'Token refresh failed' });
      }
    }
  );

  // Sign out
  fastify.post(
    '/api/auth/signout',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { error } = await supabase.auth.signOut();

        if (error) throw error;

        return reply.send({ message: 'Signed out successfully' });
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ error: 'Sign out failed' });
      }
    }
  );

  // Get current user
  fastify.get(
    '/api/auth/me',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.code(401).send({ error: 'Unauthorized' });
        }

        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) throw error;

        return reply.send(data);
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ error: 'Failed to fetch user' });
      }
    }
  );

  // Update user profile
  fastify.put<{ Body: { full_name?: string; avatar_url?: string } }>(
    '/api/auth/profile',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.code(401).send({ error: 'Unauthorized' });
        }

        const { full_name, avatar_url } = request.body;

        const { data, error } = await supabase
          .from('users')
          .update({
            full_name: full_name || undefined,
            avatar_url: avatar_url || undefined,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)
          .select();

        if (error) throw error;

        return reply.send(data[0]);
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ error: 'Failed to update profile' });
      }
    }
  );

  // OAuth callback handler (placeholder for Strava/Garmin/Apple Health)
  fastify.post<{ Body: OAuthCallbackRequest }>(
    '/api/auth/oauth/callback',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { code, provider } = request.body;
        const userId = request.user?.id;

        if (!userId) {
          return reply.code(401).send({ error: 'Unauthorized' });
        }

        if (!code || !provider) {
          return reply.code(400).send({ error: 'Code and provider required' });
        }

        // Store OAuth token in database (encrypted)
        // This is a placeholder — actual implementation depends on provider SDKs
        const { data, error } = await supabase
          .from('oauth_tokens')
          .insert([
            {
              user_id: userId,
              provider,
              authorization_code: code, // In production, exchange for token and encrypt
              created_at: new Date().toISOString(),
            },
          ])
          .select();

        if (error) throw error;

        return reply.code(201).send({
          message: `${provider} connected successfully`,
          data: data[0],
        });
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ error: 'OAuth callback failed' });
      }
    }
  );

  // List connected OAuth providers
  fastify.get(
    '/api/auth/oauth/providers',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.code(401).send({ error: 'Unauthorized' });
        }

        const { data, error } = await supabase
          .from('oauth_tokens')
          .select('provider, created_at')
          .eq('user_id', userId);

        if (error) throw error;

        return reply.send({
          providers: data.map((p) => ({ name: p.provider, connected_at: p.created_at })),
        });
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ error: 'Failed to fetch OAuth providers' });
      }
    }
  );
}
