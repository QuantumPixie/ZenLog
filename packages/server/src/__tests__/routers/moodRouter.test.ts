import { describe, it, expect, vi, beforeEach } from 'vitest'
import { z } from 'zod'
import { router, authedProcedure, createCallerFactory } from '../mocks/trpcMock'
import { moodService } from '../../services/moodService'
import type { MoodTable } from '../../models/mood'

vi.mock('../../services/moodService', () => ({
  moodService: {
    getMoods: vi.fn(),
    createMood: vi.fn(),
    getMoodsByDateRange: vi.fn(),
  },
}))

// type guard
function isMoodTable(obj: unknown): obj is MoodTable {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'user_id' in obj &&
    'date' in obj &&
    'moodScore' in obj &&
    'emotions' in obj &&
    Array.isArray((obj as MoodTable).emotions)
  )
}

// type guard for array of MoodTable
function isMoodTableArray(arr: unknown): arr is MoodTable[] {
  return Array.isArray(arr) && arr.every(isMoodTable)
}

const mockMoodRouter = router({
  getMoods: authedProcedure.query(async ({ ctx }) =>
    moodService.getMoods(ctx.user.id)
  ),
  createMood: authedProcedure
    .input(
      z.object({
        date: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
          message: 'Invalid date format',
        }),
        moodScore: z.number().min(1).max(10),
        emotions: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) =>
      moodService.createMood(ctx.user.id, input)
    ),
  getMoodsByDateRange: authedProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ ctx, input }) =>
      moodService.getMoodsByDateRange(
        ctx.user.id,
        input.startDate,
        input.endDate
      )
    ),
})

const createCaller = createCallerFactory(mockMoodRouter)

describe('moodRouter', () => {
  const mockMood = {
    id: 1,
    user_id: 1,
    date: '2024-08-02',
    moodScore: 7,
    emotions: ['happy', 'excited'],
  }

  const mockMoods = [
    mockMood,
    {
      id: 2,
      user_id: 1,
      date: '2024-08-03',
      moodScore: 6,
      emotions: ['calm'],
    },
  ]

  const mockUserId = 1

  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should get moods', async () => {
    vi.mocked(moodService.getMoods).mockResolvedValue(mockMoods)

    const caller = createCaller({ user: { id: mockUserId } })
    const result = await caller.getMoods()

    expect(isMoodTableArray(result)).toBe(true)
    expect(result).toEqual(mockMoods)
    expect(moodService.getMoods).toHaveBeenCalledWith(mockUserId)
  })

  it('should create a new mood', async () => {
    const newMood = {
      date: '2024-08-04',
      moodScore: 8,
      emotions: ['happy', 'relaxed'],
    }
    const createdMood = {
      ...newMood,
      id: 3,
      user_id: mockUserId,
    }

    vi.mocked(moodService.createMood).mockResolvedValue(createdMood)

    const caller = createCaller({ user: { id: mockUserId } })
    const result = await caller.createMood(newMood)

    expect(isMoodTable(result)).toBe(true)
    expect(result).toEqual(createdMood)
    expect(moodService.createMood).toHaveBeenCalledWith(mockUserId, newMood)
  })

  it('should get moods by date range', async () => {
    vi.mocked(moodService.getMoodsByDateRange).mockResolvedValue(mockMoods)

    const caller = createCaller({ user: { id: mockUserId } })
    const result = await caller.getMoodsByDateRange({
      startDate: '2024-08-01',
      endDate: '2024-08-31',
    })

    expect(isMoodTableArray(result)).toBe(true)
    expect(result).toEqual(mockMoods)
    expect(moodService.getMoodsByDateRange).toHaveBeenCalledWith(
      mockUserId,
      '2024-08-01',
      '2024-08-31'
    )
  })

  it('should handle empty result for getMoodsByDateRange', async () => {
    vi.mocked(moodService.getMoodsByDateRange).mockResolvedValue([])

    const caller = createCaller({ user: { id: mockUserId } })
    const result = await caller.getMoodsByDateRange({
      startDate: '2024-09-01',
      endDate: '2024-09-02',
    })

    expect(isMoodTableArray(result)).toBe(true)
    expect(result).toEqual([])
  })

  it('should reject invalid moodScore for createMood', async () => {
    const invalidMood = {
      date: '2024-08-04',
      moodScore: 11, // Invalid: should be between 1 and 10
      emotions: ['happy'],
    }

    const caller = createCaller({ user: { id: mockUserId } })
    await expect(caller.createMood(invalidMood)).rejects.toThrow(
      'Number must be less than or equal to 10'
    )
  })

  it('should reject invalid date for createMood', async () => {
    const invalidMood = {
      date: 'invalid-date',
      moodScore: 7,
      emotions: ['happy'],
    }

    const caller = createCaller({ user: { id: mockUserId } })
    await expect(caller.createMood(invalidMood)).rejects.toThrow(
      'Invalid date format'
    )
  })
})
