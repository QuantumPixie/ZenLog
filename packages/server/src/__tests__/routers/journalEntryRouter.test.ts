import { describe, it, expect, vi, beforeEach } from 'vitest';
import { router, authedProcedure, createCallerFactory } from '../mocks/trpcMock';
import { z } from 'zod';
import { journalEntryService } from '../../services/journalEntryService';
import type { JournalEntryTable } from '../../models/journalEntry';


vi.mock('../../services/journalEntryService', () => ({
  journalEntryService: {
    getJournalEntries: vi.fn(),
    createJournalEntry: vi.fn(),
    getJournalEntriesByDateRange: vi.fn(),
  },
}));

// type guard
function isJournalEntryTable(obj: unknown): obj is JournalEntryTable {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'user_id' in obj &&
    'date' in obj &&
    'entry' in obj &&
    'sentiment' in obj
  );
}

// Type guard for array of JournalEntryTable
function isJournalEntryTableArray(arr: unknown): arr is JournalEntryTable[] {
  return Array.isArray(arr) && arr.every(isJournalEntryTable);
}

// create a mock router
const mockJournalEntryRouter = router({
  getJournalEntries: authedProcedure.query(async ({ ctx }) => {
    return journalEntryService.getJournalEntries(ctx.user.id);
  }),
  createJournalEntry: authedProcedure
    .input(z.object({
      date: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Date must be a valid date string",
      }),
      entry: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return journalEntryService.createJournalEntry(ctx.user.id, input);
    }),
  getJournalEntriesByDateRange: authedProcedure
    .input(z.object({
      startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Start date must be a valid date string",
      }),
      endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "End date must be a valid date string",
      }),
    }))
    .query(async ({ ctx, input }) => {
      return journalEntryService.getJournalEntriesByDateRange(ctx.user.id, input.startDate, input.endDate);
    }),
});

// caller factory
const createCaller = createCallerFactory(mockJournalEntryRouter);

describe('journalEntryRouter', () => {
  const mockJournalEntry = {
    id: 1,
    user_id: 1,
    date: '2023-08-01',
    entry: 'Test entry 1',
    sentiment: 7,
  };
  const mockJournalEntries = [
    mockJournalEntry,
    {
      id: 2,
      user_id: 1,
      date: '2023-08-02',
      entry: 'Test entry 2',
      sentiment: 8,
    },
  ];
  const mockUserId = 1;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should get journal entries', async () => {
    vi.mocked(journalEntryService.getJournalEntries).mockResolvedValue(mockJournalEntries);

    const caller = createCaller({ user: { id: mockUserId } });
    const result = await caller.getJournalEntries();

    expect(isJournalEntryTableArray(result)).toBe(true);
    expect(result).toEqual(mockJournalEntries);
    expect(journalEntryService.getJournalEntries).toHaveBeenCalledWith(mockUserId);
  });

  it('should create a new journal entry', async () => {
    const newEntry = {
      date: '2023-08-01',
      entry: 'Test entry',
    };
    const createdEntry = {
      ...newEntry,
      id: 1,
      user_id: mockUserId,
      sentiment: 7,
    };

    vi.mocked(journalEntryService.createJournalEntry).mockResolvedValue(createdEntry);

    const caller = createCaller({ user: { id: mockUserId } });
    const result = await caller.createJournalEntry(newEntry);

    expect(isJournalEntryTable(result)).toBe(true);
    expect(result).toEqual(createdEntry);
    expect(journalEntryService.createJournalEntry).toHaveBeenCalledWith(mockUserId, newEntry);
  });

  it('should get journal entries by date range', async () => {
    vi.mocked(journalEntryService.getJournalEntriesByDateRange).mockResolvedValue(mockJournalEntries);

    const caller = createCaller({ user: { id: mockUserId } });
    const result = await caller.getJournalEntriesByDateRange({
      startDate: '2023-08-01',
      endDate: '2023-08-31',
    });

    expect(isJournalEntryTableArray(result)).toBe(true);
    expect(result).toEqual(mockJournalEntries);
    expect(journalEntryService.getJournalEntriesByDateRange).toHaveBeenCalledWith(mockUserId, '2023-08-01', '2023-08-31');
  });

  it('should handle empty result for getJournalEntriesByDateRange', async () => {
    vi.mocked(journalEntryService.getJournalEntriesByDateRange).mockResolvedValue([]);

    const caller = createCaller({ user: { id: mockUserId } });
    const result = await caller.getJournalEntriesByDateRange({
      startDate: '2023-01-01',
      endDate: '2023-01-02',
    });

    expect(isJournalEntryTableArray(result)).toBe(true);
    expect(result).toEqual([]);
  });

  it('should reject invalid date for createJournalEntry', async () => {
    const invalidEntry = {
      date: 'invalid-date',
      entry: 'Test entry',
    };

    const caller = createCaller({ user: { id: mockUserId } });
    await expect(caller.createJournalEntry(invalidEntry))
      .rejects.toThrow('Date must be a valid date string');
  });
});