import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import * as trpcExpress from '@trpc/server/adapters/express'
import { renderTrpcPanel } from 'trpc-panel'
import { createContext } from './trpc.ts'
import { appRouter } from '../src/routers/index.ts'
import { db } from '../src/database/index.ts'
import type { Request, Response } from 'express'

export type AppRouter = typeof appRouter

const app = express()

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:5182',
  'http://localhost:5177',
]

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
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
    createContext: ({ req, res }: { req: Request; res: Response }) =>
      createContext({ req, res }),
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
