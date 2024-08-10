export interface DashboardSummary {
  recentMoods: Array<{
    id: number;
    user_id: number;
    date: string;
    moodScore: number;
    emotions: string[];
  }>;
  recentEntries: Array<{
    date: string;
    entry: string;
    sentiment: number;
  }>;
  recentActivities: Array<{
    date: string;
    activity: string;
    duration: number | undefined;
    notes: string | undefined;
  }>;
  averageMoodLastWeek: number | null;
  averageSentimentLastWeek: number | null;
}