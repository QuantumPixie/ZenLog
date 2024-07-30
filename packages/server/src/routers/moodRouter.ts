import { router, procedure } from '../trpc';
import { z } from 'zod';
import { moodService } from '../services/moodService';
import { moodSchema } from '../schemas/moodSchema';

const dateRangeSchema = z.object({
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Start date must be a valid date string',
  }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'End date must be a valid date string',
  }),
});

export const moodRouter = router({
  getMoods: procedure
    .input(z.object({ user_id: z.number().int() }))
    .query(async ({ input }) => {
      const moods = await moodService.getMoods(input.user_id);
      return moods;
    }),

  createMood: procedure
    .input(moodSchema.omit({ id: true, user_id: true }).extend({
      user_id: z.number()
    }))
    .mutation(async ({ input }) => {
      const mood = await moodService.createMood(input.user_id, input);
      return mood;
    }),

  getMoodsByDateRange: procedure
    .input(dateRangeSchema.extend({ user_id: z.number().int() }))
    .query(async ({ input }) => {
      const moods = await moodService.getMoodsByDateRange(input.user_id, input.startDate, input.endDate);
      return moods;
    }),
});