import { describe, it, expect, beforeEach } from 'vitest'
import { wrapInRollbacks } from './transactions/transactions'
import { activityService } from '../../services/activityService'
import { createUser } from '../../services/userService'
import { generateFakeUser } from './helperFunctions/userFactory'
import { generateFakeActivity } from './helperFunctions/activityFactory'
import { testDb } from '../integration/transactions/testSetup'
import { Kysely } from 'kysely'
import { Database } from '../../models/database'

describe('Activity Service Integration Tests', () => {
  let db: Kysely<Database>

  beforeEach(async () => {
    db = (await wrapInRollbacks(testDb)) as Kysely<Database>
  })

  it('should create and retrieve an activity', async () => {
    const fakeUser = generateFakeUser()
    const { user } = await createUser(fakeUser, db)
    const userId = user.id

    const newActivity = generateFakeActivity()
    const createdActivity = await activityService.createActivity(
      userId,
      newActivity,
      db
    )

    expect(createdActivity).toHaveProperty('id')
    expect(createdActivity.activity).toBe(newActivity.activity)

    const retrievedActivity = await activityService.getActivityById(
      createdActivity.id,
      userId,
      db
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
    const db = await wrapInRollbacks(testDb)
    const fakeUser = generateFakeUser()
    const { user } = await createUser(fakeUser, db)
    const userId = user.id

    const activities = [
      {
        ...generateFakeActivity(),
        date: '2024-08-01T09:00:00.000Z',
        activity: 'Running',
      },
      {
        ...generateFakeActivity(),
        date: '2024-08-02T10:00:00.000Z',
        activity: 'Cycling',
      },
      {
        ...generateFakeActivity(),
        date: '2024-08-03T11:00:00.000Z',
        activity: 'Swimming',
      },
    ]

    await Promise.all(
      activities.map((activity) =>
        activityService.createActivity(userId, activity, db)
      )
    )

    const retrievedActivities = await activityService.getActivitiesByDateRange(
      userId,
      '2024-08-01T00:00:00.000Z',
      '2024-08-02T23:59:59.999Z',
      db
    )
    expect(retrievedActivities).toHaveLength(2)
    expect(retrievedActivities[0].activity).toBe('Cycling')
    expect(retrievedActivities[1].activity).toBe('Running')
  })

  it('should throw an error for invalid date format', async () => {
    const db = await wrapInRollbacks(testDb)
    const fakeUser = generateFakeUser()
    const { user } = await createUser(fakeUser, db)
    const userId = user.id

    const invalidActivity = {
      ...generateFakeActivity(),
      date: '2024-08-01', // Invalid format, missing time
    }

    await expect(
      activityService.createActivity(userId, invalidActivity, db)
    ).rejects.toThrow('Invalid date format')
  })
})
