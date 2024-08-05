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
type SimplifiedMood = {
  id: number;
  date: string;
  mood_score: number;
  emotions: string[];
};

vi.mock('../../services/moodService', () => ({
  moodService: {
    getMoods: vi.fn(),
    createMood: vi.fn(),
    getMoodsByDateRange: vi.fn(),
  },
}));

vi.mock('../../middleware/auth', () => ({
  authenticateJWT: (_req: Request, _res: Response, next: () => void) => next(),
}));

import { moodService } from '../../services/moodService';

// Constants
const TEST_USER_ID = 1;
const TEST_PORT = 0;

type CustomContext = {
  req: express.Request;
  res: express.Response;
  user: User;
};

describe('Mood Router', () => {
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

  it('should get moods', async () => {
    const mockMoods: SimplifiedMood[] = [
      { id: 1, date: '2024-08-02', mood_score: 7, emotions: ['happy', 'excited'] },
      { id: 2, date: '2024-08-03', mood_score: 6, emotions: ['calm'] },
    ];

    vi.mocked(moodService.getMoods).mockResolvedValue(mockMoods);

    const result = await client.mood.getMoods.query();

    expect(result).toEqual(mockMoods);
    expect(moodService.getMoods).toHaveBeenCalledWith(TEST_USER_ID);
  });

  it('should create a new mood', async () => {
    const newMood = {
      date: '2024-08-04',
      mood_score: 8,
      emotions: ['happy', 'relaxed'],
    };
    const createdMood: SimplifiedMood = {
      id: 3,
      ...newMood,
    };

    vi.mocked(moodService.createMood).mockResolvedValue(createdMood);

    const result = await client.mood.createMood.mutate(newMood);

    expect(result).toEqual(createdMood);
    expect(moodService.createMood).toHaveBeenCalledWith(TEST_USER_ID, newMood);
  });

  it('should get moods by date range', async () => {
    const startDate = '2024-08-01';
    const endDate = '2024-08-31';
    const mockMoods: SimplifiedMood[] = [
      { id: 1, date: '2024-08-02', mood_score: 7, emotions: ['happy', 'excited'] },
      { id: 2, date: '2024-08-03', mood_score: 6, emotions: ['calm'] },
    ];

    vi.mocked(moodService.getMoodsByDateRange).mockResolvedValue(mockMoods);

    const result = await client.mood.getMoodsByDateRange.query({
      startDate,
      endDate,
    });

    expect(result).toEqual(mockMoods);
    expect(moodService.getMoodsByDateRange).toHaveBeenCalledWith(TEST_USER_ID, startDate, endDate);
  });

  it('should handle empty result for getMoodsByDateRange', async () => {
    vi.mocked(moodService.getMoodsByDateRange).mockResolvedValue([]);

    const result = await client.mood.getMoodsByDateRange.query({
      startDate: '2024-09-01',
      endDate: '2024-09-02',
    });

    expect(result).toEqual([]);
  });

  it('should handle database errors', async () => {
    vi.mocked(moodService.getMoods).mockRejectedValue(new Error('Database error'));

    await expect(client.mood.getMoods.query())
      .rejects.toThrow('Database error');
  });

  it('should reject invalid mood_score for createMood', async () => {
    const invalidMood = {
      date: '2024-08-04',
      mood_score: 11, // Invalid: should be between 1 and 10
      emotions: ['happy'],
    };

    await expect(client.mood.createMood.mutate(invalidMood))
      .rejects.toThrowError(TRPCClientError);

    await expect(client.mood.createMood.mutate(invalidMood))
      .rejects.toMatchObject({
        name: 'TRPCClientError',
        message: expect.stringContaining('Number must be less than or equal to 10'),
        data: {
          code: 'BAD_REQUEST',
          httpStatus: 400,
          path: 'mood.createMood',
          stack: expect.any(String)
        }
      });
  });

  it('should reject invalid date for createMood', async () => {
    const invalidMood = {
      date: 'invalid-date',
      mood_score: 7,
      emotions: ['happy'],
    };

    await expect(client.mood.createMood.mutate(invalidMood))
      .rejects.toThrowError(TRPCClientError);

    await expect(client.mood.createMood.mutate(invalidMood))
      .rejects.toMatchObject({
        name: 'TRPCClientError',
        message: expect.stringContaining('Invalid date'),
        data: {
          code: 'BAD_REQUEST',
          httpStatus: 400,
          path: 'mood.createMood',
          stack: expect.any(String)
        }
      });
  });
});