import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import {
  setupTestDatabase,
  cleanupTestDatabase,
  teardownTestDatabase,
} from '../setupTestDatabase'
import { activityService } from '../../services/activityService'
import { createUser } from '../../services/userService'

describe('Activity Service Integration Tests', () => {
  let userId: number

  beforeAll(async () => {
    try {
      await setupTestDatabase()
    } catch (error) {
      console.error('Failed to set up test database:', error)
      throw error
    }
  })

  beforeEach(async () => {
    try {
      await cleanupTestDatabase()
      const user = await createUser({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      })
      userId = user.id
    } catch (error) {
      console.error('Failed to create user:', error)
      throw error
    }
  })

  afterAll(async () => {
    try {
      await teardownTestDatabase()
    } catch (error) {
      console.error('Failed to tear down test database:', error)
      throw error
    }
  })

  it('should create and retrieve an activity', async () => {
    const newActivity = {
      date: '2024-08-01',
      activity: 'Running',
      duration: 30,
      notes: 'Morning jog',
    }

    const createdActivity = await activityService.createActivity(
      userId,
      newActivity
    )
    expect(createdActivity).toHaveProperty('id')
    expect(createdActivity.activity).toBe(newActivity.activity)

    const retrievedActivity = await activityService.getActivityById(
      createdActivity.id,
      userId
    )

    expect(retrievedActivity).toMatchObject({
      id: createdActivity.id,
      user_id: userId,
      date: createdActivity.date,
      activity: createdActivity.activity,
      duration: createdActivity.duration,
      notes: createdActivity.notes,
    })
  })

  it('should get activities by date range', async () => {
    const activities = [
      { date: '2024-08-01', activity: 'Running', duration: 30 },
      { date: '2024-08-02', activity: 'Cycling', duration: 45 },
      { date: '2024-08-03', activity: 'Swimming', duration: 60 },
    ]

    await Promise.all(
      activities.map((activity) =>
        activityService.createActivity(userId, activity)
      )
    )

    const retrievedActivities = await activityService.getActivitiesByDateRange(
      userId,
      '2024-08-01',
      '2024-08-02'
    )
    expect(retrievedActivities).toHaveLength(2)
    expect(retrievedActivities[0].activity).toBe('Running')
    expect(retrievedActivities[1].activity).toBe('Cycling')
  })
})
