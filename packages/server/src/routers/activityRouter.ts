import { router, procedure } from '../trpc';
import { z } from 'zod';
import { activityService } from '../services/activityService';
import { activityInputSchema } from '../schemas/activitySchema';

export const activityRouter = router({
  getActivities: procedure
    .input(z.object({ user_id: z.number().int() }))
    .query(async ({ input }) => {
      const activities = await activityService.getActivities(input.user_id);
      return activities;
    }),

  getActivityById: procedure
    .input(z.object({ id: z.number().int() }))
    .query(async ({ input }) => {
      const activity = await activityService.getActivityById(input.id);
      if (!activity) {
        throw new Error('Activity not found');
      }
      return activity;
    }),

  createActivity: procedure
    .input(z.object({
      user_id: z.number().int(),
      activity: activityInputSchema
    }))
    .mutation(async ({ input }) => {
      const activity = await activityService.createActivity(input.user_id, input.activity);
      return activity;
    }),
});
