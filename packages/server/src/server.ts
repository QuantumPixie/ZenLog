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
import { createProxyMiddleware } from 'http-proxy-middleware'

export type AppRouter = typeof appRouter

const app = express()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:5182',
  'http://localhost:5177',
  'http://localhost:3005',
  'https://zenlog-b49a02b5774a.herokuapp.com',
]

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        console.error('CORS error: Origin not allowed:', origin)
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
  })
)

app.use(express.json())
app.use(cookieParser())

// Logging middleware
app.use((req, res, next) => {
  console.log(`Received ${req.method} request for ${req.url}`)
  next()
})

// Enable pre-flight requests for all routes
app.options('*', cors())

// Conditional proxy middleware for development
if (process.env.NODE_ENV === 'development') {
  const apiProxy = createProxyMiddleware({
    target: process.env.VITE_BACKEND_URL || 'http://localhost:3005',
    changeOrigin: true,
    pathRewrite: {
      '^/api': '', // remove /api prefix when forwarding to backend
    },
  })
  app.use('/api', apiProxy)
}

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
    createContext: ({ req, res }: { req: Request; res: Response }) => {
      console.log('TRPC request received:', req.url)
      return createContext({ req, res })
    },
  })
)

// Static files
const frontendPath = path.join(
  __dirname,
  '../../client/mental-health-tracker-frontend/dist'
)
console.log('Frontend path:', frontendPath)
console.log('Frontend path exists:', fs.existsSync(frontendPath))

app.use(express.static(frontendPath))

app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Not Found' })
})

// Catch-all route for SPA
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
