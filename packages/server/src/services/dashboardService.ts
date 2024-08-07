import { db } from '../database';

type AverageMoodResult = { averageMood: string | null };

export const dashboardService = {
  async getSummary(userId: number) {
    const recentMoods = await db
      .selectFrom('moods')
      .select(['date', 'mood_score', 'emotions'])
      .where('user_id', '=', userId)
      .orderBy('date', 'desc')
      .limit(5)
      .execute();

    const recentEntries = await db
      .selectFrom('journal_entries')
      .select(['date', 'entry'])
      .where('user_id', '=', userId)
      .orderBy('date', 'desc')
      .limit(5)
      .execute();

    const recentActivities = await db
      .selectFrom('activities')
      .select(['date', 'activity', 'duration', 'notes'])
      .where('user_id', '=', userId)
      .orderBy('date', 'desc')
      .limit(5)
      .execute();

    // Calculate average mood score for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoString = sevenDaysAgo.toISOString().split('T')[0];

    const averageMoodScore = await db
      .selectFrom('moods')
      .select(db.fn.avg('mood_score').as('averageMood'))
      .where('user_id', '=', userId)
      .where('date', '>=', sevenDaysAgoString)
      .executeTakeFirst() as AverageMoodResult | undefined;

    const moodScores = await db
      .selectFrom('moods')
      .select(['date', 'mood_score'])
      .where('user_id', '=', userId)
      .where('date', '>=', sevenDaysAgoString)
      .orderBy('date', 'asc')
      .execute();

    const result = {
      recentMoods,
      recentEntries,
      recentActivities,
      averageMoodLastWeek: averageMoodScore && averageMoodScore.averageMood !== null
        ? Number(averageMoodScore.averageMood)
        : null,
    };
    console.log(moodScores);

    return result;
  },
};