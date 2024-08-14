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
    const user = await createUser({
      email: 'test@example.com',
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
      moodScore: 7,
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
})
