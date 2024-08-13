import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll } from 'vitest';
import { setupTestDatabase, cleanupTestDatabase, teardownTestDatabase } from '../setupTestDatabase';
import { journalEntryService } from '../../services/journalEntryService';
import { createUser } from '../../services/userService';

describe('Journal Entry Service Integration Tests', () => {
  let userId: number;

  beforeAll(async () => {
    await setupTestDatabase();
  });

  beforeEach(async () => {
    const user = await createUser({ email: 'test@example.com', username: 'testuser', password: 'password123' });
    userId = user.id;
  });

  afterEach(async () => {
    await cleanupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  it('should create and retrieve a journal entry', async () => {
    const newEntry = {
      date: '2024-08-01',
      entry: 'Today was a great day!',
    };

    const createdEntry = await journalEntryService.createJournalEntry(userId, newEntry);
expect(createdEntry?.id).toBeDefined();
expect(createdEntry?.entry).toBe(newEntry.entry);
expect(createdEntry?.sentiment).toBeDefined();

const retrievedEntries = await journalEntryService.getJournalEntries(userId);
expect(retrievedEntries).toHaveLength(1);
expect(retrievedEntries[0]).toMatchObject({
  id: createdEntry?.id,
  date: expect.any(Date),
  entry: createdEntry?.entry,
  // Matches a string that represents a number as sentiment is returned as a string
      sentiment: expect.stringMatching(/^\d+(\.\d+)?$/)
    });
  });

  it('should get journal entries by date range', async () => {
    const entries = [
      { date: '2024-08-01', entry: 'First entry' },
      { date: '2024-08-02', entry: 'Second entry' },
      { date: '2024-08-03', entry: 'Third entry' },
    ];

    for (const entry of entries) {
      await journalEntryService.createJournalEntry(userId, entry);
    }

    const retrievedEntries = await journalEntryService.getJournalEntriesByDateRange(userId, '2024-08-01', '2024-08-02');
    expect(retrievedEntries).toHaveLength(2);
    expect(retrievedEntries[0].entry).toBe('First entry');
    expect(retrievedEntries[1].entry).toBe('Second entry');
  });
});