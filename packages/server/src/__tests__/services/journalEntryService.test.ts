import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mockKysely } from '../mocks/databaseMock'
import * as sentimentService from '../../services/sentimentService'

vi.mock('../../database', () => ({
  db: mockKysely,
}))

vi.mock('../../services/sentimentService')

const journalEntryServiceModule = await vi.importActual(
  '../../services/journalEntryService'
)
const { journalEntryService } =
  journalEntryServiceModule as typeof import('../../services/journalEntryService')

describe('journalEntryService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createJournalEntry', () => {
    it('should create and return a new journal entry', async () => {
      const userId = 1
      const entryData = {
        date: '2023-07-27T00:00:00.000Z',
        entry: 'Today was a great day!',
      }
      const mockSentimentScore = 8.0
      const mockCreatedEntry = {
        id: 1,
        ...entryData,
        sentiment: mockSentimentScore,
      }

      // Mock the analyze function
      vi.spyOn(sentimentService, 'analyze').mockResolvedValue(
        mockSentimentScore
      )

      mockKysely.insertInto = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockReturnThis(),
        executeTakeFirst: vi.fn().mockResolvedValue(mockCreatedEntry),
      })

      const result = await journalEntryService.createJournalEntry(
        userId,
        entryData
      )

      expect(result).toEqual(mockCreatedEntry)
      expect(sentimentService.analyze).toHaveBeenCalledWith(entryData.entry)
      expect(mockKysely.insertInto).toHaveBeenCalledWith('journal_entries')
      expect(
        mockKysely.insertInto('journal_entries').values
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          ...entryData,
          user_id: userId,
          sentiment: mockSentimentScore,
        })
      )
      expect(
        mockKysely.insertInto('journal_entries').values(expect.any(Object))
          .returning
      ).toHaveBeenCalledWith(['id', 'date', 'entry', 'sentiment'])
    })
  })
})
