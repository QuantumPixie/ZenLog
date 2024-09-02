export interface Mood {
    id: number
    date: string
    mood_score: number
    emotions: string[]
  }

  export interface JournalEntry {
    id?: number
    date: string
    entry: string
    sentiment: number
  }

  export interface Activity {
    id?: number
    date: string
    activity: string
    duration?: number
    notes?: string
  }

  export interface Summary {
    recentMoods: Mood[]
    recentEntries: JournalEntry[]
    recentActivities: Activity[]
    averageMoodLastWeek: number | null
    averageSentimentLastWeek: number | null
  }