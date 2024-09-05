import { describe, it, expect } from 'vitest'
import type { Database } from '../../models/database'
import type { UserTable } from '../../models/user'
import type { MoodTable } from '../../models/mood'
import type { JournalEntryTable } from '../../models/journalEntry'
import type { ActivityTable } from '../../models/activity'

describe('Database Interface', () => {
  it('should have correct structure', () => {
    const mockDatabase: Database = {
      users: {} as UserTable,
      moods: {} as MoodTable,
      journal_entries: {} as JournalEntryTable,
      activities: {} as ActivityTable,
    }

    expect(mockDatabase).toHaveProperty('users')
    expect(mockDatabase).toHaveProperty('moods')
    expect(mockDatabase).toHaveProperty('journal_entries')
    expect(mockDatabase).toHaveProperty('activities')
  })

  it('should not allow additional properties', () => {
    const mockDatabase: Database = {
      users: {} as UserTable,
      moods: {} as MoodTable,
      journal_entries: {} as JournalEntryTable,
      activities: {} as ActivityTable,
    }

    // @ts-expect-error
    mockDatabase.extraProperty = 'This should cause a TypeScript error'
    expect(true).toBe(true)
  })
})
