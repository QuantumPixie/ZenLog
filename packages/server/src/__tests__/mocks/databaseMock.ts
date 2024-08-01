import { vi } from 'vitest';
import type { Kysely } from 'kysely';
import type { Database } from '../../models/database';

export type MockDatabase = Partial<Kysely<Database>>;

export function createMockDatabase(): MockDatabase {
  return {
    selectFrom: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      execute: vi.fn(),
      executeTakeFirst: vi.fn(),
    }),
    insertInto: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockReturnThis(),
      execute: vi.fn(),
      executeTakeFirst: vi.fn(),
    }),
    updateTable: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      execute: vi.fn(),
    }),
    deleteFrom: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnThis(),
      execute: vi.fn(),
    }),
    transaction: vi.fn(),
  };
}

export const mockKysely: MockDatabase = createMockDatabase();
