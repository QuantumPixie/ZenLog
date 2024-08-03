import { z } from 'zod';

/**
 * Validates if the input string is a valid date in the format YYYY-MM-DD.
 *
 * @param {string} dateString - The date string to validate.
 * @return {boolean} Returns true if the input string is a valid date, false otherwise.
 */
export const isValidDateString = (dateString: string) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

export const activityInputSchema = z.object({
  date: z.string().refine(isValidDateString, { message: "Invalid date format. Use YYYY-MM-DD" }),
  activity: z.string(),
  duration: z.number().optional(),
  notes: z.string().optional(),
});

export const activitySchema = activityInputSchema.extend({
  id: z.number(),
  user_id: z.number(),
});

export type ActivityInputSchema = z.infer<typeof activityInputSchema>;
export type ActivitySchema = z.infer<typeof activitySchema>;