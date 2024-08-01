import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockKysely } from '../mocks/databaseMock';
import { sentimentService } from '../../services/sentimentService';


vi.mock('../../database', () => ({
  db: mockKysely
}));

vi.mock('../../services/sentimentService');


const journalEntryServiceModule = await vi.importActual('../../services/journalEntryService');
const { journalEntryService } = journalEntryServiceModule as typeof import('../../services/journalEntryService');

describe('journalEntryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createJournalEntry', () => {
    it('should create and return a new journal entry', async () => {
      const userId = 1;
      const entryData = { date: new Date('2023-07-27'), entry: 'Today was a great day!' };
      const mockSentimentResult = { score: 0.8 };
      const mockCreatedEntry = { id: 1, ...entryData, sentiment: 0.8 };

      vi.mocked(sentimentService.analyze).mockReturnValue(mockSentimentResult);

      mockKysely.insertInto = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockReturnThis(),
        executeTakeFirst: vi.fn().mockResolvedValue(mockCreatedEntry)
      });

      const result = await journalEntryService.createJournalEntry(userId, entryData);

      expect(result).toEqual(mockCreatedEntry);
      expect(sentimentService.analyze).toHaveBeenCalledWith(entryData.entry);
      expect(mockKysely.insertInto).toHaveBeenCalledWith('journal_entries');
      expect(mockKysely.insertInto('journal_entries').values).toHaveBeenCalledWith(expect.objectContaining({
        ...entryData,
        user_id: userId,
        sentiment: 0.8,
      }));
      expect(mockKysely.insertInto('journal_entries').values(expect.any(Object)).returning).toHaveBeenCalledWith(['id', 'date', 'entry', 'sentiment']);
    });
  });
});