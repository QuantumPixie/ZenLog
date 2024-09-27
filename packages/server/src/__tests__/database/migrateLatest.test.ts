import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  vi,
} from 'vitest'
import { Kysely, sql } from 'kysely'
import type { Database } from '../../models/database'
import { migrate } from '../../database/migrations/migrateLatest'
import { db } from '../../database'

describe('migrateLatest', () => {
  let testDb: Kysely<Database>

  beforeAll(async () => {
    testDb = db
  })

  afterAll(async () => {
    await testDb.destroy()
  })

  beforeEach(async () => {
    // Drop all tables in reverse order to handle dependencies
    const tables = ['activities', 'journal_entries', 'moods', 'users']
    for (const table of tables) {
      await testDb.schema.dropTable(table).ifExists().cascade().execute()
    }
  })

  async function tableExists(tableName: string): Promise<boolean> {
    const result = await sql<{ exists: boolean }>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = ${tableName}
      )`.execute(testDb)
    return result.rows[0]?.exists ?? false
  }

  it('should run migrations and create expected tables', async () => {
    await migrate(testDb)

    // Check if tables exist
    const tables = ['users', 'moods', 'journal_entries', 'activities']
    for (const table of tables) {
      const exists = await tableExists(table)
      expect(exists).toBe(true)
    }
  })

  it('should handle repeated migrations gracefully', async () => {
    // Run migrations twice
    await migrate(testDb)
    await migrate(testDb)

    // Check if tables still exist and no errors were thrown
    const tables = ['users', 'moods', 'journal_entries', 'activities']
    for (const table of tables) {
      const exists = await tableExists(table)
      expect(exists).toBe(true)
    }
  })

  it('should log the start and completion of migrations', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    await migrate(testDb)

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('Running migration:')
    )
    expect(consoleLogSpy).toHaveBeenCalledWith('All migrations have been run.')

    consoleLogSpy.mockRestore()
  })

  it('should throw an error if DATABASE_URL is not set when run as a script', async () => {
    const originalEnv = process.env
    process.env = { ...originalEnv, DATABASE_URL: undefined }

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    const processExitSpy = vi
      .spyOn(process, 'exit')
      .mockImplementation(() => undefined as never)

    try {
      await import('../../database/migrations/migrateLatest')
    } catch (error) {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('DATABASE_URL environment variable is not set')
      )
      expect(processExitSpy).toHaveBeenCalledWith(1)
    } finally {
      process.env = originalEnv
      consoleErrorSpy.mockRestore()
      processExitSpy.mockRestore()
    }
  })
})
