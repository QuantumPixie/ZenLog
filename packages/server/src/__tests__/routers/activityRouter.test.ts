import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createCallerFactory, Context } from '../mocks/trpcMock'
import { activityRouter } from '../../routers/activityRouter'
import { activityService } from '../../services/activityService'
import type { ActivityInput, ActivityTable } from '../../models/activity'
import { CustomRequest, User } from '../../types/customRequest' // Adjust this import path as needed

// Mock the activityService
vi.mock('../../services/activityService', () => ({
  activityService: {
    getActivities: vi.fn(),
    getActivityById: vi.fn(),
    createActivity: vi.fn(),
    getActivitiesByDateRange: vi.fn(),
  },
}))

type AppRouter = typeof activityRouter

type RouterContext = {
  req: CustomRequest
  res: Response
  user: User | null
}

type TestContext = Context

type CombinedContext = RouterContext & TestContext

const createCaller = createCallerFactory<AppRouter>(activityRouter)

const mockUserId = 1

const createAuthenticatedCaller = () =>
  createCaller({
    user: { id: mockUserId, email: 'test@example.com', username: 'testuser' },
  } as CombinedContext)

const createUnauthenticatedCaller = () => createCaller({} as CombinedContext)

describe('activityRouter', () => {
  const mockActivity: ActivityTable = {
    id: 1,
    user_id: 1,
    date: '2024-08-02T00:00:00.000Z',
    activity: 'Running',
    duration: 30,
    notes: 'Good run',
  }
  const mockActivities: ActivityTable[] = [mockActivity]

  beforeEach(() => {
    vi.resetAllMocks()
    vi.spyOn(console, 'log')
    vi.spyOn(console, 'error')
  })

  describe('getActivities', () => {
    it('should get activities and log messages', async () => {
      vi.mocked(activityService.getActivities).mockResolvedValue(mockActivities)

      const caller = createAuthenticatedCaller()
      const result = await caller.getActivities()

      expect(result).toEqual(mockActivities)
      expect(activityService.getActivities).toHaveBeenCalledWith(mockUserId)
      expect(console.log).toHaveBeenCalledWith(
        `Fetching activities for user ${mockUserId}`
      )
      expect(console.log).toHaveBeenCalledWith(
        `Retrieved ${mockActivities.length} activities for user ${mockUserId}`
      )
    })

    it('should handle errors when fetching activities', async () => {
      const error = new Error('Database error')
      vi.mocked(activityService.getActivities).mockRejectedValue(error)

      const caller = createAuthenticatedCaller()
      await expect(caller.getActivities()).rejects.toThrow(
        'Failed to fetch activities'
      )
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching activities:',
        error
      )
    })
  })

  describe('getActivityById', () => {
    it('should get activity by id', async () => {
      vi.mocked(activityService.getActivityById).mockResolvedValue(mockActivity)

      const caller = createAuthenticatedCaller()
      const result = await caller.getActivityById({ id: mockActivity.id })

      expect(result).toEqual(mockActivity)
      expect(activityService.getActivityById).toHaveBeenCalledWith(
        mockActivity.id,
        mockUserId
      )
    })

    it('should throw error when activity not found', async () => {
      vi.mocked(activityService.getActivityById).mockResolvedValue(undefined)

      const caller = createAuthenticatedCaller()
      await expect(caller.getActivityById({ id: 999 })).rejects.toThrow(
        'Activity not found'
      )
    })
  })

  describe('createActivity', () => {
    it('should create a new activity', async () => {
      const newActivity: ActivityInput = {
        date: '2024-08-04T00:00:00.000Z',
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

      const caller = createAuthenticatedCaller()
      const result = await caller.createActivity(newActivity)

      expect(result).toEqual(createdActivity)
      expect(activityService.createActivity).toHaveBeenCalledWith(
        mockUserId,
        newActivity
      )
    })

    it('should create activity with minimum required fields', async () => {
      const minimalActivity: ActivityInput = {
        date: '2024-08-04T00:00:00.000Z',
        activity: 'Walking',
      }
      const createdActivity: ActivityTable = {
        ...minimalActivity,
        id: 4,
        user_id: mockUserId,
      }
      vi.mocked(activityService.createActivity).mockResolvedValue(
        createdActivity
      )

      const caller = createAuthenticatedCaller()
      const result = await caller.createActivity(minimalActivity)

      expect(result).toEqual(createdActivity)
    })

    it('should throw an error for invalid activity input', async () => {
      const caller = createAuthenticatedCaller()
      await expect(
        caller.createActivity({
          date: 'invalid-date',
          activity: '',
          duration: -1,
        } as ActivityInput)
      ).rejects.toThrow()
    })
  })

  describe('getActivitiesByDateRange', () => {
    it('should get activities by date range', async () => {
      vi.mocked(activityService.getActivitiesByDateRange).mockResolvedValue(
        mockActivities
      )

      const caller = createAuthenticatedCaller()
      const result = await caller.getActivitiesByDateRange({
        startDate: '2024-08-02T00:00:00.000Z',
        endDate: '2024-08-03T23:59:59.999Z',
      })

      expect(result).toEqual(mockActivities)
      expect(activityService.getActivitiesByDateRange).toHaveBeenCalledWith(
        mockUserId,
        '2024-08-02T00:00:00.000Z',
        '2024-08-03T23:59:59.999Z'
      )
    })

    it('should return empty array for date range with no activities', async () => {
      vi.mocked(activityService.getActivitiesByDateRange).mockResolvedValue([])

      const caller = createAuthenticatedCaller()
      const result = await caller.getActivitiesByDateRange({
        startDate: '2024-08-10T00:00:00.000Z',
        endDate: '2024-08-11T23:59:59.999Z',
      })

      expect(result).toEqual([])
      expect(activityService.getActivitiesByDateRange).toHaveBeenCalledWith(
        mockUserId,
        '2024-08-10T00:00:00.000Z',
        '2024-08-11T23:59:59.999Z'
      )
    })

    it('should throw an error for invalid date format', async () => {
      const caller = createAuthenticatedCaller()
      await expect(
        caller.getActivitiesByDateRange({
          startDate: 'invalid-date',
          endDate: '2024-08-03',
        })
      ).rejects.toThrow('Invalid start date format. Use YYYY-MM-DD')
    })
  })

  describe('edge cases', () => {
    it('should handle empty result from getActivities', async () => {
      vi.mocked(activityService.getActivities).mockResolvedValue([])

      const caller = createAuthenticatedCaller()
      const result = await caller.getActivities()

      expect(result).toEqual([])
      expect(activityService.getActivities).toHaveBeenCalledWith(mockUserId)
    })

    it('should throw an error for invalid activity id in getActivityById', async () => {
      const caller = createAuthenticatedCaller()
      await expect(caller.getActivityById({ id: -1 })).rejects.toThrow()
    })

    it('should handle date range spanning multiple years in getActivitiesByDateRange', async () => {
      const multiYearActivities: ActivityTable[] = [
        {
          id: 7,
          user_id: mockUserId,
          date: '2023-12-31T00:00:00.000Z',
          activity: "New Year's Eve Run",
          duration: 60,
          notes: 'Last run of the year',
        },
        {
          id: 8,
          user_id: mockUserId,
          date: '2024-01-01T00:00:00.000Z',
          activity: "New Year's Day Yoga",
          duration: 45,
          notes: 'First yoga session of the year',
        },
      ]
      vi.mocked(activityService.getActivitiesByDateRange).mockResolvedValue(
        multiYearActivities
      )

      const caller = createAuthenticatedCaller()
      const result = await caller.getActivitiesByDateRange({
        startDate: '2023-12-31T00:00:00.000Z',
        endDate: '2024-01-01T23:59:59.999Z',
      })

      expect(result).toEqual(multiYearActivities)
      expect(activityService.getActivitiesByDateRange).toHaveBeenCalledWith(
        mockUserId,
        '2023-12-31T00:00:00.000Z',
        '2024-01-01T23:59:59.999Z'
      )
    })

    it('should handle maximum allowed duration in createActivity', async () => {
      const maxDurationActivity: ActivityInput = {
        date: '2024-08-04T00:00:00.000Z',
        activity: 'Marathon',
        duration: 1440, // 24 hours
        notes: 'Longest run ever',
      }
      const createdActivity: ActivityTable = {
        ...maxDurationActivity,
        id: 6,
        user_id: mockUserId,
      }
      vi.mocked(activityService.createActivity).mockResolvedValue(
        createdActivity
      )

      const caller = createAuthenticatedCaller()
      const result = await caller.createActivity(maxDurationActivity)

      expect(result).toEqual(createdActivity)
    })

    it('should throw an error for unauthenticated calls', async () => {
      const caller = createUnauthenticatedCaller()
      await expect(caller.getActivities()).rejects.toThrow(
        'You must be logged in to access this resource'
      )
    })

    it('should handle very long activity names', async () => {
      const longNameActivity: ActivityInput = {
        date: '2024-08-04T00:00:00.000Z',
        activity: 'A'.repeat(255), // Maximum allowed length
        duration: 60,
      }
      const createdActivity: ActivityTable = {
        ...longNameActivity,
        id: 9,
        user_id: mockUserId,
      }
      vi.mocked(activityService.createActivity).mockResolvedValue(
        createdActivity
      )

      const caller = createAuthenticatedCaller()
      const result = await caller.createActivity(longNameActivity)

      expect(result).toEqual(createdActivity)
    })
  })

  describe('error handling', () => {
    it('should handle database errors in createActivity', async () => {
      const newActivity: ActivityInput = {
        date: '2024-08-04T00:00:00.000Z',
        activity: 'Swimming',
        duration: 45,
      }
      vi.mocked(activityService.createActivity).mockRejectedValue(
        new Error('Database error')
      )

      const caller = createAuthenticatedCaller()
      await expect(caller.createActivity(newActivity)).rejects.toThrow(
        'Database error'
      )
    })

    it('should handle database errors in getActivitiesByDateRange', async () => {
      vi.mocked(activityService.getActivitiesByDateRange).mockRejectedValue(
        new Error('Database error')
      )

      const caller = createAuthenticatedCaller()
      await expect(
        caller.getActivitiesByDateRange({
          startDate: '2024-08-01T00:00:00.000Z',
          endDate: '2024-08-31T23:59:59.999Z',
        })
      ).rejects.toThrow('Database error')
    })
  })
})
