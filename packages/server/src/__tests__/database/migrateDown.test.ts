/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'fs/promises'
import { Dirent } from 'fs'
import path from 'path'
import { Kysely } from 'kysely'
import { migrateDown } from '../../database/migrations/migrateDown'
import { Database } from '../../models/database'

vi.mock('fs/promises')

describe('migrateDown', () => {
  let db: Kysely<Database>
  let consoleLogSpy: unknown
  let consoleWarnSpy: unknown

  beforeEach(() => {
    db = {} as Kysely<Database>
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should run the latest migration script', async () => {
    const migrationFiles = ['20240721210324_initial_setup.ts']
    vi.mocked(fs.readdir).mockResolvedValue(
      migrationFiles as unknown as Dirent[]
    )

    const downMigration = vi.fn()
    vi.doMock(
      '../../database/migrations/migrationScripts/20240721210324_initial_setup.ts',
      () => ({
        down: downMigration,
      })
    )

    await migrateDown(db)

    expect(fs.readdir).toHaveBeenCalledWith(
      path.join(__dirname, '../../database/migrations/migrationScripts')
    )
    expect(downMigration).toHaveBeenCalledWith(db)
    expect(consoleLogSpy).toHaveBeenCalledWith(
      'Running down migration for: 20240721210324_initial_setup.ts'
    )
    expect(consoleLogSpy).toHaveBeenCalledWith(
      'Successfully reverted migration: 20240721210324_initial_setup.ts'
    )
  })

  it('should log a message if there are no migrations to revert', async () => {
    vi.mocked(fs.readdir).mockResolvedValue([] as unknown as Dirent[])

    await migrateDown(db)

    expect(consoleLogSpy).toHaveBeenCalledWith('No migrations to revert.')
  })
})
