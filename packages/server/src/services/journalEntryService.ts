import { db } from '../database/index'
import type { NewJournalEntry } from '../models/journalEntry'
import { analyze } from './sentimentService'

export const journalEntryService = {
  async createJournalEntry(
    userId: number,
    entryData: Omit<NewJournalEntry, 'id' | 'user_id'> & { sentiment: number }
  ) {
    const sentimentResult = await analyze(entryData.entry)
    const newEntry: NewJournalEntry = {
      ...entryData,
      user_id: userId,
      sentiment: sentimentResult,
    }

    return db
      .insertInto('journal_entries')
      .values(newEntry)
      .returning(['id', 'date', 'entry', 'sentiment'])
      .executeTakeFirst()
  },

  async getJournalEntries(userId: number) {
    return db
      .selectFrom('journal_entries')
      .select(['id', 'date', 'entry', 'sentiment'])
      .where('user_id', '=', userId)
      .orderBy('date', 'desc')
      .execute()
  },

  async getJournalEntriesByDateRange(
    userId: number,
    startDate: string,
    endDate: string
  ) {
    return db
      .selectFrom('journal_entries')
      .select(['id', 'date', 'entry', 'sentiment'])
      .where('user_id', '=', userId)
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .orderBy('date', 'asc')
      .execute()
  },
}
