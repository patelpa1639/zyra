import Fastify, { FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import { healthRoutes } from './routes/health'
import { authRoutes } from './routes/auth'
import { workoutRoutes } from './routes/workouts'
import { insightRoutes } from './routes/insights'

const app = Fastify({ logger: true })

// Register plugins
app.register(cors, { origin: true })

// Health check
app.get('/health', async () => ({ status: 'ok', app: 'zyra-api' }))

// Register routes
app.register(async (fastify: FastifyInstance) => {
  await healthRoutes(fastify)
  await authRoutes(fastify)
  await workoutRoutes(fastify)
  await insightRoutes(fastify)
})

const start = async () => {
  try {
    await app.listen({ port: 3001, host: '0.0.0.0' })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
