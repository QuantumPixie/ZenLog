import { describe, it, expect } from 'vitest'
import type { ColumnType } from 'kysely'
import type {
  JournalEntryTable,
  NewJournalEntry,
} from '../../models/journalEntry'

describe('Journal Entry Model', () => {
  it('should have correct structure for JournalEntryTable', () => {
    const journalEntry: JournalEntryTable = {
      id: {} as ColumnType<number, number | undefined, never>,
      user_id: 1,
      date: '2023-08-04',
      entry: 'Today was a great day!',
      sentiment: 8,
    }

    expect(journalEntry).toHaveProperty('id')
    expect(journalEntry).toHaveProperty('user_id')
    expect(journalEntry).toHaveProperty('date')
    expect(journalEntry).toHaveProperty('entry')
    expect(journalEntry).toHaveProperty('sentiment')

    expect(typeof journalEntry.user_id).toBe('number')
    expect(typeof journalEntry.date).toBe('string')
    expect(typeof journalEntry.entry).toBe('string')
    expect(typeof journalEntry.sentiment).toBe('number')
  })

  it('should allow new journal entry without id', () => {
    const newJournalEntry: NewJournalEntry = {
      user_id: 1,
      date: '2023-08-04',
      entry: 'I learned something new today!',
      sentiment: 7,
    }

    expect(newJournalEntry).not.toHaveProperty('id')
    expect(newJournalEntry).toHaveProperty('user_id')
    expect(newJournalEntry).toHaveProperty('date')
    expect(newJournalEntry).toHaveProperty('entry')
    expect(newJournalEntry).toHaveProperty('sentiment')
  })
})
