import { router } from '../trpc.ts'
import { userRouter } from './userRouter.ts'
import { activityRouter } from './activityRouter.ts'
import { journalEntryRouter } from './journalEntryRouter.ts'
import { moodRouter } from './moodRouter.ts'
import { dashboardRouter } from './dashboardRouter.ts'

export const appRouter = router({
  user: userRouter,
  mood: moodRouter,
  activity: activityRouter,
  journalEntry: journalEntryRouter,
  dashboard: dashboardRouter,
})

export type AppRouter = typeof appRouter
