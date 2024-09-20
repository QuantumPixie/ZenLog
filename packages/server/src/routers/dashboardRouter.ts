import { router, authedProcedure } from '../trpc.ts'
import { dashboardService } from '../services/dashboardService.ts'

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
