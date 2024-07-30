import { vi } from 'vitest';
import type { Mock } from 'vitest';
import type { Kysely } from 'kysely';
import type { Database } from '../../models/database';

type MockDatabaseMethods = {
  insert: Mock;
  update: Mock;
  delete: Mock;
  selectFrom: Mock;
};

export type MockDatabase = {
  [K in keyof Database]: MockDatabaseMethods;
};

export function createMockDatabase(): MockDatabase {
  const createMockMethods = (): MockDatabaseMethods => ({
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    selectFrom: vi.fn(),
  });

  return {
    users: createMockMethods(),
    moods: createMockMethods(),
    journal_entries: createMockMethods(),
    activities: createMockMethods(),
  };
}

export const mockKysely: Kysely<Database> = {
  selectFrom: vi.fn(),
  insertInto: vi.fn(),
  updateTable: vi.fn(),
  deleteFrom: vi.fn(),
  transaction: vi.fn(),
  // Add other Kysely methods as needed
} as unknown as Kysely<Database>;