import { router, authedProcedure } from '../trpc';
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
  getMoods: authedProcedure
    .query(async ({ ctx }) => {
      const moods = await moodService.getMoods(ctx.user.id);
      return moods;
    }),

  createMood: authedProcedure
    .input(moodSchema.omit({ id: true, user_id: true }))
    .mutation(async ({ ctx, input }) => {
      const mood = await moodService.createMood(ctx.user.id, input);
      return mood;
    }),

  getMoodsByDateRange: authedProcedure
    .input(dateRangeSchema)
    .query(async ({ ctx, input }) => {
      const moods = await moodService.getMoodsByDateRange(ctx.user.id, input.startDate, input.endDate);
      return moods;
    }),
});