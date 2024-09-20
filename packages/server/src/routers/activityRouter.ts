import { z } from 'zod'
import { router, authedProcedure } from '../trpc.ts'
import { activityService } from '../services/activityService.ts'
import {
  activityInputSchema,
  isValidDateString,
} from '../schemas/activitySchema.ts'
import { TRPCError } from '@trpc/server'

export const activityRouter = router({
  getActivities: authedProcedure.query(async ({ ctx }) => {
    console.log(`Fetching activities for user ${ctx.user.id}`)
    try {
      const activities = await activityService.getActivities(ctx.user.id)
      console.log(
        `Retrieved ${activities.length} activities for user ${ctx.user.id}`
      )
      return activities
    } catch (error) {
      console.error('Error fetching activities:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch activities',
      })
    }
  }),

  getActivityById: authedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const activity = await activityService.getActivityById(
        input.id,
        ctx.user.id
      )
      if (!activity) {
        throw new Error('Activity not found')
      }
      return activity
    }),

  createActivity: authedProcedure
    .input(activityInputSchema)
    .mutation(async ({ ctx, input }) => {
      const createdActivity = await activityService.createActivity(
        ctx.user.id,
        input
      )
      return createdActivity
    }),

  getActivitiesByDateRange: authedProcedure
    .input(
      z.object({
        startDate: z.string().refine(isValidDateString, {
          message: 'Invalid start date format. Use YYYY-MM-DD',
        }),
        endDate: z.string().refine(isValidDateString, {
          message: 'Invalid end date format. Use YYYY-MM-DD',
        }),
      })
    )
    .query(async ({ ctx, input }) => {
      const activities = await activityService.getActivitiesByDateRange(
        ctx.user.id,
        input.startDate,
        input.endDate
      )
      return activities
    }),
})
