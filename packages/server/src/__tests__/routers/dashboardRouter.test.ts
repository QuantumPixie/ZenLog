import { describe, it, expect, vi, beforeEach } from 'vitest'
import { router, authedProcedure, createCallerFactory } from '../mocks/trpcMock'
import { dashboardService } from '../../services/dashboardService'
import type { DashboardSummary } from '../../types/dashboard'
import { TRPCError } from '@trpc/server'

vi.mock('../../services/dashboardService', () => ({
  dashboardService: {
    getSummary: vi.fn(),
  },
}))

// Type guard
function isDashboardSummary(obj: unknown): obj is DashboardSummary {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'recentMoods' in obj &&
    'recentEntries' in obj &&
    'recentActivities' in obj &&
    'averageMoodLastWeek' in obj &&
    'averageSentimentLastWeek' in obj &&
    Array.isArray((obj as DashboardSummary).recentMoods) &&
    Array.isArray((obj as DashboardSummary).recentEntries) &&
    Array.isArray((obj as DashboardSummary).recentActivities) &&
    (typeof (obj as DashboardSummary).averageMoodLastWeek === 'number' ||
      (obj as DashboardSummary).averageMoodLastWeek === null) &&
    (typeof (obj as DashboardSummary).averageSentimentLastWeek === 'number' ||
      (obj as DashboardSummary).averageSentimentLastWeek === null)
  )
}

const mockDashboardRouter = router({
  getSummary: authedProcedure.query(async ({ ctx }) => {
    const summary = await dashboardService.getSummary(ctx.user.id)
    return {
      ...summary,
      recentEntries: summary.recentEntries.map((entry) => ({
        ...entry,
        sentiment: isNaN(Number(entry.sentiment)) ? 0 : Number(entry.sentiment),
      })),
    }
  }),
})

const createCaller = createCallerFactory(mockDashboardRouter)

const createAuthenticatedCaller = (user: {
  id: number
  email: string
  username: string
}) => createCaller({ user } as never)

const createUnauthenticatedCaller = () => createCaller({} as never)

