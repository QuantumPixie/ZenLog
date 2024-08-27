import { router } from '../trpc'
import { userRouter } from './userRouter'
import { activityRouter } from './activityRouter'
import { journalEntryRouter } from './journalEntryRouter'
import { moodRouter } from './moodRouter'
import { dashboardRouter } from './dashboardRouter'

export const appRouter = router({
  user: userRouter,
  mood: moodRouter,
  activity: activityRouter,
  journalEntry: journalEntryRouter,
  dashboard: dashboardRouter,
})

export type AppRouter = typeof appRouter
