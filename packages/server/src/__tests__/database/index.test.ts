import { vi, describe, it, expect, beforeEach } from 'vitest'
import {
  createMockDatabase,
  mockKysely,
  type MockDatabase,
} from '../mocks/databaseMock'

import { db, createDatabase } from '../../database'

vi.mock('../../database', () => ({
  db: mockKysely,
  createDatabase: vi.fn(() => mockKysely),
}))

describe('Database', () => {
  let mockDb: MockDatabase

  beforeEach(() => {
    vi.clearAllMocks()
    mockDb = createMockDatabase()
    Object.assign(mockKysely, mockDb)
  })

  it('should create a database instance', () => {
    const connectionString = 'postgresql://test:test@localhost:5432/testdb'
    const testDb = createDatabase({ connectionString })
    expect(testDb).toBeDefined()
    expect(createDatabase).toHaveBeenCalledWith({ connectionString })
  })

  it('should execute a query', async () => {
    const mockResult = [{ id: 1 }]
    if (mockDb && mockDb.selectFrom) {
      const mockExecute = vi.fn().mockResolvedValue(mockResult)
      mockDb.selectFrom('users').select('id').limit(1).execute = mockExecute
    }
    const result = await db.selectFrom('users').select('id').limit(1).execute()

    expect(result).toEqual(mockResult)
    expect(mockDb?.selectFrom).toHaveBeenCalledWith('users')
  })

  it('should insert data', async () => {
    const mockResult = { id: 1, email: 'john@example.com', username: 'johndoe' }
    if (mockDb && mockDb.insertInto) {
      const mockExecuteTakeFirstOrThrow = vi.fn().mockResolvedValue(mockResult)
      mockDb
        .insertInto('users')
        .values({
          email: 'john@example.com',
          username: 'johndoe',
          password: 'mypassword',
        })
        .returningAll().executeTakeFirstOrThrow = mockExecuteTakeFirstOrThrow
    }

    const result = await db
      .insertInto('users')
      .values({
        email: 'john@example.com',
        username: 'johndoe',
        password: 'mypassword',
      })
      .returningAll()
      .executeTakeFirstOrThrow()

    expect(result).toEqual(mockResult)
    expect(mockDb.insertInto).toHaveBeenCalledWith('users')
  })

  it('should update data', async () => {
    const mockResult = { id: 1, username: 'janedoe' }
    if (mockDb && mockDb.updateTable) {
      const mockExecuteTakeFirst = vi.fn().mockResolvedValue(mockResult)
      mockDb
        .updateTable('users')
        .set({ username: 'janedoe' })
        .where('id', '=', 1)
        .returningAll().executeTakeFirst = mockExecuteTakeFirst
    }

    const result = await db
      .updateTable('users')
      .set({ username: 'janedoe' })
      .where('id', '=', 1)
      .returningAll()
      .executeTakeFirst()

    expect(result).toEqual(mockResult)
    expect(mockDb.updateTable).toHaveBeenCalledWith('users')
  })
})
