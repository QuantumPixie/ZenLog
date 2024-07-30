import { z }  from 'zod';

export const moodSchema = z.object({
    id: z.number().int(),
    user_id: z.number().int(),
    date: z.date(),
    mood_score: z.number().min(1).max(10),
    emotions: z.array(z.string()),
});