export interface DashboardSummary {
  recentMoods: Array<{
    date: string;
    mood_score: number;
    emotions: string[];
  }>;
  recentEntries: Array<{
    date: string;
    entry: string;
  }>;
  recentActivities: Array<{
    date: string;
    activity: string;
    duration: number | undefined;
    notes: string | undefined;
  }>;
  averageMoodLastWeek: number | null;
}