import { router, procedure } from '../trpc';
import { z } from 'zod';
import { journalEntryService } from '../services/journalEntryService';
import { journalEntrySchema } from '../schemas/journalEntrySchema';

const dateRangeSchema = z.object({
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Start date must be a valid date string",
  }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "End date must be a valid date string",
  }),
});

export const journalEntryRouter = router({
  getJournalEntries: procedure
    .input(z.object({ user_id: z.number().int() }))
    .query(async ({ input }) => {
      const entries = await journalEntryService.getJournalEntries(input.user_id);
      return entries;
    }),

  createJournalEntry: procedure
    .input(journalEntrySchema.omit({ id: true }).extend({
      user_id: z.number()
    }))
    .mutation(async ({ input }) => {
      const entry = await journalEntryService.createJournalEntry(input.user_id, input);
      return entry;
    }),

  getJournalEntriesByDateRange: procedure
    .input(dateRangeSchema.extend({ user_id: z.number().int() }))
    .query(async ({ input }) => {
      const entries = await journalEntryService.getJournalEntriesByDateRange(input.user_id, input.startDate, input.endDate);
      return entries;
    }),
});