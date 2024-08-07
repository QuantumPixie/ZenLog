import { describe, it, expect, vi, beforeEach } from 'vitest';
import { router, authedProcedure, createCallerFactory } from '../mocks/trpcMock';
import { z } from 'zod';
import { activityService } from '../../services/activityService';
import type { ActivityTable } from '../../models/activity';

// Mock the activityService
vi.mock('../../services/activityService', () => ({
  activityService: {
    getActivities: vi.fn(),
    getActivityById: vi.fn(),
    createActivity: vi.fn(),
    getActivitiesByDateRange: vi.fn(),
  },
}));

// Create a mock router using our mocked tRPC setup
const mockActivityRouter = router({
  getActivities: authedProcedure.query(async ({ ctx }) => {
    return activityService.getActivities(ctx.user.id);
  }),
  getActivityById: authedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const activity = await activityService.getActivityById(input.id, ctx.user.id);
      if (!activity) {
        throw new Error('Activity not found');
      }
      return activity;
    }),
  createActivity: authedProcedure
    .input(z.object({
      date: z.string(),
      activity: z.string(),
      duration: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return activityService.createActivity(ctx.user.id, input);
    }),
  getActivitiesByDateRange: authedProcedure
    .input(z.object({
      startDate: z.string(),
      endDate: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      return activityService.getActivitiesByDateRange(ctx.user.id, input.startDate, input.endDate);
    }),
});

// Create a caller factory
const createCaller = createCallerFactory(mockActivityRouter);

describe('activityRouter', () => {
  const mockActivity: ActivityTable = { 
    id: 1, 
    user_id: 1,
    date: '2024-08-02', 
    activity: 'Running', 
    duration: 30, 
    notes: 'Good run' 
  };
  const mockActivities: ActivityTable[] = [
    mockActivity, 
    { 
      id: 2, 
      user_id: 1,
      date: '2024-08-03', 
      activity: 'Yoga', 
      notes: 'Relaxing session',
      duration: undefined
    }
  ];
  const mockUserId = 1;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should get activities', async () => {
    vi.mocked(activityService.getActivities).mockResolvedValue(mockActivities);

    const caller = createCaller({ user: { id: mockUserId } });
    const result = await caller.getActivities();

    expect(result).toEqual(mockActivities);
    expect(activityService.getActivities).toHaveBeenCalledWith(mockUserId);
  });

  it('should get activity by id', async () => {
    vi.mocked(activityService.getActivityById).mockResolvedValue(mockActivity);

    const caller = createCaller({ user: { id: mockUserId } });
    const result = await caller.getActivityById({ id: mockActivity.id });

    expect(result).toEqual(mockActivity);
    expect(activityService.getActivityById).toHaveBeenCalledWith(mockActivity.id, mockUserId);
  });

  it('should throw error when activity not found', async () => {
    vi.mocked(activityService.getActivityById).mockResolvedValue(undefined);

    const caller = createCaller({ user: { id: mockUserId } });
    await expect(caller.getActivityById({ id: 3 }))
      .rejects.toThrow('Activity not found');
  });

  it('should create a new activity', async () => {
    const newActivity = {
      date: '2024-08-04',
      activity: 'Swimming',
      duration: 45,
      notes: 'Refreshing swim',
    };
    const createdActivity: ActivityTable = { 
      ...newActivity, 
      id: 3, 
      user_id: mockUserId 
    };
    vi.mocked(activityService.createActivity).mockResolvedValue(createdActivity);

    const caller = createCaller({ user: { id: mockUserId } });
    const result = await caller.createActivity(newActivity);

    expect(result).toEqual(createdActivity);
    expect(activityService.createActivity).toHaveBeenCalledWith(mockUserId, newActivity);
  });

  it('should get activities by date range', async () => {
    vi.mocked(activityService.getActivitiesByDateRange).mockResolvedValue(mockActivities);

    const caller = createCaller({ user: { id: mockUserId } });
    const result = await caller.getActivitiesByDateRange({
      startDate: '2024-08-02',
      endDate: '2024-08-03',
    });

    expect(result).toEqual(mockActivities);
    expect(activityService.getActivitiesByDateRange).toHaveBeenCalledWith(mockUserId, '2024-08-02', '2024-08-03');
  });
});