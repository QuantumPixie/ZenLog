// src/database/migrations/migrationScripts/20240721210324_initial_setup.ts

import { Kysely, sql } from 'kysely'
import type { Database } from '../../../models/database'

interface ExistsResult {
  exists: boolean
}

async function tableExists(
  db: Kysely<Database>,
  tableName: string
): Promise<boolean> {
  const result = await db.executeQuery<ExistsResult>(
    sql`SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = ${tableName}
    )`.compile(db)
  )
  return result.rows[0].exists
}

async function indexExists(
  db: Kysely<Database>,
  indexName: string
): Promise<boolean> {
  const result = await db.executeQuery<ExistsResult>(
    sql`SELECT EXISTS (
      SELECT FROM pg_indexes 
      WHERE schemaname = 'public' AND indexname = ${indexName}
    )`.compile(db)
  )
  return result.rows[0].exists
}

export async function up(db: Kysely<Database>): Promise<void> {
  if (!(await tableExists(db, 'users'))) {
    await db.schema
      .createTable('users')
      .addColumn('id', 'serial', (col) => col.primaryKey())
      .addColumn('username', 'varchar', (col) => col.notNull())
      .addColumn('email', 'varchar', (col) => col.notNull().unique())
      .addColumn('password', 'varchar', (col) => col.notNull())
      .addColumn('created_at', 'timestamp', (col) =>
        col.defaultTo(sql`now()`).notNull()
      )
      .addColumn('updated_at', 'timestamp', (col) =>
        col.defaultTo(sql`now()`).notNull()
      )
      .addColumn('deleted_at', 'timestamp')
      .execute()
  }

  if (!(await tableExists(db, 'moods'))) {
    await db.schema
      .createTable('moods')
      .addColumn('id', 'serial', (col) => col.primaryKey())
      .addColumn('user_id', 'integer', (col) =>
        col.references('users.id').onDelete('cascade').notNull()
      )
      .addColumn('date', sql`timestamp with time zone`, (col) => col.notNull())
      .addColumn('mood_score', 'integer', (col) =>
        col.notNull().check(sql`mood_score >= 1 AND mood_score <= 10`)
      )
      .addColumn('emotions', sql`text[]`, (col) => col.notNull())
      .addColumn('created_at', 'timestamp', (col) =>
        col.defaultTo(sql`now()`).notNull()
      )
      .addColumn('updated_at', 'timestamp', (col) =>
        col.defaultTo(sql`now()`).notNull()
      )
      .addColumn('deleted_at', 'timestamp')
      .execute()
  }

  if (!(await tableExists(db, 'journal_entries'))) {
    await db.schema
      .createTable('journal_entries')
      .addColumn('id', 'serial', (col) => col.primaryKey())
      .addColumn('user_id', 'integer', (col) =>
        col.references('users.id').onDelete('cascade').notNull()
      )
      .addColumn('date', sql`timestamp with time zone`, (col) => col.notNull())
      .addColumn('entry', 'text', (col) => col.notNull())
      .addColumn('sentiment', sql`numeric(3,1)`, (col) =>
        col.notNull().check(sql`sentiment >= 1 AND sentiment <= 10`)
      )
      .addColumn('created_at', 'timestamp', (col) =>
        col.defaultTo(sql`now()`).notNull()
      )
      .addColumn('updated_at', 'timestamp', (col) =>
        col.defaultTo(sql`now()`).notNull()
      )
      .addColumn('deleted_at', 'timestamp')
      .addUniqueConstraint('unique_user_date_journal', ['user_id', 'date'])
      .execute()
  }

  if (!(await tableExists(db, 'activities'))) {
    await db.schema
      .createTable('activities')
      .addColumn('id', 'serial', (col) => col.primaryKey())
      .addColumn('user_id', 'integer', (col) =>
        col.references('users.id').onDelete('cascade').notNull()
      )
      .addColumn('date', sql`timestamp with time zone`, (col) => col.notNull())
      .addColumn('activity', 'varchar', (col) => col.notNull())
      .addColumn('duration', 'integer')
      .addColumn('notes', 'text')
      .addColumn('created_at', 'timestamp', (col) =>
        col.defaultTo(sql`now()`).notNull()
      )
      .addColumn('updated_at', 'timestamp', (col) =>
        col.defaultTo(sql`now()`).notNull()
      )
      .addColumn('deleted_at', 'timestamp')
      .execute()
  }

  // indexes for frequent queries
  if (!(await indexExists(db, 'moods_user_id_date_index'))) {
    await db.schema
      .createIndex('moods_user_id_date_index')
      .on('moods')
      .columns(['user_id', 'date'])
      .execute()
  }

  if (!(await indexExists(db, 'journal_entries_user_id_date_index'))) {
    await db.schema
      .createIndex('journal_entries_user_id_date_index')
      .on('journal_entries')
      .columns(['user_id', 'date'])
      .execute()
  }

  if (!(await indexExists(db, 'activities_user_id_date_index'))) {
    await db.schema
      .createIndex('activities_user_id_date_index')
      .on('activities')
      .columns(['user_id', 'date'])
      .execute()
  }
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex('activities_user_id_date_index').execute()
  await db.schema.dropIndex('journal_entries_user_id_date_index').execute()
  await db.schema.dropIndex('moods_user_id_date_index').execute()

  await db.schema.dropTable('activities').execute()
  await db.schema.dropTable('journal_entries').execute()
  await db.schema.dropTable('moods').execute()
  await db.schema.dropTable('users').execute()
}
