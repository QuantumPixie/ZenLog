import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  afterAll,
} from 'vitest'
import {
  setupTestDatabase,
  cleanupTestDatabase,
  teardownTestDatabase,
} from '../setupTestDatabase'
import { dashboardService } from '../../services/dashboardService'
import { createUser } from '../../services/userService'
import { moodService } from '../../services/moodService'
import { journalEntryService } from '../../services/journalEntryService'
import { activityService } from '../../services/activityService'

describe('Dashboard Service Integration Tests', () => {
  let userId: number

  beforeAll(async () => {
    await setupTestDatabase()
  })

  beforeEach(async () => {
    const uniqueEmail = `test${Date.now()}@example.com`
    const user = await createUser({
      email: uniqueEmail,
      username: 'testuser',
      password: 'password123',
    })
    userId = user.id
  })

  afterEach(async () => {
    await cleanupTestDatabase()
  })

  afterAll(async () => {
    await teardownTestDatabase()
  })

  it('should get dashboard summary', async () => {
    // Create test data
    await moodService.createMood(userId, {
      date: '2024-08-01',
      mood_score: 7,
      emotions: ['happy'],
    })
    await journalEntryService.createJournalEntry(userId, {
      date: '2024-08-01',
      entry: 'Great day!',
    })
    await activityService.createActivity(userId, {
      date: '2024-08-01',
      activity: 'Running',
      duration: 30,
    })

    const summary = await dashboardService.getSummary(userId)

    expect(summary).toHaveProperty('recentMoods')
    expect(summary).toHaveProperty('recentEntries')
    expect(summary).toHaveProperty('recentActivities')
    expect(summary).toHaveProperty('averageMoodLastWeek')

    expect(summary.recentMoods).toHaveLength(1)
    expect(summary.recentEntries).toHaveLength(1)
    expect(summary.recentActivities).toHaveLength(1)

    // Check if averageMoodLastWeek is a number (could be null if not enough data)
    if (summary.averageMoodLastWeek !== null) {
      expect(summary.averageMoodLastWeek).toBeCloseTo(7, 1)
    }

    // Check content of recent items
    expect(summary.recentMoods[0]).toMatchObject({
      date: expect.any(Date),
      moodScore: 7,
      emotions: ['happy'],
    })

    expect(summary.recentEntries[0]).toMatchObject({
      date: expect.any(Date),
      entry: 'Great day!',
    })

    expect(summary.recentActivities[0]).toMatchObject({
      date: expect.any(Date),
      activity: 'Running',
      duration: 30,
    })
  })

  it('should handle empty data', async () => {
    const summary = await dashboardService.getSummary(userId)

    expect(summary.recentMoods).toHaveLength(0)
    expect(summary.recentEntries).toHaveLength(0)
    expect(summary.recentActivities).toHaveLength(0)
    expect(summary.averageMoodLastWeek).toBeNull()
    expect(summary.averageSentimentLastWeek).toBeNull()
  })

  it('should calculate correct averages', async () => {
    const today = new Date()
    const threeDaysAgo = new Date(today)
    threeDaysAgo.setDate(today.getDate() - 3)

    await moodService.createMood(userId, {
      date: today.toISOString().split('T')[0],
      mood_score: 8,
      emotions: ['happy'],
    })
    await moodService.createMood(userId, {
      date: threeDaysAgo.toISOString().split('T')[0],
      mood_score: 6,
      emotions: ['neutral'],
    })

    await journalEntryService.createJournalEntry(userId, {
      date: today.toISOString().split('T')[0],
      entry: 'Feeling great!',
    })
    await journalEntryService.createJournalEntry(userId, {
      date: threeDaysAgo.toISOString().split('T')[0],
      entry: 'Just an average day.',
    })

    const summary = await dashboardService.getSummary(userId)

    expect(summary.averageMoodLastWeek).toBeCloseTo(7, 1)
    expect(summary.averageSentimentLastWeek).not.toBeNull()
  })
})
