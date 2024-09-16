import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import * as trpcExpress from '@trpc/server/adapters/express'
import { renderTrpcPanel } from 'trpc-panel'
import { createContext } from './trpc'
import { appRouter } from './routers'
import { db } from './database'

export type AppRouter = typeof appRouter

const app = express()

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:4173'],
    credentials: true,
  })
)
app.use(express.json())

app.use(cookieParser())

app.use('/api/health', (_, res) => {
  res.status(200).send('OK')
})

app.use('/panel', (_, res) =>
  res.send(
    renderTrpcPanel(appRouter, {
      url: 'http://localhost:3007/api/trpc',
    })
  )
)

app.use(
  '/api/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext: ({ req, res }) => createContext({ req, res }),
  })
)

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Not Found' })
})

const PORT = process.env.PORT || 3005

const startServer = async () => {
  try {
    await db.selectFrom('users').select('id').limit(1).execute()

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
      console.log(`tRPC Panel available at http://localhost:${PORT}/panel`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

export default app
