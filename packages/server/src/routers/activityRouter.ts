import { router, authedProcedure } from '../trpc';
import { z } from 'zod';
import { activityService } from '../services/activityService';
import { activityInputSchema, isValidDateString } from '../schemas/activitySchema';

export const activityRouter = router({
  getActivities: authedProcedure
    .query(async ({ ctx }) => {
      const activities = await activityService.getActivities(ctx.user.id);
      return activities;
    }),

  getActivityById: authedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const activity = await activityService.getActivityById(input.id, ctx.user.id);
      if (!activity) {
        throw new Error('Activity not found');
      }
      return activity;
    }),

    createActivity: authedProcedure
    .input(activityInputSchema)
    .mutation(async ({ ctx, input }) => {
      const createdActivity = await activityService.createActivity(ctx.user.id, input);
      return createdActivity;
    }),

  getActivitiesByDateRange: authedProcedure
    .input(z.object({
      startDate: z.string().refine(isValidDateString, { message: "Invalid start date format. Use YYYY-MM-DD" }),
      endDate: z.string().refine(isValidDateString, { message: "Invalid end date format. Use YYYY-MM-DD" }),
    }))
    .query(async ({ ctx, input }) => {
      const activities = await activityService.getActivitiesByDateRange(
        ctx.user.id,
        input.startDate,
        input.endDate
      );
      return activities;
    }),
  });