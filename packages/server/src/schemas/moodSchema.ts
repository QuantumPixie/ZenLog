import { z } from 'zod'

export const isValidDateString = (dateString: string): boolean => {
  const date = new Date(dateString)

  if (isNaN(date.getTime())) {
    return false
  }

  const isoString = date.toISOString()
  return dateString === isoString
}

export const moodSchema = z.object({
  id: z.number().int().optional(),
  user_id: z.number().int(),
  date: z.string().refine(isValidDateString, {
    message:
      'Invalid date format. Use ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ).',
  }),
  mood_score: z.number().int().min(1).max(10),
  emotions: z.array(z.string()).nonempty(),
})
