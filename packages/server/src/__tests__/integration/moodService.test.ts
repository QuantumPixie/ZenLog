import { describe, it, expect, beforeEach } from 'vitest'
import { wrapInRollbacks } from './transactions/transactions'
import { moodService } from '../../services/moodService'
import { createUser } from '../../services/userService'
import { generateFakeUser } from './helperFunctions/userFactory'
import { generateFakeMood } from './helperFunctions/moodFactory'
import { testDb } from '../integration/transactions/testSetup'
import { Kysely } from 'kysely'
import { Database } from '../../models/database'

describe('Mood Service Integration Tests', () => {
  let db: Kysely<Database>
  let userId: number

  beforeEach(async () => {
    db = (await wrapInRollbacks(testDb)) as Kysely<Database>
    const fakeUser = generateFakeUser()
    const { user } = await createUser(fakeUser, db)
    userId = user.id
  })

  it('should create and retrieve a mood', async () => {
    const newMood = generateFakeMood(userId)
    const createdMood = await moodService.createMood(userId, newMood, db)

    expect(createdMood).toBeDefined()
    expect(createdMood).toHaveProperty('id')
    expect(createdMood.mood_score).toBe(newMood.mood_score)
    expect(createdMood.emotions).toEqual(newMood.emotions)
    expect(createdMood.date).toBeDefined()

    const retrievedMoods = await moodService.getMoods(userId, db)
    expect(retrievedMoods).toHaveLength(1)

    const retrievedMood = retrievedMoods[0]
    expect(retrievedMood).toMatchObject({
      id: createdMood.id,
      mood_score: createdMood.mood_score,
      emotions: createdMood.emotions,
    })
    expect(retrievedMood.date).toBeDefined()
  })

  it('should get moods by date range', async () => {
    const baseDate = new Date('2024-08-01T00:00:00Z')
    const moods = [
      {
        ...generateFakeMood(userId),
        date: new Date(baseDate.getTime() + 9 * 3600000).toISOString(),
      },
      {
        ...generateFakeMood(userId),
        date: new Date(
          baseDate.getTime() + 24 * 3600000 + 10 * 3600000
        ).toISOString(),
      },
      {
        ...generateFakeMood(userId),
        date: new Date(
          baseDate.getTime() + 48 * 3600000 + 11 * 3600000
        ).toISOString(),
      },
    ]

    await Promise.all(
      moods.map((mood) => moodService.createMood(userId, mood, db))
    )

    const startDate = new Date(baseDate.getTime())
    const endDate = new Date(baseDate.getTime() + 2 * 24 * 3600000 - 1)

    const retrievedMoods = await moodService.getMoodsByDateRange(
      userId,
      startDate.toISOString(),
      endDate.toISOString(),
      db
    )

    expect(retrievedMoods.length).toBe(2)
    expect(new Date(retrievedMoods[0].date).getTime()).toBeLessThan(
      new Date(retrievedMoods[1].date).getTime()
    )
  })

  it('should handle mood score out of range', async () => {
    const invalidMood = generateFakeMood(userId)
    invalidMood.mood_score = 11 // Invalid mood score, should be 1-10

    await expect(
      moodService.createMood(userId, invalidMood, db)
    ).rejects.toThrow('Number must be less than or equal to 10')
  })

  it('should handle empty emotions array', async () => {
    const invalidMood = generateFakeMood(userId)
    invalidMood.emotions = [] // Empty emotions array

    await expect(
      moodService.createMood(userId, invalidMood, db)
    ).rejects.toThrow('Array must contain at least 1 element(s)')
  })

  it('should throw an error for invalid date format', async () => {
    const invalidMood = {
      ...generateFakeMood(userId),
      date: '2024-08-01', // Invalid format, missing time
    }

    await expect(
      moodService.createMood(userId, invalidMood, db)
    ).rejects.toThrow('Invalid date format')
  })
})
