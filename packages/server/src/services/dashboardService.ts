import { db } from '../database'

type AverageMoodResult = { averageMood: string | null }
type AverageSentimentResult = { averageSentiment: string | null }

export const dashboardService = {
  async getSummary(userId: number) {
    const recentMoods = await db
      .selectFrom('moods')
      .select(['id', 'user_id', 'date', 'mood_score', 'emotions'])
      .where('user_id', '=', userId)
      .orderBy('date', 'desc')
      .limit(5)
      .execute()

    const recentEntries = await db
      .selectFrom('journal_entries')
      .select(['date', 'entry', 'sentiment'])
      .where('user_id', '=', userId)
      .orderBy('date', 'desc')
      .limit(5)
      .execute()

    const recentActivities = await db
      .selectFrom('activities')
      .select(['date', 'activity', 'duration', 'notes'])
      .where('user_id', '=', userId)
      .orderBy('date', 'desc')
      .limit(5)
      .execute()

    // Calculate average score for the last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const sevenDaysAgoString = sevenDaysAgo.toISOString()

    const averageMoodScore = (await db
      .selectFrom('moods')
      .select(db.fn.avg('mood_score').as('averageMood'))
      .where('user_id', '=', userId)
      .where('date', '>=', sevenDaysAgoString)
      .executeTakeFirst()) as AverageMoodResult | undefined

    const averageSentimentScore = (await db
      .selectFrom('journal_entries')
      .select(db.fn.avg('sentiment').as('averageSentiment'))
      .where('user_id', '=', userId)
      .where('date', '>=', sevenDaysAgoString)
      .executeTakeFirst()) as AverageSentimentResult | undefined

    const result = {
      recentMoods: recentMoods.map((mood) => ({
        ...mood,
        date: new Date(mood.date).toISOString(),
      })),
      recentEntries: recentEntries.map((entry) => ({
        ...entry,
        date: new Date(entry.date).toISOString(),
      })),
      recentActivities: recentActivities.map((activity) => ({
        ...activity,
        date: new Date(activity.date).toISOString(),
      })),
      averageMoodLastWeek:
        averageMoodScore && averageMoodScore.averageMood !== null
          ? Number(averageMoodScore.averageMood)
          : recentMoods.length > 0
            ? 0
            : null,
      averageSentimentLastWeek:
        averageSentimentScore && averageSentimentScore.averageSentiment !== null
          ? Number(averageSentimentScore.averageSentiment)
          : recentEntries.length > 0
            ? 0
            : null,
    }

    console.log('Dashboard summary:', JSON.stringify(result, null, 2))

    return result
  },
}
