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
          date: '2024-08-02T00:00:00.000Z',
          activity: 'Running',
          duration: 30,
          notes: 'Good run',
        },
        {
          id: 2,
          user_id: 1,
          date: '2024-08-02T12:00:00.000Z',
          activity: 'Yoga',
          notes: 'Relaxing session',
        },
      ]

      mockKysely.selectFrom = vi.fn().mockReturnValue({
        selectAll: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue(mockActivities),
      })

      const result = await activityService.getActivities(userId)

      expect(result).toEqual(mockActivities)
      expect(mockKysely.selectFrom).toHaveBeenCalledWith('activities')
      expect(mockKysely.selectFrom('activities').selectAll).toHaveBeenCalled()
      expect(
        mockKysely.selectFrom('activities').selectAll().where
      ).toHaveBeenCalledWith('user_id', '=', userId)
      expect(
        mockKysely
          .selectFrom('activities')
          .selectAll()
          .where('user_id', '=', userId).orderBy
      ).toHaveBeenCalledWith('date', 'desc')
    })
  })

  describe('getActivityById', () => {
    it('should return an activity by id', async () => {
      const activityId = 1
      const userId = 1
      const mockActivity = {
        id: 1,
        user_id: 1,
        date: '2024-08-02T00:00:00.000Z',
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
        date: '2023-07-27T10:00:00.000Z',
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
        date: '2023-07-27T14:00:00.000Z',
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

    it('should throw an error for invalid date format', async () => {
      const userId = 1
      const invalidActivity = {
        date: '2023-07-27', // Invalid format, missing time
        activity: 'Running',
        duration: 30,
      }

      await expect(
        activityService.createActivity(userId, invalidActivity)
      ).rejects.toThrow('Invalid date format')
    })
  })

  describe('getActivitiesByDateRange', () => {
    it('should return activities within the specified date range', async () => {
      const userId = 1
      const startDate = '2023-07-27T00:00:00.000Z'
      const endDate = '2023-07-28T23:59:59.999Z'
      const mockActivities = [
        {
          id: 1,
          user_id: 1,
          date: '2023-07-27T10:00:00.000Z',
          activity: 'Running',
          duration: 30,
          notes: 'Good run',
        },
        {
          id: 2,
          user_id: 1,
          date: '2023-07-28T14:00:00.000Z',
          activity: 'Yoga',
          notes: 'Relaxing session',
        },
      ]

      mockKysely.selectFrom = vi.fn().mockReturnValue({
        selectAll: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
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
      expect(
        mockKysely
          .selectFrom('activities')
          .selectAll()
          .where('user_id', '=', userId).orderBy
      ).toHaveBeenCalledWith('date', 'desc')
    })

    it('should return an empty array if no activities are found in the date range', async () => {
      const userId = 1
      const startDate = '2023-01-01T00:00:00.000Z'
      const endDate = '2023-01-02T23:59:59.999Z'

      mockKysely.selectFrom = vi.fn().mockReturnValue({
        selectAll: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
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

  describe('data validation', () => {
    it('should not filter out valid activities in getActivities', async () => {
      const userId = 1
      const mockActivities = [
        {
          id: 1,
          user_id: 1,
          date: '2024-08-02T10:00:00.000Z',
          activity: 'Running',
          duration: 30,
          notes: 'Good run',
        },
        {
          id: 2,
          user_id: 1,
          date: '2024-08-02T14:00:00.000Z',
          activity: 'Yoga',
          notes: 'Relaxing session',
        },
      ]

      mockKysely.selectFrom = vi.fn().mockReturnValue({
        selectAll: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue(mockActivities),
      })

      const result = await activityService.getActivities(userId)

      expect(result).toEqual(mockActivities)
      expect(result).toHaveLength(2)
      expect(result.every((activity) => isValidDateString(activity.date))).toBe(
        true
      )
    })
  })
})
