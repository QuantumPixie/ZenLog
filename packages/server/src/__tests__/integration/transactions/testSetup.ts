import { Kysely } from 'kysely'
import type { Database } from '../../../models/database'
import { createTestDatabase } from './setupTestDatabase'
import {
  up,
  down,
  tableExists,
  indexExists,
} from '../../../database/migrations/migrationScripts/20240721210324_initial_setup'
import dotenv from 'dotenv'
import path from 'path'
import { generateFakeUser } from '../helperFunctions/userFactory'

dotenv.config({ path: path.resolve(__dirname, '../../../.env') })

if (!process.env.TEST_DATABASE_URL) {
  process.env.TEST_DATABASE_URL =
    'postgres://thuppertz:turing_college@localhost:5432/mental_health_tracker_test'
}

let testDb: Kysely<Database>

beforeAll(async () => {
  console.log('Connecting to database:', process.env.TEST_DATABASE_URL)
  testDb = await createTestDatabase()

  // Check if tables exist before running migrations
  const usersExist = await tableExists(testDb, 'users')
  if (!usersExist) {
    console.log('Running migrations...')
    await up(testDb)
    console.log('Migrations completed.')
  } else {
    console.log('Tables already exist, skipping migrations.')
  }

  // Insert a fake user using userFactory
  const fakeUser = generateFakeUser() // Generate a user from the factory
  await testDb.insertInto('users').values(fakeUser).execute()

  console.log('Test database setup completed.')
})

afterAll(async () => {
  console.log('Cleaning up test database...')
  if (testDb) {
    try {
      // Check if indexes exist before trying to drop them
      const activitiesIndexExists = await indexExists(
        testDb,
        'activities_user_id_date_index'
      )
      const journalEntriesIndexExists = await indexExists(
        testDb,
        'journal_entries_user_id_date_index'
      )
      const moodsIndexExists = await indexExists(
        testDb,
        'moods_user_id_date_index'
      )

      if (
        activitiesIndexExists ||
        journalEntriesIndexExists ||
        moodsIndexExists
      ) {
        await down(testDb)
      } else {
        console.log('Indexes do not exist, skipping drop operations.')
      }

      await testDb.destroy()
      console.log('Test database cleaned up and connection closed.')
    } catch (error) {
      console.error('Error during database cleanup:', error)
    }
  }
}, 15000) // Increased timeout for afterAll

export { testDb }