describe('dashboardRouter', () => {
  const mockUserId = 1
  const mockUser = {
    id: mockUserId,
    email: 'mockuser@example.com',
    username: 'mockuser',
  }

  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should get dashboard summary and transform sentiment to number', async () => {
    const mockSummary: DashboardSummary = {
      recentMoods: [
        {
          id: 1,
          user_id: mockUserId,
          date: '2024-08-02',
          mood_score: 7,
          emotions: ['happy'],
        },
      ],
      recentEntries: [
        {
          date: '2024-08-02',
          entry: 'Had a great day!',
          sentiment: '8' as unknown as never,
        },
      ],
      recentActivities: [
        {
          date: '2024-08-02',
          activity: 'Running',
          duration: 30,
          notes: 'Felt energized',
        },
      ],
      averageMoodLastWeek: 6.5,
      averageSentimentLastWeek: 7.0,
    }

    vi.mocked(dashboardService.getSummary).mockResolvedValue(mockSummary)

    const caller = createAuthenticatedCaller(mockUser)
    const result = await caller.getSummary()

    expect(isDashboardSummary(result)).toBe(true)
    expect(result.recentEntries[0].sentiment).toBe(8)
    expect(dashboardService.getSummary).toHaveBeenCalledWith(mockUserId)
  })

  it('should handle null average mood and sentiment', async () => {
    const mockSummary: DashboardSummary = {
      recentMoods: [],
      recentEntries: [],
      recentActivities: [],
      averageMoodLastWeek: null,
      averageSentimentLastWeek: null,
    }

    vi.mocked(dashboardService.getSummary).mockResolvedValue(mockSummary)

    const caller = createAuthenticatedCaller(mockUser)
    const result = await caller.getSummary()

    expect(isDashboardSummary(result)).toBe(true)
    expect(result.averageMoodLastWeek).toBeNull()
    expect(result.averageSentimentLastWeek).toBeNull()
  })

  it('should handle empty recent data', async () => {
    const mockSummary: DashboardSummary = {
      recentMoods: [],
      recentEntries: [],
      recentActivities: [],
      averageMoodLastWeek: 6.5,
      averageSentimentLastWeek: 7.0,
    }

    vi.mocked(dashboardService.getSummary).mockResolvedValue(mockSummary)

    const caller = createAuthenticatedCaller(mockUser)
    const result = await caller.getSummary()

    expect(isDashboardSummary(result)).toBe(true)
    expect(result.recentMoods).toHaveLength(0)
    expect(result.recentEntries).toHaveLength(0)
    expect(result.recentActivities).toHaveLength(0)
  })

  it('should transform sentiment to number for all entries', async () => {
    const mockSummary: DashboardSummary = {
      recentMoods: [],
      recentEntries: [
        { date: '2024-08-01', entry: 'Entry 1', sentiment: '5' as never },
        { date: '2024-08-02', entry: 'Entry 2', sentiment: '7' as never },
      ],
      recentActivities: [],
      averageMoodLastWeek: 6,
      averageSentimentLastWeek: 6,
    }

    vi.mocked(dashboardService.getSummary).mockResolvedValue(mockSummary)

    const caller = createAuthenticatedCaller(mockUser)
    const result = await caller.getSummary()

    expect(result.recentEntries[0].sentiment).toBe(5)
    expect(result.recentEntries[1].sentiment).toBe(7)
    expect(typeof result.recentEntries[0].sentiment).toBe('number')
    expect(typeof result.recentEntries[1].sentiment).toBe('number')
  })

  it('should handle errors from the service', async () => {
    vi.mocked(dashboardService.getSummary).mockRejectedValue(
      new Error('Service error')
    )

    const caller = createAuthenticatedCaller(mockUser)
    await expect(caller.getSummary()).rejects.toThrow('Service error')
  })

  it('should handle unauthorized access', async () => {
    const unauthorizedCaller = createUnauthenticatedCaller()

    await expect(unauthorizedCaller.getSummary()).rejects.toThrow(TRPCError)
    await expect(unauthorizedCaller.getSummary()).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    })
  })

  it('should handle mixed types of sentiment values', async () => {
    const mockSummary: DashboardSummary = {
      recentMoods: [],
      recentEntries: [
        { date: '2024-08-01', entry: 'Entry 1', sentiment: '5' as never },
        { date: '2024-08-02', entry: 'Entry 2', sentiment: 7 as never },
        { date: '2024-08-03', entry: 'Entry 3', sentiment: null as never },
      ],
      recentActivities: [],
      averageMoodLastWeek: 6,
      averageSentimentLastWeek: 6,
    }

    vi.mocked(dashboardService.getSummary).mockResolvedValue(mockSummary)

    const caller = createAuthenticatedCaller(mockUser)
    const result = await caller.getSummary()

    expect(result.recentEntries[0].sentiment).toBe(5)
    expect(result.recentEntries[1].sentiment).toBe(7)
    expect(result.recentEntries[2].sentiment).toBe(0) // assume null is converted to 0
    expect(typeof result.recentEntries[0].sentiment).toBe('number')
    expect(typeof result.recentEntries[1].sentiment).toBe('number')
    expect(typeof result.recentEntries[2].sentiment).toBe('number')
  })

  it('should handle large numbers of entries', async () => {
    const largeNumberOfEntries = Array(100)
      .fill(null)
      .map((_, index) => ({
        date: `2024-08-${String(index + 1).padStart(2, '0')}`,
        entry: `Entry ${index + 1}`,
        sentiment: String(Math.floor(Math.random() * 10)) as never,
      }))

    const mockSummary: DashboardSummary = {
      recentMoods: [],
      recentEntries: largeNumberOfEntries,
      recentActivities: [],
      averageMoodLastWeek: 6,
      averageSentimentLastWeek: 6,
    }

    vi.mocked(dashboardService.getSummary).mockResolvedValue(mockSummary)

    const caller = createAuthenticatedCaller(mockUser)
    const result = await caller.getSummary()

    expect(result.recentEntries).toHaveLength(100)
    result.recentEntries.forEach((entry) => {
      expect(typeof entry.sentiment).toBe('number')
    })
  })

  it('should preserve other properties of entries when transforming sentiment', async () => {
    const mockSummary: DashboardSummary = {
      recentMoods: [],
      recentEntries: [
        {
          date: '2024-08-01',
          entry: 'Entry 1',
          sentiment: '5' as never,
          additionalProp: 'test',
        } as unknown as {
          date: string
          entry: string
          sentiment: number
          additionalProp: string
        },
      ],
      recentActivities: [],
      averageMoodLastWeek: 6,
      averageSentimentLastWeek: 6,
    }

    vi.mocked(dashboardService.getSummary).mockResolvedValue(mockSummary)

    const caller = createAuthenticatedCaller(mockUser)
    const result = await caller.getSummary()

    expect(result.recentEntries[0]).toEqual({
      date: '2024-08-01',
      entry: 'Entry 1',
      sentiment: 5,
      additionalProp: 'test',
    })
  })

  it('should handle non-numeric sentiment values', async () => {
    const mockSummary: DashboardSummary = {
      recentMoods: [],
      recentEntries: [
        {
          date: '2024-08-01',
          entry: 'Entry 1',
          sentiment: 'not a number' as never,
        },
      ],
      recentActivities: [],
      averageMoodLastWeek: 6,
      averageSentimentLastWeek: 6,
    }

    vi.mocked(dashboardService.getSummary).mockResolvedValue(mockSummary)

    const caller = createAuthenticatedCaller(mockUser)
    const result = await caller.getSummary()

    expect(result.recentEntries[0].sentiment).toBe(0) // or whatever default value you expect
    expect(typeof result.recentEntries[0].sentiment).toBe('number')
  })
})
