import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../server';
import { createServer, Server } from 'http';
import express from 'express';
import { appRouter } from '../../server';
import * as trpcExpress from '@trpc/server/adapters/express';
import cors from 'cors';
import type { User } from '@server/types/customRequest';
import { TRPCClientError } from '@trpc/client';

// simplified type for testing
type SimplifiedJournalEntry = {
  id: number;
  date: string;
  entry: string;
  sentiment: number;
};

vi.mock('../../services/journalEntryService', () => ({
  journalEntryService: {
    getJournalEntries: vi.fn(),
    createJournalEntry: vi.fn(),
    getJournalEntriesByDateRange: vi.fn(),
  },
}));

vi.mock('../../middleware/auth', () => ({
  authenticateJWT: (_req: Request, _res: Response, next: () => void) => next(),
}));

import { journalEntryService } from '../../services/journalEntryService';

// Constants
const TEST_USER_ID = 1;
const TEST_PORT = 0;

type CustomContext = {
  req: express.Request;
  res: express.Response;
  user: User;
};

describe('Journal Entry Router', () => {
  let server: Server;
  let client: ReturnType<typeof createTRPCProxyClient<AppRouter>>;

  const setupServer = () => {
    return new Promise<void>((resolve) => {
      const app = express();
      app.use(cors());
      app.use(express.json());

      app.use(
        '/api/trpc',
        trpcExpress.createExpressMiddleware({
          router: appRouter,
          createContext: (): CustomContext => ({
            req: {} as express.Request,
            res: {} as express.Response,
            user: { id: TEST_USER_ID, email: 'test@example.com' },
          }),
        })
      );

      server = createServer(app);
      server.listen(TEST_PORT, () => {
        const address = server.address() as { port: number };
        const port = address.port;
        client = createTRPCProxyClient<AppRouter>({
          links: [
            httpBatchLink({
              url: `http://localhost:${port}/api/trpc`,
            }),
          ],
        });
        resolve();
      });
    });
  };

  beforeAll(async () => {
    await setupServer();
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should get journal entries', async () => {
    const mockEntries: SimplifiedJournalEntry[] = [
      { id: 1, date: '2023-08-01', entry: 'Test entry 1', sentiment: 7 },
      { id: 2, date: '2023-08-02', entry: 'Test entry 2', sentiment: 8 },
    ];

    vi.mocked(journalEntryService.getJournalEntries).mockResolvedValue(mockEntries as SimplifiedJournalEntry[]);

    const result = await client.journalEntry.getJournalEntries.query();

    expect(result).toEqual(mockEntries);
    expect(journalEntryService.getJournalEntries).toHaveBeenCalledWith(TEST_USER_ID);
  });

  it('should create a new journal entry', async () => {
    const newEntry = {
      date: '2023-08-01',
      entry: 'Test entry',
    };
    const createdEntry: SimplifiedJournalEntry = {
      id: 1,
      date: newEntry.date,
      entry: newEntry.entry,
      sentiment: 7, // Mocked sentiment score
    };

    vi.mocked(journalEntryService.createJournalEntry).mockResolvedValue(createdEntry as SimplifiedJournalEntry);

    const result = await client.journalEntry.createJournalEntry.mutate(newEntry);

    expect(result).toEqual(createdEntry);
    expect(journalEntryService.createJournalEntry).toHaveBeenCalledWith(TEST_USER_ID, newEntry);
  });

  it('should get journal entries by date range', async () => {
    const startDate = '2023-08-01';
    const endDate = '2023-08-31';
    const mockEntries: SimplifiedJournalEntry[] = [
      { id: 1, date: '2023-08-15', entry: 'Mid-month entry', sentiment: 6 },
      { id: 2, date: '2023-08-20', entry: 'Late-month entry', sentiment: 8 },
    ];

    vi.mocked(journalEntryService.getJournalEntriesByDateRange).mockResolvedValue(mockEntries as SimplifiedJournalEntry[]);

    const result = await client.journalEntry.getJournalEntriesByDateRange.query({
      startDate,
      endDate,
    });

    expect(result).toEqual(mockEntries);
    expect(journalEntryService.getJournalEntriesByDateRange).toHaveBeenCalledWith(TEST_USER_ID, startDate, endDate);
  });

  it('should handle empty result for getJournalEntriesByDateRange', async () => {
    vi.mocked(journalEntryService.getJournalEntriesByDateRange).mockResolvedValue([]);

    const result = await client.journalEntry.getJournalEntriesByDateRange.query({
      startDate: '2023-01-01',
      endDate: '2023-01-02',
    });

    expect(result).toEqual([]);
  });

  it('should handle database errors', async () => {
    vi.mocked(journalEntryService.getJournalEntries).mockRejectedValue(new Error('Database error'));

    await expect(client.journalEntry.getJournalEntries.query())
      .rejects.toThrow('Database error');
  });

  it('should reject invalid date for createJournalEntry', async () => {
    const invalidEntry = {
      date: 'invalid-date',
      entry: 'Test entry',
    };

    await expect(client.journalEntry.createJournalEntry.mutate(invalidEntry))
      .rejects.toThrowError(TRPCClientError);

    await expect(client.journalEntry.createJournalEntry.mutate(invalidEntry))
      .rejects.toMatchObject({
        name: 'TRPCClientError',
        data: {
          code: 'BAD_REQUEST',
          httpStatus: 400,
          path: 'journalEntry.createJournalEntry',
          stack: expect.any(String)
        }
      });

    await expect(client.journalEntry.createJournalEntry.mutate(invalidEntry))
      .rejects.toThrow('Date must be a valid date string');
  });
});