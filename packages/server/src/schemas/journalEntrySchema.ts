import { z } from 'zod'

export const isValidDateString = (dateString: string): boolean => {
  const date = new Date(dateString)
  return (
    !isNaN(date.getTime()) &&
    (/^\d{4}-\d{2}-\d{2}$/.test(dateString) ||
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/.test(dateString))
  )
}

export const journalEntrySchema = z.object({
  id: z.number().int().optional(),
  user_id: z.number().int(),
  date: z.string().refine(isValidDateString, {
    message: 'Invalid date format. Use YYYY-MM-DD or ISO 8601 format.',
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
