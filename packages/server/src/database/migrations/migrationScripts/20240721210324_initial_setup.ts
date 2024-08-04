import { Kysely, sql } from 'kysely';
import type { Database } from '../../../models/database';

export async function up(db: Kysely<Database>): Promise<void> {

  await db.schema
    .createTable('users')
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('username', 'varchar', col => col.notNull())
    .addColumn('email', 'varchar', col => col.notNull().unique())
    .addColumn('password', 'varchar', col => col.notNull())
    .addColumn('created_at', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addColumn('deleted_at', 'timestamp')
    .execute();

  await db.schema
    .createTable('moods')
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('user_id', 'integer', col => col.references('users.id').onDelete('cascade').notNull())
    .addColumn('date', 'date', col => col.notNull())
    .addColumn('mood_score', 'integer', col => col.notNull().check(sql`mood_score >= 1 AND mood_score <= 10`))
    .addColumn('emotions', sql`text[]`, col => col.notNull())
    .addColumn('created_at', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addColumn('deleted_at', 'timestamp')
    .addUniqueConstraint('unique_user_date_mood', ['user_id', 'date'])
    .execute();

  await db.schema
    .createTable('journal_entries')
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('user_id', 'integer', col => col.references('users.id').onDelete('cascade').notNull())
    .addColumn('date', 'date', col => col.notNull())
    .addColumn('entry', 'text', col => col.notNull())
    .addColumn('sentiment', sql`numeric(3,1)`, col => 
      col.notNull().check(sql`sentiment >= 1 AND sentiment <= 10`)
    )
    .addColumn('created_at', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addColumn('deleted_at', 'timestamp')
    .addUniqueConstraint('unique_user_date_journal', ['user_id', 'date'])
    .execute();

  await db.schema
    .createTable('activities')
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('user_id', 'integer', col => col.references('users.id').onDelete('cascade').notNull())
    .addColumn('date', 'date', col => col.notNull())
    .addColumn('activity', 'varchar', col => col.notNull())
    .addColumn('duration', 'integer')
    .addColumn('notes', 'text')
    .addColumn('created_at', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addColumn('deleted_at', 'timestamp')
    .execute();

  // indexes for frequent queries
  await db.schema.createIndex('moods_user_id_date_index').on('moods').columns(['user_id', 'date']).execute();
  await db.schema.createIndex('journal_entries_user_id_date_index').on('journal_entries').columns(['user_id', 'date']).execute();
  await db.schema.createIndex('activities_user_id_date_index').on('activities').columns(['user_id', 'date']).execute();
}

export async function down(db: Kysely<Database>): Promise<void> {

  await db.schema.dropIndex('activities_user_id_date_index').execute();
  await db.schema.dropIndex('journal_entries_user_id_date_index').execute();
  await db.schema.dropIndex('moods_user_id_date_index').execute();

  await db.schema.dropTable('activities').execute();
  await db.schema.dropTable('journal_entries').execute();
  await db.schema.dropTable('moods').execute();
  await db.schema.dropTable('users').execute();
}