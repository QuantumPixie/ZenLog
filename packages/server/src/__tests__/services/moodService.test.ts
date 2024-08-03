import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockKysely } from '../mocks/databaseMock';

vi.mock('../../database', () => ({
  db: mockKysely
}));

const moodServiceModule = await vi.importActual('../../services/moodService');
const { moodService } = moodServiceModule as typeof import('../../services/moodService');

describe('moodService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMoods', () => {
    it('should return moods for a user', async () => {
      const userId = 1;
      const mockMoods = [
        { id: 1, date: '2023-08-03', mood_score: 7, emotions: ['happy', 'excited'] },
        { id: 2, date: '2023-08-02', mood_score: 5, emotions: ['neutral'] },
      ];

      mockKysely.selectFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue(mockMoods)
      });

      const result = await moodService.getMoods(userId);

      expect(result).toEqual(mockMoods);
      expect(mockKysely.selectFrom).toHaveBeenCalledWith('moods');
      expect(mockKysely.selectFrom('moods').select).toHaveBeenCalledWith(['id', 'date', 'mood_score', 'emotions']);
      expect(mockKysely.selectFrom('moods').select(['id', 'date', 'mood_score', 'emotions']).where).toHaveBeenCalledWith('user_id', '=', userId);
      expect(mockKysely.selectFrom('moods').select(['id', 'date', 'mood_score', 'emotions']).where('user_id', '=', userId).orderBy).toHaveBeenCalledWith('date', 'desc');
    });
  });

  describe('createMood', () => {
    it('should create a new mood entry', async () => {
      const userId = 1;
      const moodData = { date: '2023-08-03', mood_score: 8, emotions: ['happy', 'relaxed'] };
      const createdMood = { id: 1, ...moodData };

      mockKysely.insertInto = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockReturnThis(),
        executeTakeFirst: vi.fn().mockResolvedValue(createdMood)
      });

      const result = await moodService.createMood(userId, moodData);

      expect(result).toEqual(createdMood);
      expect(mockKysely.insertInto).toHaveBeenCalledWith('moods');
      expect(mockKysely.insertInto('moods').values).toHaveBeenCalledWith({ ...moodData, user_id: userId });
      expect(mockKysely.insertInto('moods').values({ ...moodData, user_id: userId }).returning).toHaveBeenCalledWith(['id', 'date', 'mood_score', 'emotions']);
    });
  });

  describe('getMoodsByDateRange', () => {
    it('should return moods within a date range', async () => {
      const userId = 1;
      const startDate = '2023-01-01';
      const endDate = '2023-01-31';
      const mockMoods = [
        { id: 1, date: '2023-01-15', mood_score: 7, emotions: ['happy'] },
        { id: 2, date: '2023-01-20', mood_score: 6, emotions: ['content'] },
      ];

      mockKysely.selectFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue(mockMoods)
      });

      const result = await moodService.getMoodsByDateRange(userId, startDate, endDate);

      expect(result).toEqual(mockMoods);
      expect(mockKysely.selectFrom).toHaveBeenCalledWith('moods');
      expect(mockKysely.selectFrom('moods').select).toHaveBeenCalledWith(['id', 'date', 'mood_score', 'emotions']);
      expect(mockKysely.selectFrom('moods').select(['id', 'date', 'mood_score', 'emotions']).where).toHaveBeenCalledWith('user_id', '=', userId);
      expect(mockKysely.selectFrom('moods').select(['id', 'date', 'mood_score', 'emotions']).where('user_id', '=', userId).where).toHaveBeenCalledWith('date', '>=', startDate);
      expect(mockKysely.selectFrom('moods').select(['id', 'date', 'mood_score', 'emotions']).where('user_id', '=', userId).where('date', '>=', startDate).where).toHaveBeenCalledWith('date', '<=', endDate);
      expect(mockKysely.selectFrom('moods').select(['id', 'date', 'mood_score', 'emotions']).where('user_id', '=', userId).where('date', '>=', startDate).where('date', '<=', endDate).orderBy).toHaveBeenCalledWith('date', 'asc');
    });
  });
});