import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Kysely } from 'kysely';
import type { Database } from '../../models/database';
import { dashboardService } from '../../services/dashboardService';


vi.mock('../../database', () => ({
  db: {
    selectFrom: vi.fn(),
    fn: {
      avg: vi.fn(),
    },
  },
}));


import { db } from '../../database';

describe('dashboardService', () => {
  let mockDb: Kysely<Database>;

  beforeEach(() => {
    vi.resetAllMocks();
    mockDb = db as unknown as Kysely<Database>;
  });

  describe('getSummary', () => {
    it('should return a summary for a user', async () => {
      const userId = 1;
      const mockMoods = [{ date: '2023-08-01', mood_score: 7, emotions: ['happy'] }];
      const mockEntries = [{ date: '2023-08-01', entry: 'Test entry' }];
      const mockActivities = [{ date: '2023-08-01', activity: 'Running', duration: 30, notes: 'Good run' }];
      const mockAverageMood = { average_mood: 6.5 };

      // Mock the chain of method calls
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        execute: vi.fn(),
        executeTakeFirst: vi.fn(),
      };

      mockDb.selectFrom = vi.fn().mockReturnValue(mockChain);
      mockChain.execute
        .mockResolvedValueOnce(mockMoods)
        .mockResolvedValueOnce(mockEntries)
        .mockResolvedValueOnce(mockActivities);
      mockChain.executeTakeFirst.mockResolvedValue(mockAverageMood);

      const mockAvgAs = vi.fn().mockReturnValue('average_mood');
      const mockAvg = vi.fn().mockReturnValue({ as: mockAvgAs });
      mockDb.fn.avg = mockAvg;

      const result = await dashboardService.getSummary(userId);

      expect(result).toEqual({
        recentMoods: mockMoods,
        recentEntries: mockEntries,
        recentActivities: mockActivities,
        averageMoodLastWeek: 6.5,
      });

      expect(mockDb.selectFrom).toHaveBeenCalledTimes(4);
      expect(mockChain.select).toHaveBeenNthCalledWith(1, ['date', 'mood_score', 'emotions']);
      expect(mockChain.select).toHaveBeenNthCalledWith(2, ['date', 'entry']);
      expect(mockChain.select).toHaveBeenNthCalledWith(3, ['date', 'activity', 'duration', 'notes']);
      expect(mockChain.select).toHaveBeenNthCalledWith(4, 'average_mood');

      expect(mockChain.where).toHaveBeenCalledWith('user_id', '=', userId);
      expect(mockChain.orderBy).toHaveBeenCalledWith('date', 'desc');
      expect(mockChain.limit).toHaveBeenCalledWith(5);

      expect(mockChain.where).toHaveBeenCalledWith('date', '>=', expect.any(String));
      
      expect(mockAvg).toHaveBeenCalledWith('mood_score');
      expect(mockAvgAs).toHaveBeenCalledWith('average_mood');
    });
  });
});