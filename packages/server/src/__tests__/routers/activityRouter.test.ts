import { describe, it, expect, vi, beforeEach } from 'vitest'
import { z } from 'zod'
import { router, authedProcedure, createCallerFactory } from '../mocks/trpcMock'
import { activityService } from '../../services/activityService'
import type { ActivityTable } from '../../models/activity'
import { TRPCError } from '@trpc/server'

// Mock the activityService
vi.mock('../../services/activityService', () => ({
  activityService: {
    getActivities: vi.fn(),
    getActivityById: vi.fn(),
    createActivity: vi.fn(),
    getActivitiesByDateRange: vi.fn(),
  },
}))

// create mock router
const mockActivityRouter = router({
  getActivities: authedProcedure.query(async ({ ctx }) => {
    try {
      return await activityService.getActivities(ctx.user.id)
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch activities',
      })
    }
  }),
  getActivityById: authedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const activity = await activityService.getActivityById(
        input.id,
        ctx.user.id
      )
      if (!activity) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Activity not found',
        })
      }
      return activity
    }),
  createActivity: authedProcedure
    .input(
      z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
        activity: z.string().min(1, 'Activity is required'),
        duration: z.number().positive().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) =>
      activityService.createActivity(ctx.user.id, input)
    ),
  getActivitiesByDateRange: authedProcedure
    .input(
      z.object({
        startDate: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid start date format'),
        endDate: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid end date format'),
      })
    )
    .query(async ({ ctx, input }) =>
      activityService.getActivitiesByDateRange(
        ctx.user.id,
        input.startDate,
        input.endDate
      )
    ),
})

// caller factory
const createCaller = createCallerFactory(mockActivityRouter)

