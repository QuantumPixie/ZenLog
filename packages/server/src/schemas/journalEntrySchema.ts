import { z } from 'zod';

export const journalEntrySchema = z.object({
  id: z.number().int().optional(),
  user_id: z.number().int(),
  date: z.date(),
  entry: z.string(),
  sentiment: z.number().int(),
});
