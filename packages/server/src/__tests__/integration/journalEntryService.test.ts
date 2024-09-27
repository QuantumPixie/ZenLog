import { describe, it, expect, beforeEach } from 'vitest'
import { wrapInRollbacks } from './transactions/transactions'
import { journalEntryService } from '../../services/journalEntryService'
import { createUser } from '../../services/userService'
import { generateFakeUser } from './helperFunctions/userFactory'
import { generateFakeJournalEntries } from './helperFunctions/journalEntryFactory'
import { testDb } from '../integration/transactions/testSetup'
import { Kysely } from 'kysely'
import { Database } from '../../models/database'

describe('Journal Entry Service Integration Tests', () => {
  let db: Kysely<Database>
  let userId: number

  beforeEach(async () => {
    db = (await wrapInRollbacks(testDb)) as Kysely<Database>
    const fakeUser = generateFakeUser()
    const { user } = await createUser(fakeUser, db)
    userId = user.id
  })

  it('should create and retrieve a journal entry', async () => {
    const [newEntry] = generateFakeJournalEntries(userId, 1)

    const createdEntry = await journalEntryService.createJournalEntry(
      userId,
      newEntry,
      db
    )

    expect(createdEntry?.id).toBeDefined()
    expect(createdEntry?.entry).toBe(newEntry.entry)
    expect(createdEntry?.sentiment).toBeDefined()

    const retrievedEntries = await journalEntryService.getJournalEntries(
      userId,
      db
    )

    expect(retrievedEntries).toHaveLength(1)
    expect(retrievedEntries[0]).toMatchObject({
      id: createdEntry?.id,
      entry: createdEntry?.entry,
      sentiment: expect.any(String),
    })
    expect(retrievedEntries[0].date).toBeDefined()
  })

  it('should get journal entries by date range', async () => {
    const entries = generateFakeJournalEntries(userId, 3)

    for (const entry of entries) {
      await journalEntryService.createJournalEntry(userId, entry, db)
    }

    const startDate = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    ).toISOString() // 7 days ago
    const endDate = new Date().toISOString() // now

    const retrievedEntries =
      await journalEntryService.getJournalEntriesByDateRange(
        userId,
        startDate,
        endDate,
        db
      )

    expect(retrievedEntries.length).toBeGreaterThan(0)
    expect(retrievedEntries.length).toBeLessThanOrEqual(entries.length)

    retrievedEntries.forEach((entry) => {
      expect(entry).toHaveProperty('id')
      expect(entry).toHaveProperty('date')
      expect(entry).toHaveProperty('entry')
      expect(entry).toHaveProperty('sentiment')
    })
  })

  it('should throw an error for invalid date format', async () => {
    const invalidEntry = {
      ...generateFakeJournalEntries(userId, 1)[0],
      date: '2024-08-01', // Invalid format, missing time
    }

    await expect(
      journalEntryService.createJournalEntry(userId, invalidEntry, db)
    ).rejects.toThrow('Invalid date format')
  })
})
