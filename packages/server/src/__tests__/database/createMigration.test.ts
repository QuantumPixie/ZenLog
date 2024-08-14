import fs from 'fs'
import path from 'path'
import { describe, it, expect, vi, afterEach } from 'vitest'

vi.mock('fs')
vi.mock('path')

describe('createMigration', () => {
  afterEach(() => {
    vi.resetAllMocks()
    vi.useRealTimers()
  })

  it('should create a migration file with the correct name and content', async () => {
    const mockDate = new Date('2023-01-01T00:00:00Z')
    vi.setSystemTime(mockDate)

    const mockMigrationDir = '/mock/migration/dir'
    vi.mocked(path.join).mockReturnValue(mockMigrationDir)
    vi.mocked(fs.existsSync).mockReturnValue(false)

    await import('../../database/migrations/createMigration')

    expect(fs.mkdirSync).toHaveBeenCalledWith(mockMigrationDir)
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      mockMigrationDir,
      expect.stringContaining("import db from '../config/database';")
    )
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      mockMigrationDir,
      expect.stringContaining('export async function up()')
    )
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      mockMigrationDir,
      expect.stringContaining('export async function down()')
    )
  })
})
