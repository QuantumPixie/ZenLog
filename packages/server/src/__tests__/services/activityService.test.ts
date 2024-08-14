import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mockKysely } from '../mocks/databaseMock'
import { isValidDateString } from '../../schemas/activitySchema'

vi.mock('../../database', () => ({
  db: mockKysely,
}))

const activityServiceModule = await vi.importActual(
  '../../services/activityService'
)
const { activityService } =
  activityServiceModule as typeof import('../../services/activityService')

describe('activityService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getActivities', () => {
    it('should return activities for a given user', async () => {
      const userId = 1
      const mockActivities = [
        {
          id: 1,
          user_id: 1,
          date: '2024-08-02',
          activity: 'Running',
          duration: 30,
          notes: 'Good run',
        },
        {
          id: 2,
          user_id: 1,
          date: '2024-08-02',
          activity: 'Yoga',
          notes: 'Relaxing session',
        },
      ]

      mockKysely.selectFrom = vi.fn().mockReturnValue({
        selectAll: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue(mockActivities),
      })

      const result = await activityService.getActivities(userId)

      expect(result).toEqual(mockActivities)
      expect(mockKysely.selectFrom).toHaveBeenCalledWith('activities')
      expect(mockKysely.selectFrom('activities').selectAll).toHaveBeenCalled()
      expect(
        mockKysely.selectFrom('activities').selectAll().where
      ).toHaveBeenCalledWith('user_id', '=', userId)
    })
  })

  describe('getActivityById', () => {
    it('should return an activity by id', async () => {
      const activityId = 1
      const userId = 1
      const mockActivity = {
        id: 1,
        user_id: 1,
        date: '2024-08-02',
        activity: 'Running',
        duration: 30,
        notes: 'Good run',
      }

      const mockWhere = vi.fn().mockReturnThis()
      mockKysely.selectFrom = vi.fn().mockReturnValue({
        selectAll: vi.fn().mockReturnThis(),
        where: mockWhere,
        executeTakeFirst: vi.fn().mockResolvedValue(mockActivity),
      })

      const result = await activityService.getActivityById(activityId, userId)

      expect(result).toEqual(mockActivity)
      expect(mockKysely.selectFrom).toHaveBeenCalledWith('activities')
      expect(mockKysely.selectFrom('activities').selectAll).toHaveBeenCalled()
      expect(mockWhere).toHaveBeenCalledWith('id', '=', activityId)
      expect(mockWhere).toHaveBeenCalledWith('user_id', '=', userId)
    })

    it('should return undefined for non-existent activity', async () => {
      const activityId = 999
      const userId = 1

      mockKysely.selectFrom = vi.fn().mockReturnValue({
        selectAll: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        executeTakeFirst: vi.fn().mockResolvedValue(undefined),
      })

      const result = await activityService.getActivityById(activityId, userId)

      expect(result).toBeUndefined()
    })
  })

  describe('createActivity', () => {
    it('should create and return a new activity with duration', async () => {
      const userId = 1
      const newActivity = {
        date: '2023-07-27',
        activity: 'Running',
        duration: 30,
        notes: 'Good run',
      }
      const mockInsertedActivity = { id: 1, user_id: userId, ...newActivity }

      mockKysely.insertInto = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockReturnThis(),
        executeTakeFirst: vi.fn().mockResolvedValue(mockInsertedActivity),
      })

      const result = await activityService.createActivity(userId, newActivity)

      expect(result).toEqual(mockInsertedActivity)
      expect(mockKysely.insertInto).toHaveBeenCalledWith('activities')
      expect(mockKysely.insertInto('activities').values).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: userId,
          ...newActivity,
        })
      )
    })

    it('should create and return a new activity without duration', async () => {
      const userId = 1
      const newActivity = {
        date: '2023-07-27',
        activity: 'Meditation',
        notes: 'Peaceful',
      }
      const mockInsertedActivity = { id: 2, user_id: userId, ...newActivity }

      mockKysely.insertInto = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockReturnThis(),
        executeTakeFirst: vi.fn().mockResolvedValue(mockInsertedActivity),
      })

      const result = await activityService.createActivity(userId, newActivity)

      expect(result).toEqual(mockInsertedActivity)
      expect(mockKysely.insertInto).toHaveBeenCalledWith('activities')
      expect(mockKysely.insertInto('activities').values).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: userId,
          ...newActivity,
        })
      )
    })
  })

  describe('getActivitiesByDateRange', () => {
    it('should return activities within the specified date range', async () => {
      const userId = 1
      const startDate = '2023-07-27'
      const endDate = '2023-07-28'
      const mockActivities = [
        {
          id: 1,
          user_id: 1,
          date: '2023-07-27',
          activity: 'Running',
          duration: 30,
          notes: 'Good run',
        },
        {
          id: 2,
          user_id: 1,
          date: '2023-07-28',
          activity: 'Yoga',
          notes: 'Relaxing session',
        },
      ]

      mockKysely.selectFrom = vi.fn().mockReturnValue({
        selectAll: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue(mockActivities),
      })

      const result = await activityService.getActivitiesByDateRange(
        userId,
        startDate,
        endDate
      )

      expect(result).toEqual(mockActivities)
      expect(mockKysely.selectFrom).toHaveBeenCalledWith('activities')
      expect(mockKysely.selectFrom('activities').selectAll).toHaveBeenCalled()
      expect(
        mockKysely.selectFrom('activities').selectAll().where
      ).toHaveBeenCalledTimes(3)
    })

    it('should return an empty array if no activities are found in the date range', async () => {
      const userId = 1
      const startDate = '2023-07-27'
      const endDate = '2023-07-28'

      mockKysely.selectFrom = vi.fn().mockReturnValue({
        selectAll: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue([]),
      })

      const result = await activityService.getActivitiesByDateRange(
        userId,
        startDate,
        endDate
      )

      expect(result).toEqual([])
    })
  })

  describe('error handling', () => {
    it('should throw an error if database query fails in getActivities', async () => {
      const userId = 1

      mockKysely.selectFrom = vi.fn().mockReturnValue({
        selectAll: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        execute: vi.fn().mockRejectedValue(new Error('Database error')),
      })

      await expect(activityService.getActivities(userId)).rejects.toThrow(
        'Database error'
      )
    })

    it('should throw an error if activity creation fails', async () => {
      const userId = 1
      const newActivity = {
        date: '2023-07-27',
        activity: 'Running',
        duration: 30,
        notes: 'Good run',
      }

      mockKysely.insertInto = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockReturnThis(),
        executeTakeFirst: vi.fn().mockResolvedValue(null),
      })

      await expect(
        activityService.createActivity(userId, newActivity)
      ).rejects.toThrow('Failed to create activity')
    })
  })

  describe('data validation', () => {
    it('should filter out invalid activities in getActivities', async () => {
      const userId = 1
      const mockActivities = [
        {
          id: 1,
          user_id: 1,
          date: '2024-08-02',
          activity: 'Running',
          duration: 30,
          notes: 'Good run',
        },
        {
          id: 2,
          user_id: 1,
          date: '2024-08-02',
          activity: 'Yoga',
          notes: 'Relaxing session',
        },
        {
          id: 3,
          user_id: 1,
          date: 'invalid-date',
          activity: 'Invalid',
          notes: 'Should be filtered out',
        },
      ]

      mockKysely.selectFrom = vi.fn().mockReturnValue({
        selectAll: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue(mockActivities),
      })

      const result = await activityService.getActivities(userId)

      expect(result).toEqual([mockActivities[0], mockActivities[1]])
      expect(result).toHaveLength(2)
      expect(result.every((activity) => isValidDateString(activity.date))).toBe(
        true
      )
    })
  })
})
