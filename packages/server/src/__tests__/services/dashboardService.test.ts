import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { Kysely } from 'kysely'
import type { Database } from '../../models/database'
import { dashboardService } from '../../services/dashboardService'

import { db } from '../../database'

vi.mock('../../database', () => ({
  db: {
    selectFrom: vi.fn(),
    fn: {
      avg: vi.fn(),
    },
  },
}))

describe('dashboardService', () => {
  let mockDb: Kysely<Database>

  beforeEach(() => {
    vi.resetAllMocks()
    mockDb = db as unknown as Kysely<Database>
  })

  it('should return a summary for a user', async () => {
    const userId = 1
    const mockMoods = [
      {
        id: 1,
        user_id: 1,
        date: new Date('2023-08-01').toISOString(),
        mood_score: 7,
        emotions: ['happy'],
      },
    ]
    const mockEntries = [
      {
        date: new Date('2023-08-01').toISOString(),
        entry: 'Test entry',
        sentiment: 6.5,
      },
    ]
    const mockActivities = [
      {
        date: new Date('2023-08-01').toISOString(),
        activity: 'Running',
        duration: 30,
        notes: 'Good run',
      },
    ]
    const mockAverageMood = { averageMood: '6.5' }
    const mockAverageSentiment = { averageSentiment: '6.8' }

    const mockChain = {
      select: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      execute: vi.fn(),
      executeTakeFirst: vi.fn(),
    }

    mockDb.selectFrom = vi.fn().mockReturnValue(mockChain)
    mockChain.execute.mockResolvedValueOnce(mockMoods)
    mockChain.execute.mockResolvedValueOnce(mockEntries)
    mockChain.execute.mockResolvedValueOnce(mockActivities)
    mockChain.executeTakeFirst.mockResolvedValueOnce(mockAverageMood)
    mockChain.executeTakeFirst.mockResolvedValueOnce(mockAverageSentiment)

    const mockAvg = vi
      .fn()
      .mockReturnValue({ as: vi.fn().mockReturnValue('averageMood') })
    mockDb.fn.avg = mockAvg

    const result = await dashboardService.getSummary(userId)

    expect(result).toEqual({
      recentMoods: mockMoods,
      recentEntries: mockEntries,
      recentActivities: mockActivities,
      averageMoodLastWeek: 6.5,
      averageSentimentLastWeek: 6.8,
    })

    expect(mockDb.selectFrom).toHaveBeenCalledTimes(5)
    expect(mockChain.select).toHaveBeenNthCalledWith(1, [
      'id',
      'user_id',
      'date',
      'mood_score',
      'emotions',
    ])
    expect(mockChain.select).toHaveBeenNthCalledWith(2, [
      'date',
      'entry',
      'sentiment',
    ])
    expect(mockChain.select).toHaveBeenNthCalledWith(3, [
      'date',
      'activity',
      'duration',
      'notes',
    ])
    expect(mockChain.select).toHaveBeenCalledWith(expect.any(Object)) // average mood
    expect(mockChain.select).toHaveBeenCalledWith(expect.any(Object)) // average sentiment

    expect(mockChain.where).toHaveBeenCalledWith('user_id', '=', userId)
    expect(mockChain.orderBy).toHaveBeenCalledWith('date', 'desc')
    expect(mockChain.limit).toHaveBeenCalledWith(5)

    expect(mockChain.where).toHaveBeenCalledWith(
      'date',
      '>=',
      expect.any(String)
    )

    expect(mockAvg).toHaveBeenCalledWith('mood_score')
    expect(mockAvg).toHaveBeenCalledWith('sentiment')
  })
})
