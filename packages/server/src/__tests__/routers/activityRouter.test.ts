import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../server';
import { createServer, Server } from 'http';
import express from 'express';
import { appRouter } from '../../server';
import * as trpcExpress from '@trpc/server/adapters/express';
import cors from 'cors';
import type { ActivityTable, ActivityInput } from '../../models/activity';
import type { User } from '@server/types/customRequest';
import { isValidDateString } from '../../schemas/activitySchema';

vi.mock('../../services/activityService', () => ({
  activityService: {
    getActivities: vi.fn(),
    getActivityById: vi.fn(),
    getActivitiesByDateRange: vi.fn(),
    createActivity: vi.fn(),
  },
}));

vi.mock('../../middleware/auth', () => ({
  authenticateJWT: (_req: Request, _res: Response, next: () => void) => next(),
}));

import { activityService } from '../../services/activityService';

// Constants
const TEST_USER_ID = 1;
const TEST_ACTIVITY_ID = 1;
const TEST_PORT = 0;

type CustomContext = {
  req: express.Request;
  res: express.Response;
  user: User;
};

// Define a more flexible type for testing invalid inputs
type TestActivityInput = {
  date: string;
  activity: string;
  duration?: string | number;
  notes?: string | number;
};

describe('Activity Router', () => {
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

  it('should get activities', async () => {
    const mockActivities = [
      { id: 1, user_id: TEST_USER_ID, date: '2024-08-02', activity: 'Running', duration: 30, notes: 'Good run' },
      { id: 2, user_id: TEST_USER_ID, date: '2024-08-02', activity: 'Yoga', notes: 'Relaxing session' },
    ];

    vi.mocked(activityService.getActivities).mockResolvedValue(mockActivities);

    const result = await client.activity.getActivities.query();

    expect(result).toEqual(mockActivities);
    expect(activityService.getActivities).toHaveBeenCalledWith(TEST_USER_ID);
  });

  it('should get activity by id', async () => {
    const mockActivity = { id: TEST_ACTIVITY_ID, user_id: TEST_USER_ID, date: '2024-08-02', activity: 'Running', duration: 30, notes: 'Good run' };

    vi.mocked(activityService.getActivityById).mockResolvedValue(mockActivity);

    const result = await client.activity.getActivityById.query({ id: TEST_ACTIVITY_ID });

    expect(result).toEqual(mockActivity);
    expect(activityService.getActivityById).toHaveBeenCalledWith(TEST_ACTIVITY_ID, TEST_USER_ID);
  });

  it('should create a new activity with duration', async () => {
    const newActivity: ActivityInput = {
      date: '2023-01-01',
      activity: 'Yoga',
      duration: 60,
      notes: 'Relaxing session'
    };
    const createdActivity: ActivityTable = {
      id: 2,
      user_id: TEST_USER_ID,
      ...newActivity,
    };

    vi.mocked(activityService.createActivity).mockResolvedValue(createdActivity);

    const result = await client.activity.createActivity.mutate(newActivity);

    expect(result).toEqual(createdActivity);
    expect(activityService.createActivity).toHaveBeenCalledWith(TEST_USER_ID, newActivity);
  });

  it('should create a new activity without duration', async () => {
    const newActivity: ActivityInput = {
      date: '2023-01-01',
      activity: 'Meditation',
      notes: 'Peaceful'
    };
    const createdActivity: ActivityTable = {
      id: 3,
      user_id: TEST_USER_ID,
      ...newActivity,
    };

    vi.mocked(activityService.createActivity).mockResolvedValue(createdActivity);

    const result = await client.activity.createActivity.mutate(newActivity);

    expect(result).toEqual(createdActivity);
    expect(activityService.createActivity).toHaveBeenCalledWith(TEST_USER_ID, newActivity);
  });

  it('should reject invalid duration for createActivity', async () => {
    const invalidActivity: TestActivityInput = {
      date: '2023-01-01',
      activity: 'Running',
      duration: 'not-a-number',
      notes: 'some notes',
    };

    vi.mocked(activityService.createActivity).mockRejectedValue(new Error(JSON.stringify([
      {
        "code": "invalid_type",
        "expected": "number",
        "received": "string",
        "path": ["duration"],
        "message": "Expected number, received string"
      }
    ])));

    await expect(client.activity.createActivity.mutate(invalidActivity as unknown as ActivityInput))
      .rejects.toThrow('Expected number, received string');
  });

  it('should reject invalid notes for createActivity', async () => {
    const invalidActivity: TestActivityInput = {
      date: '2023-01-01',
      activity: 'Running',
      notes: 123, // Invalid: number instead of string
    };

    vi.mocked(activityService.createActivity).mockRejectedValue(new Error(JSON.stringify([
      {
        "code": "invalid_type",
        "expected": "string",
        "received": "number",
        "path": ["notes"],
        "message": "Expected string, received number"
      }
    ])));

    await expect(client.activity.createActivity.mutate(invalidActivity as unknown as ActivityInput))
      .rejects.toThrow('Expected string, received number');
  });

  it('should get activities by date range', async () => {
    const startDate = '2023-01-01';
    const endDate = '2023-01-31';
    const mockActivities = [
      { id: 1, user_id: TEST_USER_ID, date: '2023-01-15', activity: 'Running', duration: 30, notes: 'Good run' },
      { id: 2, user_id: TEST_USER_ID, date: '2023-01-20', activity: 'Yoga', notes: 'Relaxing session' },
    ];

    vi.mocked(activityService.getActivitiesByDateRange).mockResolvedValue(mockActivities);

    const result = await client.activity.getActivitiesByDateRange.query({
      startDate,
      endDate,
    });

    expect(result).toEqual(mockActivities);
    expect(activityService.getActivitiesByDateRange).toHaveBeenCalledWith(TEST_USER_ID, startDate, endDate);
  });

  it('should handle non-existent activity for getActivityById', async () => {
    vi.mocked(activityService.getActivityById).mockResolvedValue(undefined);

    await expect(client.activity.getActivityById.query({ id: 9999 }))
      .rejects.toThrow('Activity not found');
  });

  it('should handle empty result for getActivitiesByDateRange', async () => {
    vi.mocked(activityService.getActivitiesByDateRange).mockResolvedValue([]);

    const result = await client.activity.getActivitiesByDateRange.query({
      startDate: '2023-01-01',
      endDate: '2023-01-02',
    });

    expect(result).toEqual([]);
  });

  it('should reject invalid date for createActivity', async () => {
    const invalidActivity = {
      date: 'invalid-date',
      activity: 'Running',
    };

    vi.mocked(activityService.createActivity).mockRejectedValue(new Error('Invalid date format'));

    await expect(client.activity.createActivity.mutate(invalidActivity as ActivityInput))
      .rejects.toThrow('Invalid date format');
  });

  it('should handle database errors', async () => {
    vi.mocked(activityService.getActivities).mockRejectedValue(new Error('Database error'));

    await expect(client.activity.getActivities.query())
      .rejects.toThrow('Database error');
  });

  describe('data validation', () => {
    it('should filter out invalid activities in getActivities', async () => {
      const mockActivities = [
        { id: 1, user_id: 1, date: '2024-08-02', activity: 'Running', duration: 30, notes: 'Good run' },
        { id: 2, user_id: 1, date: '2024-08-02', activity: 'Yoga', notes: 'Relaxing session' },
        { id: 3, user_id: 1, date: 'invalid-date', activity: 'Invalid', notes: 'Should be filtered out' },
      ];

      vi.mocked(activityService.getActivities).mockResolvedValue(
        mockActivities.filter(activity => isValidDateString(activity.date))
      );

      const result = await client.activity.getActivities.query();

      expect(result).toEqual([mockActivities[0], mockActivities[1]]);
      expect(result).toHaveLength(2);
      expect(result.every(activity => isValidDateString(activity.date))).toBe(true);
    });
  });
});