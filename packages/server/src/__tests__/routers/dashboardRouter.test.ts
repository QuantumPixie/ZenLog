import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../server';
import { createServer, Server } from 'http';
import express from 'express';
import { appRouter } from '../../server';
import * as trpcExpress from '@trpc/server/adapters/express';
import cors from 'cors';
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import type { User } from '@server/types/customRequest';
import type { DashboardSummary } from '../../types/dashboard';

vi.mock('../../services/dashboardService', () => ({
  dashboardService: {
    getSummary: vi.fn(),
  },
}));

vi.mock('../../middleware/auth', () => ({
  authenticateJWT: (_req: Request, _res: Response, next: () => void) => next(),
}));

import { dashboardService } from '../../services/dashboardService';

// Constants
const TEST_USER_ID = 1;
const TEST_PORT = 0;

type CustomContext = {
  req: express.Request;
  res: express.Response;
  user: User;
};

describe('Dashboard Router', () => {
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
          createContext: (_: CreateExpressContextOptions): CustomContext => {
            console.log(_);
            return {
              req: {} as express.Request,
              res: {} as express.Response,
              user: { id: TEST_USER_ID, email: 'test@example.com' },
            };
          }
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

  it('should get dashboard summary', async () => {
    const mockSummary: DashboardSummary = {
      recentMoods: [
        { date: '2024-08-02', mood_score: 7, emotions: ['happy', 'energetic'] },
        { date: '2024-08-01', mood_score: 6, emotions: ['calm'] },
      ],
      recentEntries: [
        { date: '2024-08-02', entry: 'Had a great day!' },
        { date: '2024-08-01', entry: 'Feeling reflective today.' },
      ],
      recentActivities: [
        { date: '2024-08-02', activity: 'Running', duration: 30, notes: 'Felt energized' },
        { date: '2024-08-01', activity: 'Meditation', duration: 15, notes: 'Very relaxing' },
      ],
      averageMoodLastWeek: 6.5,
    };

    vi.mocked(dashboardService.getSummary).mockResolvedValue(mockSummary);

    const result = await client.dashboard.getSummary.query();

    expect(result).toEqual(mockSummary);
    expect(dashboardService.getSummary).toHaveBeenCalledWith(TEST_USER_ID);
  });

  it('should handle null average mood', async () => {
    const mockSummary: DashboardSummary = {
      recentMoods: [],
      recentEntries: [],
      recentActivities: [],
      averageMoodLastWeek: null,
    };

    vi.mocked(dashboardService.getSummary).mockResolvedValue(mockSummary);

    const result = await client.dashboard.getSummary.query();

    expect(result).toEqual(mockSummary);
    expect(dashboardService.getSummary).toHaveBeenCalledWith(TEST_USER_ID);
  });

  it('should handle empty recent data', async () => {
    const mockSummary: DashboardSummary = {
      recentMoods: [],
      recentEntries: [],
      recentActivities: [],
      averageMoodLastWeek: 7,
    };

    vi.mocked(dashboardService.getSummary).mockResolvedValue(mockSummary);

    const result = await client.dashboard.getSummary.query();

    expect(result).toEqual(mockSummary);
    expect(dashboardService.getSummary).toHaveBeenCalledWith(TEST_USER_ID);
  });

  it('should handle database errors', async () => {
    vi.mocked(dashboardService.getSummary).mockRejectedValue(new Error('Database error'));

    await expect(client.dashboard.getSummary.query()).rejects.toThrow('Database error');
  });
});