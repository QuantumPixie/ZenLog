import { db } from '../database';
import type { ActivityTable, NewActivity, ActivityInput } from '../models/activity';
import type { Insertable } from 'kysely';
import { isValidDateString } from '../schemas/activitySchema';

type DbInsertableActivity = Omit<ActivityTable, 'id'>;

function toDbInsertableActivity(newActivity: NewActivity): DbInsertableActivity {
  return newActivity;
}

export const activityService = {
  async getActivities(userId: number): Promise<ActivityTable[]> {
    const activities = await db
      .selectFrom('activities')
      .selectAll()
      .where('user_id', '=', userId)
      .execute();

    return activities.filter(activity =>
      typeof activity.id === 'number' &&
      typeof activity.user_id === 'number' &&
      typeof activity.date === 'string' &&
      isValidDateString(activity.date) &&
      typeof activity.activity === 'string' &&
      (activity.duration === undefined || typeof activity.duration === 'number') &&
      (activity.notes === undefined || typeof activity.notes === 'string')
    );
  },

  async getActivityById(id: number): Promise<ActivityTable | undefined> {
    return db
      .selectFrom('activities')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  },

  async createActivity(userId: number, activityData: ActivityInput): Promise<ActivityTable> {
    const newActivity: NewActivity = {
      ...activityData,
      user_id: userId,
    };

    const dbInsertableActivity = toDbInsertableActivity(newActivity);

    const insertedActivity = await db
      .insertInto('activities')
      .values(dbInsertableActivity as Insertable<ActivityTable>)
      .returning(['id', 'user_id', 'date', 'activity', 'duration', 'notes'])
      .executeTakeFirst();

    if (!insertedActivity) {
      throw new Error('Failed to create activity');
    }

    return insertedActivity;
  },

  async getActivitiesByDateRange(userId: number, startDate: string, endDate: string): Promise<ActivityTable[]> {
    return db
      .selectFrom('activities')
      .selectAll()
      .where('user_id', '=', userId)
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .execute();
  },
};