import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { Kysely } from 'kysely'
import type { Database } from '../../models/database'
import { createDatabase } from '../index'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const migrationsDir = path.join(__dirname, 'migrationScripts')

export async function migrateDown<T extends Database>(db: Kysely<T>) {
  const migrationFiles = await fs.readdir(migrationsDir)
  const sortedMigrationFiles = migrationFiles
    .filter((file) => file.endsWith('.ts'))
    .sort()
    .reverse() // Reverse the order for down migrations

  // Only run the most recent migration
  const latestMigration = sortedMigrationFiles[0]
  if (latestMigration) {
    console.log(`Running down migration for: ${latestMigration}`)
    const migrationPath = path.join(migrationsDir, latestMigration)
    const migration = await import(migrationPath)
    if (migration.down && typeof migration.down === 'function') {
      await migration.down(db)
      console.log(`Successfully reverted migration: ${latestMigration}`)
    } else {
      console.warn(
        `Migration file ${latestMigration} does not export a valid 'down' function.`
      )
    }
  } else {
    console.log('No migrations to revert.')
  }
}

// script runnable from the command line
if (import.meta.url === `file://${process.argv[1]}`) {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set')
    process.exit(1)
  }

  const db = createDatabase({ connectionString: process.env.DATABASE_URL })

  migrateDown(db).catch((error) => {
    console.error('Migration down failed:', error)
    process.exit(1)
  })
}
