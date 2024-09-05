import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Kysely, sql } from 'kysely'
import * as migrationModule from '../../../database/migrations/migrationScripts/20240721210324_initial_setup'
import type { Database } from '../../../models/database'

describe('20240721210324_initial_setup migration', () => {
  let mockDb: Kysely<Database>
  let mockSchema: any
  let mockSelectFrom: any

  beforeEach(() => {
    mockSchema = {
      createTable: vi.fn(() => ({
        addColumn: vi.fn().mockReturnThis(),
        addUniqueConstraint: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue(undefined),
      })),
      createIndex: vi.fn(() => ({
        on: vi.fn().mockReturnThis(),
        columns: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue(undefined),
      })),
      dropIndex: vi.fn(() => ({ execute: vi.fn().mockResolvedValue(undefined) })),
      dropTable: vi.fn(() => ({ execute: vi.fn().mockResolvedValue(undefined) })),
    }

    mockSelectFrom = vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      executeTakeFirst: vi.fn().mockResolvedValue({ exists: false }),
    }))

    mockDb = {
      schema: mockSchema,
      selectFrom: mockSelectFrom,
    } as unknown as Kysely<Database>
  })

  describe('tableExists and indexExists', () => {
    it('should check if an index exists', async () => {
      mockSelectFrom().executeTakeFirst.mockResolvedValue({ exists: false })
      const result = await migrationModule.indexExists(mockDb, 'test_index')
      expect(result).toBe(false)
      expect(mockSelectFrom).toHaveBeenCalled()
    })
  })

  describe('up function', () => {
    it('should create tables if they do not exist', async () => {
      mockSelectFrom().executeTakeFirst.mockResolvedValue({ exists: false })

      await migrationModule.up(mockDb)

      expect(mockSchema.createTable).toHaveBeenCalledWith('users')
      expect(mockSchema.createTable).toHaveBeenCalledWith('moods')
      expect(mockSchema.createTable).toHaveBeenCalledWith('journal_entries')
      expect(mockSchema.createTable).toHaveBeenCalledWith('activities')
    })

    it('should create indexes if they do not exist', async () => {
      mockSelectFrom().executeTakeFirst
        .mockResolvedValueOnce({ exists: true }) // tables exist
        .mockResolvedValue({ exists: false }) // indexes don't exist

      await migrationModule.up(mockDb)

      expect(mockSchema.createIndex).toHaveBeenCalledWith('moods_user_id_date_index')
      expect(mockSchema.createIndex).toHaveBeenCalledWith('journal_entries_user_id_date_index')
      expect(mockSchema.createIndex).toHaveBeenCalledWith('activities_user_id_date_index')
    })
  })

  describe('down function', () => {
    it('should drop indexes and tables', async () => {
      await migrationModule.down(mockDb)

      expect(mockSchema.dropIndex).toHaveBeenCalledWith('activities_user_id_date_index')
      expect(mockSchema.dropIndex).toHaveBeenCalledWith('journal_entries_user_id_date_index')
      expect(mockSchema.dropIndex).toHaveBeenCalledWith('moods_user_id_date_index')

      expect(mockSchema.dropTable).toHaveBeenCalledWith('activities')
      expect(mockSchema.dropTable).toHaveBeenCalledWith('journal_entries')
      expect(mockSchema.dropTable).toHaveBeenCalledWith('moods')
      expect(mockSchema.dropTable).toHaveBeenCalledWith('users')
    })
  })
})
