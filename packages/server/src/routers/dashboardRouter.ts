import { router, procedure } from '../trpc';
import { z } from 'zod';
import { dashboardService } from '../services/dashboardService';

export const dashboardRouter = router({
  getSummary: procedure
    .input(z.object({ user_id: z.number().int() }))
    .query(async ({ input }) => {
      const summary = await dashboardService.getSummary(input.user_id);
      return summary;
    }),
});