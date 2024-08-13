import { z } from 'zod';

export const journalEntrySchema = z.object({
  id: z.number().int().optional(),
  user_id: z.number().int(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Date must be a valid date string",
  }),
  entry: z.string(),
  sentiment: z.number().min(1).max(10),});