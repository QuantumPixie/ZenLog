import { db } from '../database';
import type { MoodTable } from '../models/mood';

export const moodService = {
  async getMoods(userId: number) {
    return db
      .selectFrom('moods')
      .select(['id', 'date', 'mood_score', 'emotions'])
      .where('user_id', '=', userId)
      .orderBy('date', 'desc')
      .execute();
  },

  async createMood(userId: number, moodData: Omit<MoodTable, 'id' | 'user_id'>) {
    return db
      .insertInto('moods')
      .values({ ...moodData, user_id: userId })
      .returning(['id', 'date', 'mood_score', 'emotions'])
      .executeTakeFirst();
  },


  async getMoodsByDateRange(userId: number, startDate: string, endDate: string) {
    return db
      .selectFrom('moods')
      .select(['id', 'date', 'mood_score', 'emotions'])
      .where('user_id', '=', userId)
      .where('date', '>=', new Date(startDate))
      .where('date', '<=', new Date(endDate))
      .orderBy('date', 'asc')
      .execute();
  },
};