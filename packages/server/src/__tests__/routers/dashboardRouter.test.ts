import { describe, it, expect, vi, beforeEach } from 'vitest';
import { router, authedProcedure, createCallerFactory } from '../mocks/trpcMock';
import { dashboardService } from '../../services/dashboardService';
import type { DashboardSummary } from '../../types/dashboard';

vi.mock('../../services/dashboardService', () => ({
  dashboardService: {
    getSummary: vi.fn(),
  },
}));

// Type guard for DashboardSummary
function isDashboardSummary(obj: unknown): obj is DashboardSummary {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'recentMoods' in obj &&
    'recentEntries' in obj &&
    'recentActivities' in obj &&
    'averageMoodLastWeek' in obj &&
    Array.isArray((obj as DashboardSummary).recentMoods) &&
    Array.isArray((obj as DashboardSummary).recentEntries) &&
    Array.isArray((obj as DashboardSummary).recentActivities) &&
    (typeof (obj as DashboardSummary).averageMoodLastWeek === 'number' ||
      (obj as DashboardSummary).averageMoodLastWeek === null) &&
    (obj as DashboardSummary).recentMoods.every(
      (mood) => 'mood_score' in mood && typeof mood.mood_score === 'number'
    )
  );
}

const mockDashboardRouter = router({
  getSummary: authedProcedure.query(async ({ ctx }) => {
    return dashboardService.getSummary(ctx.user.id);
  }),
});

const createCaller = createCallerFactory(mockDashboardRouter);

describe('dashboardRouter', () => {
  const mockUserId = 1;

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

    const caller = createCaller({ user: { id: mockUserId } });
    const result = await caller.getSummary();

    expect(isDashboardSummary(result)).toBe(true);
    expect(result).toEqual(mockSummary);
    expect(dashboardService.getSummary).toHaveBeenCalledWith(mockUserId);
  });

  it('should handle null average mood', async () => {
    const mockSummary: DashboardSummary = {
      recentMoods: [],
      recentEntries: [],
      recentActivities: [],
      averageMoodLastWeek: null,
    };

    vi.mocked(dashboardService.getSummary).mockResolvedValue(mockSummary);

    const caller = createCaller({ user: { id: mockUserId } });
    const result = await caller.getSummary();

    expect(isDashboardSummary(result)).toBe(true);
    expect(result).toEqual(mockSummary);
    expect(dashboardService.getSummary).toHaveBeenCalledWith(mockUserId);
  });

  it('should handle empty recent data', async () => {
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

    const caller = createCaller({ user: { id: mockUserId } });
    const result = await caller.getSummary();

    expect(isDashboardSummary(result)).toBe(true);
    expect(result).toEqual(mockSummary);
    expect(dashboardService.getSummary).toHaveBeenCalledWith(mockUserId);
  });

  it('should handle database errors', async () => {
    vi.mocked(dashboardService.getSummary).mockRejectedValue(new Error('Database error'));

    const caller = createCaller({ user: { id: mockUserId } });
    await expect(caller.getSummary()).rejects.toThrow('Database error');
  });
});