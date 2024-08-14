import express from 'express'
import cors from 'cors'
import * as trpcExpress from '@trpc/server/adapters/express'
import { renderTrpcPanel } from 'trpc-panel'
import { router, createContext } from './trpc'
import { userRouter } from './routers/userRouter'
import { activityRouter } from './routers/activityRouter'
import { journalEntryRouter } from './routers/journalEntryRouter'
import { moodRouter } from './routers/moodRouter'
import { dashboardRouter } from './routers/dashboardRouter'
import type { CustomRequest } from './types/customRequest'
import { db } from './database'
import { authenticateJWT } from './middleware/auth'

export const appRouter = router({
  user: userRouter,
  activity: activityRouter,
  journalEntry: journalEntryRouter,
  mood: moodRouter,
  dashboard: dashboardRouter,
})

export type AppRouter = typeof appRouter

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/health', (_, res) => {
  res.status(200).send('OK')
})

app.use('/panel', (_, res) => res.send(
    renderTrpcPanel(appRouter, {
      url: 'http://localhost:3005/api/trpc',
    })
  ))

  app.use('/api/trpc/:path', (req, res, next) => {
    if (req.params.path !== 'user.signup' && req.params.path !== 'user.login') {
      return authenticateJWT(req as CustomRequest, res, next);
    }
    return next();
  })

app.use(
  '/api/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext: ({ req, res }: trpcExpress.CreateExpressContextOptions) => createContext({ req: req as CustomRequest, res }),
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
