import { z } from 'zod'
import { router, authedProcedure } from '../trpc'
import { journalEntryService } from '../services/journalEntryService'
import { journalEntrySchema } from '../schemas/journalEntrySchema'

const dateRangeSchema = z.object({
  startDate: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
    message: 'Start date must be a valid date string',
  }),
  endDate: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
    message: 'End date must be a valid date string',
  }),
})

export const journalEntryRouter = router({
  getJournalEntries: authedProcedure.query(async ({ ctx }) => {
    const entries = await journalEntryService.getJournalEntries(ctx.user.id)
    return entries
  }),

  createJournalEntry: authedProcedure
    .input(
      journalEntrySchema.omit({ id: true, user_id: true, sentiment: true })
    )
    .mutation(async ({ ctx, input }) => {
      const entry = await journalEntryService.createJournalEntry(
        ctx.user.id,
        input
      )
      return entry
    }),

  getJournalEntriesByDateRange: authedProcedure
    .input(dateRangeSchema)
    .query(async ({ ctx, input }) => {
      const entries = await journalEntryService.getJournalEntriesByDateRange(
        ctx.user.id,
        input.startDate,
        input.endDate
      )
      return entries
    }),
})
