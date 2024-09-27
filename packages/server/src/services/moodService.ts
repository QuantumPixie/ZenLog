import { db } from '../database/index'
import type { Database } from '../database/index'
import type { MoodTable } from '../models/mood'
import type { Kysely } from 'kysely'
import { isValidDateString, moodSchema } from '../schemas/moodSchema'
import { ZodError } from 'zod'

export const moodService = {
  async getMoods(userId: number, dbInstance: Kysely<Database> = db) {
    const moods = await dbInstance
      .selectFrom('moods')
      .select(['id', 'date', 'mood_score', 'emotions'])
      .where('user_id', '=', userId)
      .orderBy('date', 'desc')
      .execute()

    return moods
  },

  async createMood(
    userId: number,
    moodData: Omit<MoodTable, 'id' | 'user_id'>,
    dbInstance: Kysely<Database> = db
  ) {
    try {
      const validatedMood = moodSchema.parse({ ...moodData, user_id: userId })

      const createdMood = await dbInstance
        .insertInto('moods')
        .values(validatedMood)
        .returning(['id', 'date', 'mood_score', 'emotions'])
        .executeTakeFirst()

      if (!createdMood) {
        throw new Error('Failed to create mood')
      }

      return createdMood
    } catch (error) {
      if (error instanceof ZodError) {
        // Handle Zod validation errors
        const errorMessages = error.errors.map((err) => err.message).join(', ')
        throw new Error(`Validation error: ${errorMessages}`)
      }
      throw error
    }
  },

  async getMoodsByDateRange(
    userId: number,
    startDate: string,
    endDate: string,
    dbInstance: Kysely<Database> = db
  ) {
    if (!isValidDateString(startDate) || !isValidDateString(endDate)) {
      throw new Error('Invalid date format for date range')
    }

    const moods = await dbInstance
      .selectFrom('moods')
      .select(['id', 'date', 'mood_score', 'emotions'])
      .where('user_id', '=', userId)
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .orderBy('date', 'asc')
      .execute()

    return moods
  },
}
