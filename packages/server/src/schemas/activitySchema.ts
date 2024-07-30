import { z } from 'zod';

export const activityInputSchema = z.object({
  user_id: z.number(),
  date: z.date(),
  activity: z.string(),
  duration: z.number(),
  notes: z.string().nullable(),
});

export const activitySchema = activityInputSchema.extend({
  id: z.number(),
  user_id: z.number(),
});

export type ActivitySchema = z.infer<typeof activitySchema>;
export type ActivityInputSchema = z.infer<typeof activityInputSchema>;
