import { db } from '../database';

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
      .select(['date', 'activity', 'duration'])
      .where('user_id', '=', userId)
      .orderBy('date', 'desc')
      .limit(5)
      .execute();

    // calculate average mood score for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const averageMoodScore = await db
      .selectFrom('moods')
      .select(db.fn.avg('mood_score').as('average_mood'))
      .where('user_id', '=', userId)
      .where('date', '>=', sevenDaysAgo)
      .executeTakeFirst();

    return {
      recentMoods,
      recentEntries,
      recentActivities,
      averageMoodLastWeek: averageMoodScore ? Number(averageMoodScore.average_mood) : null,
    };
  },
};
