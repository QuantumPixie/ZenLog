import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import * as trpcExpress from '@trpc/server/adapters/express'
import { renderTrpcPanel } from 'trpc-panel'
import { createContext } from './trpc'
import { appRouter } from './routers'
import { db } from './database'
import type { Request, Response, NextFunction } from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

export type AppRouter = typeof appRouter

const app = express()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:5182',
  'http://localhost:5177',
  'https://zenlog-b49a02b5774a.herokuapp.com',
]

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
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
      url: `${process.env.VITE_BACKEND_URL || 'http://localhost:3005'}/api/trpc`,
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

// static files
const frontendPath = path.join(
  __dirname,
  '../../client/mental-health-tracker-frontend/dist'
)
console.log('Frontend path:', frontendPath)
console.log('Frontend path exists:', fs.existsSync(frontendPath))

app.use(express.static(frontendPath))

// catch all route
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'))
})

app.use(
  (err: unknown, req: Request, res: Response, _next: NextFunction): void => {
    console.error('Server error:', err)
    console.error('Request URL:', req.url)
    console.error('Request method:', req.method)
    res.status(500).json({ error: 'Internal Server Error' })
  }
)

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
