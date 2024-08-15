import { vi } from 'vitest'
import type { Kysely } from 'kysely'
import type { Database } from '../../models/database'

export type MockDatabase = Partial<Kysely<Database>> & {
  insert: (data: { id: number }) => void
  find: (id: number) => object | undefined
}

export function createMockDatabase(): MockDatabase {
  let insertedData: { id: number } | undefined

  const mockQueryBuilder = {
    select: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    execute: vi.fn().mockResolvedValue([]),
    executeTakeFirst: vi.fn().mockResolvedValue({}),
    executeTakeFirstOrThrow: vi.fn().mockResolvedValue({}),
    returning: vi.fn().mockReturnThis(),
    returningAll: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
  }

  return {
    selectFrom: vi.fn().mockReturnValue(mockQueryBuilder),
    insertInto: vi.fn().mockReturnValue(mockQueryBuilder),
    updateTable: vi.fn().mockReturnValue(mockQueryBuilder),
    deleteFrom: vi.fn().mockReturnValue(mockQueryBuilder),
    transaction: vi.fn().mockImplementation((cb) => cb(mockQueryBuilder)),
    destroy: vi.fn().mockResolvedValue(undefined),
    insert: (data: { id: number }) => {
      insertedData = data
    },
    find: (id: number) => {
      if (insertedData && insertedData.id === id) {
        return insertedData
      }
      return undefined
    },
  }
}

export const mockKysely: MockDatabase = createMockDatabase()
