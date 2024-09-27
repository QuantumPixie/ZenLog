import type { Kysely } from 'kysely'
import { db } from '../database/index'
import type { Database } from '../database/index'
import type { NewJournalEntry } from '../models/journalEntry'
import { analyze } from './sentimentService'
import {
  journalEntrySchema,
  isValidDateString,
} from '../schemas/journalEntrySchema'

export const journalEntryService = {
  async createJournalEntry(
    userId: number,
    entryData: Omit<NewJournalEntry, 'id' | 'user_id' | 'sentiment'>,
    dbInstance: Kysely<Database> = db
  ) {
    const sentiment = await analyze(entryData.entry)
    const newEntry: NewJournalEntry = {
      ...entryData,
      user_id: userId,
      sentiment,
    }

    // Validate the entry data
    const validatedEntry = journalEntrySchema.parse(newEntry)

    return dbInstance
      .insertInto('journal_entries')
      .values({
        ...validatedEntry,
        sentiment: Number(validatedEntry.sentiment),
      })
      .returning(['id', 'date', 'entry', 'sentiment'])
      .executeTakeFirst()
  },

  async getJournalEntries(userId: number, dbInstance: Kysely<Database> = db) {
    return dbInstance
      .selectFrom('journal_entries')
      .select(['id', 'date', 'entry', 'sentiment'])
      .where('user_id', '=', userId)
      .orderBy('date', 'desc')
      .execute()
  },

  async getJournalEntriesByDateRange(
    userId: number,
    startDate: string,
    endDate: string,
    dbInstance: Kysely<Database> = db
  ) {
    // Validate date format
    if (!isValidDateString(startDate) || !isValidDateString(endDate)) {
      throw new Error(
        'Invalid date format. Use ISO 8601 format (e.g., "2024-08-26T00:00:00.000Z")'
      )
    }

    return dbInstance
      .selectFrom('journal_entries')
      .select(['id', 'date', 'entry', 'sentiment'])
      .where('user_id', '=', userId)
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .orderBy('date', 'asc')
      .execute()
  },
}
