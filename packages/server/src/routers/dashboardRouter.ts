/* eslint-disable @typescript-eslint/no-explicit-any */
import { router, authedProcedure } from '../trpc'
import { dashboardService } from '../services/dashboardService'

export const dashboardRouter = router({
  getSummary: authedProcedure.query(async ({ ctx }) => {
    const summary = await dashboardService.getSummary(ctx.user.id)
    return {
      ...summary,
      recentEntries: summary.recentEntries.map((entry: { sentiment: any }) => ({
        ...entry,
        sentiment: Number(entry.sentiment),
      })),
    }
  }),
})
