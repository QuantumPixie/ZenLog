import { describe, it, expect, beforeEach } from 'vitest'
import { wrapInRollbacks } from './transactions/transactions'
import { dashboardService } from '../../services/dashboardService'
import { createUser } from '../../services/userService'
import { generateFakeDashboardData } from './helperFunctions/dashboardFactory' // Import the new function
import { testDb } from '../integration/transactions/testSetup'
import { Kysely } from 'kysely'
import { Database } from '../../models/database'
import {
  up,
  down,
  tableExists,
} from '../../database/migrations/migrationScripts/20240721210324_initial_setup'

describe('Dashboard Service Integration Tests', () => {
  let db: Kysely<Database>
  let userId: number

  beforeEach(async () => {
    // Wrap the tests in transactions to ensure isolation and rollback after each test
    db = (await wrapInRollbacks(testDb)) as Kysely<Database>

    // Check if tables exist before running migrations
    const usersExist = await tableExists(db, 'users')
    if (!usersExist) {
      console.log('Running migrations...')
      await up(db)
      console.log('Migrations completed.')
    } else {
      console.log('Tables already exist, skipping migrations.')
    }
  })

  it('should create and retrieve a dashboard summary with recent data', async () => {
    const { user, recentMoods, recentActivities, recentEntries } =
      generateFakeDashboardData() // Get the user and dashboard data
    const { user: createdUser } = await createUser(user, db) // Create the user in the database
    userId = createdUser.id

    // Insert fake moods, journal entries, and activities directly into the database
    await db.insertInto('moods').values(recentMoods).execute()
    await db.insertInto('journal_entries').values(recentEntries).execute()
    await db.insertInto('activities').values(recentActivities).execute()

    const summary = await dashboardService.getSummary(userId)

    expect(summary).toMatchObject({
      recentMoods: expect.any(Array),
      recentEntries: expect.any(Array),
      recentActivities: expect.any(Array),
      averageMoodLastWeek: expect.any(Number),
      averageSentimentLastWeek: expect.any(Number),
    })
  })

  it('should handle empty data', async () => {
    const { user } = generateFakeDashboardData() // Get the user
    const { user: createdUser } = await createUser(user, db)
    userId = createdUser.id

    const summary = await dashboardService.getSummary(userId)

    expect(summary).toEqual({
      recentMoods: [],
      recentEntries: [],
      recentActivities: [],
      averageMoodLastWeek: null,
      averageSentimentLastWeek: null,
    })
  })

  it('should calculate correct averages for the last week', async () => {
    const { user } = generateFakeDashboardData() // Get the user
    const { user: createdUser } = await createUser(user, db)
    userId = createdUser.id

    const today = new Date()
    const dates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      return date.toISOString()
    })

    // Insert fake mood data for last week directly into the database
    const moods = dates.map((date) => ({
      user_id: userId,
      date,
      mood_score: 4, // Adjusted to fit the typical mood score range
      emotions: ['neutral'],
    }))
    await db.insertInto('moods').values(moods).execute()

    const summary = await dashboardService.getSummary(userId)

    expect(summary.averageMoodLastWeek).toBeCloseTo(4, 1)
    expect(summary.averageSentimentLastWeek).toBeDefined()
    expect(typeof summary.averageSentimentLastWeek).toBe('number')
  })

  it('should limit recent data to 5 items', async () => {
    const { user, recentMoods, recentEntries, recentActivities } =
      generateFakeDashboardData() // Get the user and dashboard data
    const { user: createdUser } = await createUser(user, db)
    userId = createdUser.id

    // Simulate more than 5 items for each type
    const extendedMoods = [...recentMoods, ...recentMoods]
    const extendedEntries = [...recentEntries, ...recentEntries]
    const extendedActivities = [...recentActivities, ...recentActivities]

    await db.insertInto('moods').values(extendedMoods).execute()
    await db.insertInto('journal_entries').values(extendedEntries).execute()
    await db.insertInto('activities').values(extendedActivities).execute()

    const summary = await dashboardService.getSummary(userId)

    expect(summary.recentMoods).toHaveLength(5)
    expect(summary.recentEntries).toHaveLength(5)
    expect(summary.recentActivities).toHaveLength(5)
  })
})
