import { sql } from 'kysely'
import dotenv from 'dotenv'
import { db } from '../database/index.ts'
import { migrate } from '../database/migrations/migrateLatest.ts'
import { seed } from '../database/seed/seed.ts'
import type { Database } from '../models/database.ts'

// Load environment variables
dotenv.config()

async function tableExists(tableName: string): Promise<boolean> {
  const result = await sql<{ exists: boolean }>`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = ${tableName}
    );
  `.execute(db)

  return result.rows[0]?.exists ?? false
}

async function checkDatabaseConnection() {
  try {
    await db.selectFrom('users').select('id').limit(1).execute()
    console.log('Database connection successful')
  } catch (error) {
    console.error('Error connecting to the database:', error)
    throw error
  }
}

export async function setupTestDatabase() {
  console.log('Setting up test database...')

  try {
    await checkDatabaseConnection()

    const usersExist = await tableExists('users')
    if (!usersExist) {
      try {
        await migrate(db)
        console.log('Migrations completed.')
      } catch (migrationError) {
        console.error('Error during migration:', migrationError)
        throw migrationError
      }
    } else {
      console.log('Tables already exist, skipping migrations.')
    }

    await cleanupTestDatabase()

    try {
      await seed(5, {
        mood_score: 5,
      })
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

    await verifyTables()
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
      console.error(`Error truncating table ${table}:`, error)
      throw error // Throw the error to stop the process if a table can't be truncated
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

  const missingTables = []

  for (const table of requiredTables) {
    try {
      await db
        .selectFrom(table as keyof Database)
        .select('id')
        .limit(1)
        .execute()
    } catch (error) {
      missingTables.push(table)
    }
  }

  if (missingTables.length > 0) {
    throw new Error(
      `Required tables do not exist or are not accessible: ${missingTables.join(', ')}`
    )
  }

  console.log('All required tables exist and are accessible')
}
