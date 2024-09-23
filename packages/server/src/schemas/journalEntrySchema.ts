import { z } from 'zod'

export const journalEntrySchema = z.object({
  id: z.number().int().optional(),
  user_id: z.number().int(),
  date: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
    message: 'Date must be a valid date string',
  }),
  entry: z
    .string()
    .min(1, 'Entry cannot be empty')
    .max(5000, 'Entry cannot exceed 5000 characters')
    .refine(
      (value) => {
        const words = value.toLowerCase().split(/\s+/)
        const uniqueWords = new Set(words)
        return uniqueWords.size > words.length * 0.3 // At least 30% unique words
      },
      {
        message: 'Entry seems to contain repetitive or meaningless text',
      }
    ),
  sentiment: z.number().min(1).max(10),
})

export type NewJournalEntry = z.infer<typeof journalEntrySchema>
