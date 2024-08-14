import { vi } from 'vitest'
import type { Kysely } from 'kysely'
import type { Database } from '../../models/database'

export type MockDatabase = Partial<Kysely<Database>> & {
  insert: (data: { id: number }) => void
  find: (id: number) => object | undefined
}

export function createMockDatabase(): MockDatabase {
  let insertedData: { id: number } | undefined

  return {
    selectFrom: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      execute: vi.fn().mockResolvedValue([]),
      executeTakeFirst: vi.fn().mockResolvedValue({}),
    }),
    insertInto: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockReturnThis(),
      executeTakeFirstOrThrow: vi.fn().mockResolvedValue({}),
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
