import path from 'path'
import { fileURLToPath } from 'url'
import pg from 'pg'
import type { PoolClient } from 'pg'
import dotenv from 'dotenv'
import Chance from 'chance'
import bcrypt from 'bcrypt'
import { journalEntrySchema } from '../../schemas/journalEntrySchema'
import { moodSchema } from '../../schemas/moodSchema'
import { signupSchema } from '../../schemas/userSchema'
import { activityInputSchema } from '../../schemas/activitySchema'

export const { Pool } = pg

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..', '..', '..', '..', '..')

const result = dotenv.config({ path: path.join(rootDir, '.env') })
if (result.error) {
  console.error('Error loading .env file:', result.error)
  process.exit(1)
}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set in the environment variables.')
  process.exit(1)
}

export const chance = new Chance()
export const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const activityList = [
  'Running',
  'Yoga',
  'Meditation',
  'Reading',
  'Cooking',
  'Painting',
  'Swimming',
  'Cycling',
  'Hiking',
  'Gardening',
  'Writing',
  'Dancing',
  'Photography',
  'Singing',
]

export const clearExistingData = async (client: PoolClient) => {
  try {
    const tableExistsQuery = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE  table_schema = 'public'
        AND    table_name   = 'users'
      );
    `)
    const tableExists = tableExistsQuery.rows[0].exists

    if (tableExists) {
      await client.query(
        'TRUNCATE public.users, public.moods, public.journal_entries, public.activities CASCADE'
      )
    } else {
      console.log('No existing tables found, skipping clear')
    }
  } catch (error) {
    console.error('Error clearing existing data:', error)
    throw error
  }
}

export const generateUniqueDataForUser = (userId: number, count: number) => {
  const dates = new Set<string>()
  while (dates.size < count) {
    const date = new Date(chance.date({ year: 2024 }))
    const dateString = date.toISOString()
    dates.add(dateString)
  }
  return Array.from(dates).map((date) => ({ userId, date }))
}

const checkTableExists = async (client: PoolClient, tableName: string) => {
  const result = await client.query(
    `
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = $1
    );
  `,
    [tableName]
  )
  return result.rows[0].exists
}

// Define the interface for the options object
interface SeedOptions {
  mood_score?: number
}

// Update the seed function to accept an options object of type SeedOptions
export const seed = async (recordCount = 10, options: SeedOptions = {}) => {
  let client: PoolClient | null = null
  try {
    client = await pool.connect()
    console.log('Connected to database')

    await clearExistingData(client)

    await client.query('BEGIN')
    console.log('Transaction begun')

    // Check if tables exist
    const tablesExist = await Promise.all([
      checkTableExists(client, 'users'),
      checkTableExists(client, 'moods'),
      checkTableExists(client, 'journal_entries'),
      checkTableExists(client, 'activities'),
    ])

    if (!tablesExist.every(Boolean)) {
      throw new Error('One or more required tables do not exist')
    }

    // users
    const users = Array.from({ length: recordCount }).map(() => ({
      email: chance.email(),
      password: chance.string({ length: 10 }),
      username: chance.word({ length: 8 }),
    }))

    for (const user of users) {
      const validatedUser = signupSchema.parse(user)
      const hashedPassword = await bcrypt.hash(validatedUser.password, 10)
      const result = await client.query(
        'INSERT INTO users (email, password, username) VALUES ($1, $2, $3) RETURNING id',
        [validatedUser.email, hashedPassword, validatedUser.username]
      )
      const userId = result.rows[0].id
      console.log(`User created with ID: ${userId}`)

      const userDates = generateUniqueDataForUser(userId, recordCount)

      // moods
      for (const { date } of userDates) {
        const mood = {
          user_id: userId,
          date,
          mood_score: options.mood_score || chance.integer({ min: 1, max: 10 }),
          emotions: chance.pickset(
            ['happy', 'sad', 'angry', 'excited', 'nervous', 'calm'],
            chance.integer({ min: 1, max: 3 })
          ),
        }
        const validatedMood = moodSchema.omit({ id: true }).parse(mood)
        await client.query(
          'INSERT INTO moods (user_id, date, mood_score, emotions) VALUES ($1, $2, $3, $4)',
          [
            validatedMood.user_id,
            validatedMood.date,
            validatedMood.mood_score,
            validatedMood.emotions,
          ]
        )
      }
      console.log(`Moods created for user ${userId}`)

      // journalEntries
      for (const { date } of userDates) {
        const journalEntry = {
          user_id: userId,
          date,
          entry: chance.paragraph(),
          sentiment: chance.floating({ min: 1, max: 10, fixed: 1 }),
        }
        const validatedJournalEntry = journalEntrySchema
          .omit({ id: true })
          .parse(journalEntry)
        await client.query(
          'INSERT INTO journal_entries (user_id, date, entry, sentiment) VALUES ($1, $2, $3, $4)',
          [
            validatedJournalEntry.user_id,
            validatedJournalEntry.date,
            validatedJournalEntry.entry,
            validatedJournalEntry.sentiment,
          ]
        )
      }
      console.log(`Journal entries created for user ${userId}`)

      // activities
      for (const { date } of userDates) {
        const activityInput = {
          date,
          activity: chance.pickone(activityList),
          duration: chance.integer({ min: 10, max: 120 }),
          notes: chance.sentence(),
        }
        const validatedActivity = activityInputSchema.parse(activityInput)
        await client.query(
          'INSERT INTO activities (user_id, date, activity, duration, notes) VALUES ($1, $2, $3, $4, $5)',
          [
            userId,
            validatedActivity.date,
            validatedActivity.activity,
            validatedActivity.duration,
            validatedActivity.notes,
          ]
        )
      }
      console.log(`Activities created for user ${userId}`)
    }

    await client.query('COMMIT')
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK')
    }
    if (error instanceof Error) {
      console.error('Error stack:', error.stack)
    }
    throw error
  } finally {
    if (client) {
      client.release()
    }
  }
}

if (require.main === module) {
  const recordCount = process.argv[2] ? parseInt(process.argv[2], 10) : 10
  seed(recordCount).catch((error) => {
    console.error('Seeding failed:', error)
    process.exit(1)
  })
}
