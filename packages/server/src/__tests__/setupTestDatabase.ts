import { sql } from 'kysely'
import { db } from '../database'
import { migrate } from '../database/migrations/migrateLatest'
import { seed } from '../database/seed/seed'
import type { Database } from '../models/database'

async function tableExists(tableName: string): Promise<boolean> {
  const result = (await sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = ${tableName}
    );
  `.execute(db)) as { rows: [{ exists: boolean }] }

  return result.rows[0]?.exists ?? false
}

export async function setupTestDatabase() {
  console.log('Setting up test database...')

  try {
    const usersExist = await tableExists('users')
    if (!usersExist) {
      await migrate(db)
      console.log('Migrations completed.')
    } else {
      console.log('Tables already exist, skipping migrations.')
    }

    // Clean up the test database
    await cleanupTestDatabase()

    try {
      await seed(5)
      console.log('Seeding completed.')
    } catch (seedError: unknown) {
      if (seedError instanceof Error) {
        console.warn(
          'Warning: Seeding failed, but continuing with tests:',
          seedError.message
        )
      } else {
        console.warn('Warning: Seeding failed with an unknown error')
      }
    }
  } catch (error) {
    console.error('Error setting up test database:', error)
    throw error
  }
}

export async function cleanupTestDatabase() {
  console.log('Truncating test database tables...')
  const tables: (keyof Database)[] = [
    'activities',
    'journal_entries',
    'moods',
    'users',
  ]

  for (const table of tables) {
    try {
      await sql`TRUNCATE TABLE ${sql.table(table)} RESTART IDENTITY CASCADE`.execute(
        db
      )
    } catch (error) {
      console.warn(`Warning: Failed to truncate table ${table}:`, error)
    }
  }

  console.log('Database truncation completed.')
}

export async function teardownTestDatabase() {
  console.log('Teardown is completed.')
}

export async function verifyTables() {
  const requiredTables: (keyof Database)[] = [
    'activities',
    'journal_entries',
    'moods',
    'users',
  ]

  for (const table of requiredTables) {
    try {
      await db
        .selectFrom(table as keyof Database)
        .select('id')
        .limit(1)
        .execute()
    } catch (error) {
      throw new Error(
        `Required table ${table} does not exist or is not accessible`
      )
    }
  }

  console.log('All required tables exist and are accessible')
}
