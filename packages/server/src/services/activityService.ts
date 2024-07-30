import { db } from '../database';
import type { ActivityTable, NewActivity, ActivityInput, RawDatabaseActivity } from '../models/activity';
import { isRawDatabaseActivity } from '../models/activity';
import type { Insertable } from 'kysely';

// shape of the activities table in the database
interface ActivitiesTable {
  id: number;
  user_id: number;
  date: Date;
  activity: string;
  duration: number | null;
  notes: string | null;
}

// what Kysely expects for insertion
type DbInsertableActivity = Omit<ActivitiesTable, 'id'>;

function mapRawActivityToActivityTable(rawActivity: RawDatabaseActivity): ActivityTable {
  return {
    id: rawActivity.id,
    user_id: rawActivity.user_id,
    date: rawActivity.date instanceof Date ? rawActivity.date : new Date(rawActivity.date),
    activity: rawActivity.activity,
    duration: rawActivity.duration,
    notes: rawActivity.notes,
  };
}

// function to convert NewActivity to DbInsertableActivity
function toDbInsertableActivity(newActivity: NewActivity): DbInsertableActivity {
  return {
    ...newActivity,
    date: new Date(newActivity.date), 
  };
}

export const activityService = {
  async getActivities(userId: number): Promise<ActivityTable[]> {
    const activities = await db
      .selectFrom('activities')
      .selectAll()
      .where('user_id', '=', userId)
      .execute();

    return activities.filter(isRawDatabaseActivity).map(mapRawActivityToActivityTable);
  },

  async getActivityById(id: number): Promise<ActivityTable | undefined> {
    const activity = await db
      .selectFrom('activities')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return activity && isRawDatabaseActivity(activity)
      ? mapRawActivityToActivityTable(activity)
      : undefined;
  },

  async createActivity(userId: number, activityData: ActivityInput): Promise<ActivityTable> {
    const newActivity: NewActivity = {
      ...activityData,
      user_id: userId,
    };

    const dbInsertableActivity = toDbInsertableActivity(newActivity);

    const insertedActivity = await db
      .insertInto('activities')
      .values(dbInsertableActivity as Insertable<ActivitiesTable>)
      .returning(['id', 'user_id', 'date', 'activity', 'duration', 'notes'])
      .executeTakeFirst();

    if (!insertedActivity || !isRawDatabaseActivity(insertedActivity)) {
      throw new Error('Failed to create activity');
    }

    return mapRawActivityToActivityTable(insertedActivity);
  },

  async getActivitiesByDateRange(userId: number, startDate: string, endDate: string): Promise<ActivityTable[]> {
    const activities = await db
      .selectFrom('activities')
      .selectAll()
      .where('user_id', '=', userId)
      .where('date', '>=', new Date(startDate))
      .where('date', '<=', new Date(endDate))
      .execute();

    return activities.filter(isRawDatabaseActivity).map(mapRawActivityToActivityTable);
  },
};