describe('activityRouter', () => {
  const mockActivity: ActivityTable = {
    id: 1,
    user_id: 1,
    date: '2024-08-02',
    activity: 'Running',
    duration: 30,
    notes: 'Good run',
  }
  const mockActivities: ActivityTable[] = [
    mockActivity,
    {
      id: 2,
      user_id: 1,
      date: '2024-08-03',
      activity: 'Yoga',
      notes: 'Relaxing session',
      duration: undefined,
    },
  ]
  const mockUserId = 1

  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('getActivities', () => {
    it('should get activities', async () => {
      vi.mocked(activityService.getActivities).mockResolvedValue(mockActivities)

      const caller = createCaller({ user: { id: mockUserId } })
      const result = await caller.getActivities()

      expect(result).toEqual(mockActivities)
      expect(activityService.getActivities).toHaveBeenCalledWith(mockUserId)
    })

    it('should handle errors when fetching activities', async () => {
      vi.mocked(activityService.getActivities).mockRejectedValue(
        new Error('Database error')
      )

      const caller = createCaller({ user: { id: mockUserId } })
      await expect(caller.getActivities()).rejects.toThrow(
        'Failed to fetch activities'
      )
    })
  })

  describe('getActivityById', () => {
    it('should get activity by id', async () => {
      vi.mocked(activityService.getActivityById).mockResolvedValue(mockActivity)

      const caller = createCaller({ user: { id: mockUserId } })
      const result = await caller.getActivityById({ id: mockActivity.id })

      expect(result).toEqual(mockActivity)
      expect(activityService.getActivityById).toHaveBeenCalledWith(
        mockActivity.id,
        mockUserId
      )
    })

    it('should throw error when activity not found', async () => {
      vi.mocked(activityService.getActivityById).mockResolvedValue(undefined)

      const caller = createCaller({ user: { id: mockUserId } })
      await expect(caller.getActivityById({ id: 3 })).rejects.toThrow(
        'Activity not found'
      )
    })
  })

  describe('createActivity', () => {
    it('should create a new activity', async () => {
      const newActivity = {
        date: '2024-08-04',
        activity: 'Swimming',
        duration: 45,
        notes: 'Refreshing swim',
      }
      const createdActivity: ActivityTable = {
        ...newActivity,
        id: 3,
        user_id: mockUserId,
      }
      vi.mocked(activityService.createActivity).mockResolvedValue(
        createdActivity
      )

      const caller = createCaller({ user: { id: mockUserId } })
      const result = await caller.createActivity(newActivity)

      expect(result).toEqual(createdActivity)
      expect(activityService.createActivity).toHaveBeenCalledWith(
        mockUserId,
        newActivity
      )
    })

    it('should create a new activity without optional fields', async () => {
      const newActivity = {
        date: '2024-08-04',
        activity: 'Walking',
      }
      const createdActivity: ActivityTable = {
        ...newActivity,
        id: 4,
        user_id: mockUserId,
        duration: undefined,
        notes: undefined,
      }
      vi.mocked(activityService.createActivity).mockResolvedValue(
        createdActivity
      )

      const caller = createCaller({ user: { id: mockUserId } })
      const result = await caller.createActivity(newActivity)

      expect(result).toEqual(createdActivity)
      expect(activityService.createActivity).toHaveBeenCalledWith(
        mockUserId,
        newActivity
      )
    })

    it('should throw an error for invalid input in createActivity', async () => {
      const caller = createCaller({ user: { id: mockUserId } })
      await expect(
        caller.createActivity({
          date: 'invalid-date',
          activity: '',
          duration: -1,
        })
      ).rejects.toThrow()
    })
  })

  describe('getActivitiesByDateRange', () => {
    it('should get activities by date range', async () => {
      vi.mocked(activityService.getActivitiesByDateRange).mockResolvedValue(
        mockActivities
      )

      const caller = createCaller({ user: { id: mockUserId } })
      const result = await caller.getActivitiesByDateRange({
        startDate: '2024-08-02',
        endDate: '2024-08-03',
      })

      expect(result).toEqual(mockActivities)
      expect(activityService.getActivitiesByDateRange).toHaveBeenCalledWith(
        mockUserId,
        '2024-08-02',
        '2024-08-03'
      )
    })

    it('should return empty array for date range with no activities', async () => {
      vi.mocked(activityService.getActivitiesByDateRange).mockResolvedValue([])

      const caller = createCaller({ user: { id: mockUserId } })
      const result = await caller.getActivitiesByDateRange({
        startDate: '2024-08-10',
        endDate: '2024-08-11',
      })

      expect(result).toEqual([])
      expect(activityService.getActivitiesByDateRange).toHaveBeenCalledWith(
        mockUserId,
        '2024-08-10',
        '2024-08-11'
      )
    })

    it('should throw an error for invalid date format in getActivitiesByDateRange', async () => {
      const caller = createCaller({ user: { id: mockUserId } })
      await expect(
        caller.getActivitiesByDateRange({
          startDate: 'invalid-date',
          endDate: '2024-08-03',
        })
      ).rejects.toThrow('Invalid start date format')
    })

    it('should handle errors when fetching activities by date range', async () => {
      vi.mocked(activityService.getActivitiesByDateRange).mockRejectedValue(
        new Error('Database error')
      )

      const caller = createCaller({ user: { id: mockUserId } })
      await expect(
        caller.getActivitiesByDateRange({
          startDate: '2024-08-02',
          endDate: '2024-08-03',
        })
      ).rejects.toThrow()
    })
  })

  // Additional edge case tests

  describe('edge cases', () => {
    it('should handle empty result from getActivities', async () => {
      vi.mocked(activityService.getActivities).mockResolvedValue([])

      const caller = createCaller({ user: { id: mockUserId } })
      const result = await caller.getActivities()

      expect(result).toEqual([])
      expect(activityService.getActivities).toHaveBeenCalledWith(mockUserId)
    })

    it('should throw an error for invalid activity id in getActivityById', async () => {
      const caller = createCaller({ user: { id: mockUserId } })
      await expect(caller.getActivityById({ id: -1 })).rejects.toThrow()
    })

    it('should handle maximum allowed duration in createActivity', async () => {
      const newActivity = {
        date: '2024-08-04',
        activity: 'Marathon',
        duration: 1440, // 24 hours
        notes: 'Longest run ever',
      }
      const createdActivity: ActivityTable = {
        ...newActivity,
        id: 5,
        user_id: mockUserId,
      }
      vi.mocked(activityService.createActivity).mockResolvedValue(
        createdActivity
      )

      const caller = createCaller({ user: { id: mockUserId } })
      const result = await caller.createActivity(newActivity)

      expect(result).toEqual(createdActivity)
      expect(activityService.createActivity).toHaveBeenCalledWith(
        mockUserId,
        newActivity
      )
    })

    it('should handle very long activity name in createActivity', async () => {
      const longActivityName = 'A'.repeat(255) // Assuming 255 is the maximum allowed length
      const newActivity = {
        date: '2024-08-04',
        activity: longActivityName,
        duration: 30,
      }
      const createdActivity: ActivityTable = {
        ...newActivity,
        id: 6,
        user_id: mockUserId,
        notes: undefined,
      }
      vi.mocked(activityService.createActivity).mockResolvedValue(
        createdActivity
      )

      const caller = createCaller({ user: { id: mockUserId } })
      const result = await caller.createActivity(newActivity)

      expect(result).toEqual(createdActivity)
      expect(activityService.createActivity).toHaveBeenCalledWith(
        mockUserId,
        newActivity
      )
    })

    it('should handle date range spanning multiple years in getActivitiesByDateRange', async () => {
      const multiYearActivities: ActivityTable[] = [
        {
          id: 7,
          user_id: mockUserId,
          date: '2023-12-31',
          activity: "New Year's Eve Run",
        },
        {
          id: 8,
          user_id: mockUserId,
          date: '2024-01-01',
          activity: "New Year's Day Yoga",
        },
      ]
      vi.mocked(activityService.getActivitiesByDateRange).mockResolvedValue(
        multiYearActivities
      )

      const caller = createCaller({ user: { id: mockUserId } })
      const result = await caller.getActivitiesByDateRange({
        startDate: '2023-12-31',
        endDate: '2024-01-01',
      })

      expect(result).toEqual(multiYearActivities)
      expect(activityService.getActivitiesByDateRange).toHaveBeenCalledWith(
        mockUserId,
        '2023-12-31',
        '2024-01-01'
      )
    })
  })
})
