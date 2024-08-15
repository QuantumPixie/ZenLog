import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { Kysely } from 'kysely'
import type { Database } from '../../models/database'
import { createDatabase } from '../index'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const migrationsDir = path.join(__dirname, 'migrationScripts')

export async function migrate<T extends Database>(db: Kysely<T>) {
  const migrationFiles = await fs.readdir(migrationsDir)
  const sortedMigrationFiles = migrationFiles
    .filter((file) => file.endsWith('.ts'))
    .sort()

  sortedMigrationFiles.forEach(async (file) => {
    console.log(`Running migration: ${file}`)
    const migrationPath = path.join(migrationsDir, file)
    const migration = await import(migrationPath)
    if (migration.up && typeof migration.up === 'function') {
      await migration.up(db)
    } else {
      console.warn(
        `Migration file ${file} does not export a valid 'up' function.`
      )
    }
  })
  console.log('All migrations have been run.')
}

// script runnable from the command line
if (import.meta.url === `file://${process.argv[1]}`) {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set')
    process.exit(1)
  }

  const db = createDatabase({ connectionString: process.env.DATABASE_URL })

  migrate(db).catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  })
}
