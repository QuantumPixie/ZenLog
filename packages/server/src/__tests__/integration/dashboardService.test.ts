import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
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
    await cleanupTestDatabase()
    const { user } = await createUser({
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
    })
    userId = user.id
  })

  afterAll(async () => {
    await teardownTestDatabase()
  })

  it('should get dashboard summary with recent data', async () => {
    const testDate = new Date('2024-08-01T12:00:00.000Z')

    await moodService.createMood(userId, {
      date: testDate.toISOString(),
      mood_score: 7,
      emotions: ['happy'],
    })
    await journalEntryService.createJournalEntry(userId, {
      date: testDate.toISOString(),
      entry: 'Great day!',
    })
    await activityService.createActivity(userId, {
      date: testDate.toISOString(),
      activity: 'Running',
      duration: 30,
    })

    const summary = await dashboardService.getSummary(userId)

    expect(summary).toMatchObject({
      recentMoods: [
        expect.objectContaining({
          date: expect.any(String),
          mood_score: 7,
          emotions: ['happy'],
        }),
      ],
      recentEntries: [
        expect.objectContaining({
          date: expect.any(String),
          entry: 'Great day!',
        }),
      ],
      recentActivities: [
        expect.objectContaining({
          date: expect.any(String),
          activity: 'Running',
          duration: 30,
        }),
      ],
      averageMoodLastWeek: expect.any(Number),
      averageSentimentLastWeek: expect.any(Number),
    })
  })

  it('should handle empty data', async () => {
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
    const today = new Date()
    const dates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      return date.toISOString()
    })

    for (let i = 0; i < 7; i++) {
      await moodService.createMood(userId, {
        date: dates[i],
        mood_score: 7,
        emotions: ['neutral'],
      })
      await journalEntryService.createJournalEntry(userId, {
        date: dates[i],
        entry: `Day ${i + 1}`,
      })
    }

    const summary = await dashboardService.getSummary(userId)

    expect(summary.averageMoodLastWeek).toBeCloseTo(7, 1)
    expect(summary.averageSentimentLastWeek).toBeDefined()
    expect(typeof summary.averageSentimentLastWeek).toBe('number')
  })

  it('should limit recent data to 5 items', async () => {
    const testDate = new Date('2024-08-01T12:00:00.000Z')

    for (let i = 0; i < 10; i++) {
      const date = new Date(testDate)
      date.setDate(testDate.getDate() - i)
      await moodService.createMood(userId, {
        date: date.toISOString(),
        mood_score: 7,
        emotions: ['happy'],
      })
      await journalEntryService.createJournalEntry(userId, {
        date: date.toISOString(),
        entry: `Entry ${i + 1}`,
      })
      await activityService.createActivity(userId, {
        date: date.toISOString(),
        activity: `Activity ${i + 1}`,
        duration: 30,
      })
    }

    const summary = await dashboardService.getSummary(userId)

    expect(summary.recentMoods).toHaveLength(5)
    expect(summary.recentEntries).toHaveLength(5)
    expect(summary.recentActivities).toHaveLength(5)
  })

  it('should handle partial data', async () => {
    const testDate = new Date('2024-08-01T12:00:00.000Z')

    await moodService.createMood(userId, {
      date: testDate.toISOString(),
      mood_score: 7,
      emotions: ['happy'],
    })

    const summary = await dashboardService.getSummary(userId)

    expect(summary).toMatchObject({
      recentMoods: [
        expect.objectContaining({
          date: expect.any(String),
          mood_score: 7,
          emotions: ['happy'],
        }),
      ],
      recentEntries: [],
      recentActivities: [],
      averageMoodLastWeek: expect.any(Number),
      averageSentimentLastWeek: null,
    })
  })
})
