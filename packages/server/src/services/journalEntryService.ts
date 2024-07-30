import { db } from '../database';
import type {  NewJournalEntry } from '../models/journalEntry';
import { sentimentService } from './sentimentService';

export const journalEntryService = {
  async createJournalEntry(userId: number, entryData: Omit<NewJournalEntry, 'user_id' | 'sentiment'>) {
    const sentimentResult = sentimentService.analyze(entryData.entry);
    const newEntry: NewJournalEntry = {
      ...entryData,
      user_id: userId,
      sentiment: sentimentResult.score,
    };

    return db
      .insertInto('journal_entries')
      .values(newEntry)
      .returning(['id', 'date', 'entry', 'sentiment'])
      .executeTakeFirst();
  },

  async getJournalEntries(userId: number) {
    return db
      .selectFrom('journal_entries')
      .select(['id', 'date', 'entry', 'sentiment'])
      .where('user_id', '=', userId)
      .orderBy('date', 'desc')
      .execute();
  },

  async getJournalEntriesByDateRange(userId: number, startDate: string, endDate: string) {
    return db
      .selectFrom('journal_entries')
      .select(['id', 'date', 'entry', 'sentiment'])
      .where('user_id', '=', userId)
      .where('date', '>=', new Date(startDate))
      .where('date', '<=', new Date(endDate))
      .orderBy('date', 'asc')
      .execute();
  },
};