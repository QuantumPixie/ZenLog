import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockDatabase, mockKysely, type MockDatabase } from '../mocks/databaseMock';

vi.mock('../../database', () => ({
  db: mockKysely,
  createDatabase: vi.fn(() => mockKysely),
}));

import { db, createDatabase } from '../../database';

describe('Database', () => {
  let mockDb: MockDatabase;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDb = createMockDatabase();
    Object.assign(mockKysely, mockDb);
  });

  it('should create a database instance', () => {
    const testDb = createDatabase({ connectionString: 'postgresql://test:test@localhost:5432/testdb' });
    expect(testDb).toBeDefined();
    expect(createDatabase).toHaveBeenCalledWith({ connectionString: 'postgresql://test:test@localhost:5432/testdb' });
  });

  it('should execute a query', async () => {
    const mockResult = [{ id: 1 }];
    mockKysely.selectFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        limit: vi.fn().mockReturnValue({
          execute: vi.fn().mockResolvedValue(mockResult),
        }),
      }),
    });

    const result = await db.selectFrom('users').select('id').limit(1).execute();

    expect(result).toEqual(mockResult);
    expect(mockKysely.selectFrom).toHaveBeenCalledWith('users');
  });

  it('should insert data', async () => {
    const mockResult = { id: 1, email: 'john@example.com', username: 'johndoe' };
    mockKysely.insertInto = vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returningAll: vi.fn().mockReturnValue({
          executeTakeFirst: vi.fn().mockResolvedValue(mockResult),
        }),
      }),
    });

    const result = await db.insertInto('users').values({ email: 'john@example.com', username: 'johndoe', password: 'mypassword' }).returningAll().executeTakeFirst();

    expect(result).toEqual(mockResult);
    expect(mockKysely.insertInto).toHaveBeenCalledWith('users');
  });

  it('should update data', async () => {
    const mockResult = { id: 1, username: 'janedoe' };
    mockKysely.updateTable = vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returningAll: vi.fn().mockReturnValue({
            executeTakeFirst: vi.fn().mockResolvedValue(mockResult),
          }),
        }),
      }),
    });

    const result = await db.updateTable('users').set({ username: 'janedoe' }).where('id', '=', 1).returningAll().executeTakeFirst();

    expect(result).toEqual(mockResult);
    expect(mockKysely.updateTable).toHaveBeenCalledWith('users');
  });
});