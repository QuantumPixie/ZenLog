import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockKysely } from '../mocks/databaseMock';


vi.mock('../../database', () => ({
  db: mockKysely
}));


const activityServiceModule = await vi.importActual('../../services/activityService');
const { activityService } = activityServiceModule as typeof import('../../services/activityService');

describe('activityService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getActivities', () => {
    it('should return activities for a given user', async () => {
      const userId = 1;
      const mockActivities = [
        { id: 1, user_id: 1, date: new Date(), activity: 'Running', duration: 30, notes: 'Good run' },
        { id: 2, user_id: 1, date: new Date(), activity: 'Yoga', duration: 60, notes: 'Relaxing session' },
      ];

      mockKysely.selectFrom = vi.fn().mockReturnValue({
        selectAll: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue(mockActivities)
      });

      const result = await activityService.getActivities(userId);

      expect(result).toEqual(mockActivities);
      expect(mockKysely.selectFrom).toHaveBeenCalledWith('activities');
      expect(mockKysely.selectFrom('activities').selectAll).toHaveBeenCalled();
      expect(mockKysely.selectFrom('activities').selectAll().where).toHaveBeenCalledWith('user_id', '=', userId);
    });
  });

  describe('getActivityById', () => {
    it('should return an activity by id', async () => {
      const activityId = 1;
      const mockActivity = { id: 1, user_id: 1, date: new Date(), activity: 'Running', duration: 30, notes: 'Good run' };

      mockKysely.selectFrom = vi.fn().mockReturnValue({
        selectAll: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        executeTakeFirst: vi.fn().mockResolvedValue(mockActivity)
      });

      const result = await activityService.getActivityById(activityId);

      expect(result).toEqual(mockActivity);
      expect(mockKysely.selectFrom).toHaveBeenCalledWith('activities');
      expect(mockKysely.selectFrom('activities').selectAll).toHaveBeenCalled();
      expect(mockKysely.selectFrom('activities').selectAll().where).toHaveBeenCalledWith('id', '=', activityId);
    });
  });

  describe('createActivity', () => {
    it('should create and return a new activity', async () => {
      const userId = 1;
      const newActivity = { date: new Date('2023-07-27'), activity: 'Running', duration: 30, notes: 'Good run' };
      const mockInsertedActivity = { id: 1, user_id: userId, ...newActivity };

      mockKysely.insertInto = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockReturnThis(),
        executeTakeFirst: vi.fn().mockResolvedValue(mockInsertedActivity)
      });

      const result = await activityService.createActivity(userId, newActivity);

      expect(result).toEqual(mockInsertedActivity);
      expect(mockKysely.insertInto).toHaveBeenCalledWith('activities');
      expect(mockKysely.insertInto('activities').values).toHaveBeenCalledWith(expect.objectContaining({ user_id: userId, ...newActivity }));
      expect(mockKysely.insertInto('activities').values(expect.any(Object)).returning).toHaveBeenCalledWith(['id', 'user_id', 'date', 'activity', 'duration', 'notes']);  });

  describe('getActivitiesByDateRange', () => {
    it('should return activities within the specified date range', async () => {
      const userId = 1;
      const startDate = '2023-07-27';
      const endDate = '2023-07-28';
      const mockActivities = [
        { id: 1, user_id: 1, date: new Date('2023-07-27'), activity: 'Running', duration: 30, notes: 'Good run' },
        { id: 2, user_id: 1, date: new Date('2023-07-28'), activity: 'Yoga', duration: 60, notes: 'Relaxing session' },
      ];

      mockKysely.selectFrom = vi.fn().mockReturnValue({
        selectAll: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue(mockActivities)
      });

      const result = await activityService.getActivitiesByDateRange(userId, startDate, endDate);

      expect(result).toEqual(mockActivities);
      expect(mockKysely.selectFrom).toHaveBeenCalledWith('activities');
      expect(mockKysely.selectFrom('activities').selectAll).toHaveBeenCalled();
    });
  });
});
});