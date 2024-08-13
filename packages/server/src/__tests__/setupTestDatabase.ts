import { db } from '../database';
import { migrate } from '../database/migrations/migrateLatest';
import { seed } from '../database/seed/seed';
import type { Database } from '../models/database';
import { sql } from 'kysely';

async function tableExists(tableName: string): Promise<boolean> {
  const result = await sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = ${tableName}
    );
  `.execute(db) as { rows: [{ exists: boolean }] };

  return result.rows[0]?.exists ?? false;
}

export async function setupTestDatabase() {
  console.log('Setting up test database...');

  try {
    // Check if tables already exist
    const usersExist = await tableExists('users');
    if (!usersExist) {
      // Run migrations only if tables don't exist
      await migrate(db);
      console.log('Migrations completed.');
    } else {
      console.log('Tables already exist, skipping migrations.');
    }

    // Clean existing data
    await cleanupTestDatabase();

    // Seed the database
    try {
      await seed(5);
      console.log('Seeding completed.');
    } catch (seedError: unknown) {
      if (seedError instanceof Error) {
        console.warn('Warning: Seeding failed, but continuing with tests:', seedError.message);
      } else {
        console.warn('Warning: Seeding failed with an unknown error');
      }
    }
  } catch (error) {
    console.error('Error setting up test database:', error);
    throw error;
  }
}

export async function cleanupTestDatabase() {
  console.log('Cleaning up test database...');
  const tables: (keyof Database)[] = ['activities', 'journal_entries', 'moods', 'users'];
  for (const table of tables) {
    try {
      await db.deleteFrom(table as keyof Database).execute();
    } catch (error) {
      console.warn(`Warning: Failed to clean up table ${table}:`, error);
    }
  }
  console.log('Cleanup completed.');
}

export async function teardownTestDatabase() {
  console.log('Tearing down test database...');
  const tables: (keyof Database)[] = ['activities', 'journal_entries', 'moods', 'users'];
  for (const table of tables) {
    try {
      await db.schema.dropTable(table).ifExists().execute();
    } catch (error) {
      console.warn(`Warning: Failed to drop table ${table}:`, error);
    }
  }
  console.log('Teardown completed.');
}

export async function verifyTables() {
  const requiredTables: (keyof Database)[] = ['activities', 'journal_entries', 'moods', 'users'];
  for (const table of requiredTables) {
    try {
      await db.selectFrom(table as keyof Database).select('id').limit(1).execute();
    } catch (error) {
      throw new Error(`Required table ${table} does not exist or is not accessible`);
    }
  }
  console.log('All required tables exist and are accessible');
}