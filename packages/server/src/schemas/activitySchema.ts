import { z } from 'zod'

/**
 * Validates if the input string is a valid date in ISO 8601 format.
 *
 * @param {string} dateString - The date string to validate.
 * @return {boolean} Returns true if the input string is a valid date, false otherwise.
 */
export const isValidDateString = (dateString: string): boolean => {
  const date = new Date(dateString)
  return !isNaN(date.getTime()) && dateString === date.toISOString()
}

export const activityInputSchema = z.object({
  date: z.string().refine(isValidDateString, {
    message:
      'Invalid date format. Use ISO 8601 format (e.g., "2024-08-26T00:00:00.000Z")',
  }),
  activity: z.string(),
  duration: z.number().optional(),
  notes: z.string().optional(),
})

export const activitySchema = activityInputSchema.extend({
  id: z.number(),
  user_id: z.number(),
})

export type ActivityInputSchema = z.infer<typeof activityInputSchema>
export type ActivitySchema = z.infer<typeof activitySchema>
