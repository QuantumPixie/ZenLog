import { router, procedure } from '../trpc';
import { z } from 'zod';
import { activityService } from '../services/activityService';
import { activityInputSchema, isValidDateString } from '../schemas/activitySchema';

export const activityRouter = router({
  getActivities: procedure
    .input(z.object({ user_id: z.number() }))
    .query(async ({ input }) => {
      const activities = await activityService.getActivities(input.user_id);
      return activities;
    }),

  getActivityById: procedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const activity = await activityService.getActivityById(input.id);
      if (!activity) {
        throw new Error('Activity not found');
      }
      return activity;
    }),

  createActivity: procedure
    .input(z.object({
      user_id: z.number(),
      activity: activityInputSchema,
    }))
    .mutation(async ({ input }) => {
      const createdActivity = await activityService.createActivity(input.user_id, input.activity);
      return createdActivity;
    }),

  getActivitiesByDateRange: procedure
    .input(z.object({
      user_id: z.number(),
      startDate: z.string().refine(isValidDateString, { message: "Invalid start date format. Use YYYY-MM-DD" }),
      endDate: z.string().refine(isValidDateString, { message: "Invalid end date format. Use YYYY-MM-DD" }),
    }))
    .query(async ({ input }) => {
      const activities = await activityService.getActivitiesByDateRange(
        input.user_id,
        input.startDate,
        input.endDate
      );
      return activities;
    }),
});