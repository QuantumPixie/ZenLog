import pg from 'pg';
import type { PoolClient } from 'pg';
import path from 'path';
import dotenv from 'dotenv';
import Chance from 'chance';
import { journalEntrySchema } from '../../schemas/journalEntrySchema';
import { moodSchema } from '../../schemas/moodSchema';
import { signupSchema } from '../../schemas/userSchema';
import { activityInputSchema } from '../../schemas/activitySchema';
import { fileURLToPath } from 'url';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..', '..', '..', '..');

console.log('Current working directory:', process.cwd());
console.log('Root directory:', rootDir);

const result = dotenv.config({ path: path.join(rootDir, '.env') });
if (result.error) {
  console.log('Error loading .env file:', result.error);
} else {
  console.log('.env file loaded successfully');
}

console.log('Environment variables loaded:', process.env.DATABASE_URL ? 'Yes' : 'No');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set (not shown for security)' : 'Not set');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set in the environment variables.');
  process.exit(1);
}

const chance = new Chance();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const activityList = [
  'Running', 'Yoga', 'Meditation', 'Reading', 'Cooking', 'Painting', 'Swimming',
  'Cycling', 'Hiking', 'Gardening', 'Writing', 'Dancing', 'Photography', 'Singing'
];

const clearExistingData = async (client: PoolClient) => {
  const tableExistsQuery = await client.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE  table_schema = 'public'
      AND    table_name   = 'users'
    );
  `);
  const tableExists = tableExistsQuery.rows[0].exists;
  console.log('Users table exists:', tableExists);

  if (tableExists) {
    await client.query('TRUNCATE public.users, public.moods, public.journal_entries, public.activities CASCADE');
    console.log('Existing data cleared');
  } else {
    console.log('Tables do not exist, skipping truncate');
  }
};

const generateUniqueDataForUser = (userId: number, count: number) => {
  const dates = new Set<string>();
  while (dates.size < count) {
    const date = new Date(chance.date({ year: 2024 }));
    const dateString = date.toISOString().split('T')[0];  // YYYY-MM-DD format
    dates.add(dateString);
  }
  return Array.from(dates).map(date => ({ userId, date }));
};

const seed = async (recordCount = 10) => {
  let client: PoolClient | null = null;
  try {
    client = await pool.connect();

    // Diagnostic queries
    const dbResult = await client.query('SELECT current_database()');
    console.log('Connected to database:', dbResult.rows[0].current_database);

    const schemaResult = await client.query('SHOW search_path');
    console.log('Current schema search path:', schemaResult.rows[0].search_path);

    const userResult = await client.query('SELECT current_user');
    console.log('Connected as user:', userResult.rows[0].current_user);

    const allDbsResult = await client.query('SELECT datname FROM pg_database');
    console.log('All databases:', allDbsResult.rows.map(row => row.datname));

    await clearExistingData(client);

    // Generate users
    const users = Array.from({ length: recordCount }).map(() => ({
      email: chance.email(),
      password: chance.string({ length: 10 }),
      username: chance.word({ length: 8 }),
    }));

    for (const user of users) {
      const validatedUser = signupSchema.parse(user);
      const result = await client.query(
        'INSERT INTO users (email, password, username, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id',
        [validatedUser.email, validatedUser.password, validatedUser.username]
      );
      const userId = result.rows[0].id;
      console.log(`Created user with id: ${userId}`);

      const userDates = generateUniqueDataForUser(userId, recordCount);

      // Generate moods
      for (const { date } of userDates) {
        const mood = {
          user_id: userId,
          date: new Date(date),
          mood_score: chance.integer({ min: 1, max: 10 }),
          emotions: chance.pickset(['happy', 'sad', 'angry', 'excited', 'nervous', 'calm'], 2),
        };
        const validatedMood = moodSchema.omit({ id: true }).parse(mood);
        await client.query(
          'INSERT INTO moods (user_id, date, mood_score, emotions, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW())',
          [validatedMood.user_id, validatedMood.date, validatedMood.mood_score, validatedMood.emotions]
        );
      }

      // Generate journal entries
      for (const { date } of userDates) {
        const journalEntry = {
          user_id: userId,
          date: new Date(date),
          entry: chance.paragraph(),
          sentiment: chance.integer({ min: 1, max: 10 }),
        };
        const validatedJournalEntry = journalEntrySchema.omit({ id: true }).parse(journalEntry);
        await client.query(
          'INSERT INTO journal_entries (user_id, date, entry, sentiment, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW())',
          [validatedJournalEntry.user_id, validatedJournalEntry.date, validatedJournalEntry.entry, validatedJournalEntry.sentiment]
        );
      }

      // Generate activities
      for (const { date } of userDates) {
        const activity = {
          user_id: userId,
          date: new Date(date),
          activity: chance.pickone(activityList),
          duration: chance.integer({ min: 10, max: 120 }),
          notes: chance.sentence(),
        };
        const validatedActivity = activityInputSchema.parse(activity);
        await client.query(
          'INSERT INTO activities (user_id, date, activity, duration, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())',
          [validatedActivity.user_id, validatedActivity.date, validatedActivity.activity, validatedActivity.duration, validatedActivity.notes]
        );
      }
    }

    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
};

const recordCount = process.argv[2] ? parseInt(process.argv[2], 10) : 10;
seed(recordCount);