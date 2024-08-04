import { describe, it, expect } from 'vitest';
import type { Database } from '../../models/database';
import type { UserTable } from '../../models/user';
import type { MoodTable } from '../../models/mood';
import type { JournalEntryTable } from '../../models/journalEntry';
import type { ActivityTable } from '../../models/activity';

describe('Database Model', () => {
  it('should have correct structure', () => {
    const dbStructure: Database = {
      users: {} as UserTable,
      moods: {} as MoodTable,
      journal_entries: {} as JournalEntryTable,
      activities: {} as ActivityTable
    };

    expect(dbStructure).toHaveProperty('users');
    expect(dbStructure).toHaveProperty('moods');
    expect(dbStructure).toHaveProperty('journal_entries');
    expect(dbStructure).toHaveProperty('activities');
  });
});