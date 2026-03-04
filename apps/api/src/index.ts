import Fastify from 'fastify'
import cors from '@fastify/cors'

const app = Fastify({ logger: true })

app.register(cors, { origin: true })

// Health check
app.get('/health', async () => ({ status: 'ok', app: 'zyra-api' }))

// Routes (to be expanded)
app.get('/api/user/:id/insights', async (req, reply) => {
  return { message: 'AI insights coming soon' }
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
