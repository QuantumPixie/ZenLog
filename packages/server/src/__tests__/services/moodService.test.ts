import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mockKysely } from '../mocks/databaseMock'

vi.mock('../../database', () => ({
  db: mockKysely,
}))

const moodServiceModule = await vi.importActual('../../services/moodService')
const { moodService } =
  moodServiceModule as typeof import('../../services/moodService')

describe('moodService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getMoods', () => {
    it('should return moods for a user', async () => {
      const userId = 1
      const mockMoods = [
        {
          id: 1,
          date: '2023-08-03',
          mood_score: 7,
          emotions: ['happy', 'excited'],
        },
        { id: 2, date: '2023-08-02', mood_score: 5, emotions: ['neutral'] },
      ]

      const mockSelect = vi.fn().mockReturnThis()
      const mockWhere = vi.fn().mockReturnThis()
      const mockOrderBy = vi.fn().mockReturnThis()
      const mockExecute = vi.fn().mockResolvedValue(mockMoods)

      mockKysely.selectFrom = vi.fn().mockReturnValue({
        select: mockSelect,
        where: mockWhere,
        orderBy: mockOrderBy,
        execute: mockExecute,
      })

      const result = await moodService.getMoods(userId)

      expect(result).toEqual(mockMoods)
      expect(mockKysely.selectFrom).toHaveBeenCalledWith('moods')
      expect(mockSelect).toHaveBeenCalledWith([
        'id',
        'date',
        'mood_score',
        'emotions',
      ])
      expect(mockWhere).toHaveBeenCalledWith('user_id', '=', userId)
      expect(mockOrderBy).toHaveBeenCalledWith('date', 'desc')
      expect(mockExecute).toHaveBeenCalled()
    })
  })

  describe('createMood', () => {
    it('should create a new mood entry', async () => {
      const userId = 1
      const moodData = {
        date: '2023-08-03',
        mood_score: 8,
        emotions: ['happy', 'relaxed'],
      }
      const createdMood = { id: 1, ...moodData }

      const mockValues = vi.fn().mockReturnThis()
      const mockReturning = vi.fn().mockReturnThis()
      const mockExecuteTakeFirst = vi.fn().mockResolvedValue(createdMood)

      mockKysely.insertInto = vi.fn().mockReturnValue({
        values: mockValues,
        returning: mockReturning,
        executeTakeFirst: mockExecuteTakeFirst,
      })

      const result = await moodService.createMood(userId, moodData)

      expect(result).toEqual(createdMood)
      expect(mockKysely.insertInto).toHaveBeenCalledWith('moods')
      expect(mockValues).toHaveBeenCalledWith({
        ...moodData,
        user_id: userId,
      })
      expect(mockReturning).toHaveBeenCalledWith([
        'id',
        'date',
        'mood_score',
        'emotions',
      ])
      expect(mockExecuteTakeFirst).toHaveBeenCalled()
    })
  })

  describe('getMoodsByDateRange', () => {
    it('should return moods within a date range', async () => {
      const userId = 1
      const startDate = '2023-01-01'
      const endDate = '2023-01-31'
      const mockMoods = [
        { id: 1, date: '2023-01-15', mood_score: 7, emotions: ['happy'] },
        { id: 2, date: '2023-01-20', mood_score: 6, emotions: ['content'] },
      ]

      const mockSelect = vi.fn().mockReturnThis()
      const mockWhere = vi.fn().mockReturnThis()
      const mockOrderBy = vi.fn().mockReturnThis()
      const mockExecute = vi.fn().mockResolvedValue(mockMoods)

      mockKysely.selectFrom = vi.fn().mockReturnValue({
        select: mockSelect,
        where: mockWhere,
        orderBy: mockOrderBy,
        execute: mockExecute,
      })

      const result = await moodService.getMoodsByDateRange(
        userId,
        startDate,
        endDate
      )

      expect(result).toEqual(mockMoods)
      expect(mockKysely.selectFrom).toHaveBeenCalledWith('moods')
      expect(mockSelect).toHaveBeenCalledWith([
        'id',
        'date',
        'mood_score',
        'emotions',
      ])
      expect(mockWhere).toHaveBeenCalledWith('user_id', '=', userId)
      expect(mockWhere).toHaveBeenCalledWith('date', '>=', startDate)
      expect(mockWhere).toHaveBeenCalledWith('date', '<=', endDate)
      expect(mockOrderBy).toHaveBeenCalledWith('date', 'asc')
      expect(mockExecute).toHaveBeenCalled()
    })
  })
})
