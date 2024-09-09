import type { Insertable } from 'kysely'
import { db } from '../database'
import type {
  ActivityTable,
  NewActivity,
  ActivityInput,
} from '../models/activity'
import { isValidDateString } from '../schemas/activitySchema'

type DbInsertableActivity = Omit<ActivityTable, 'id'>

function toDbInsertableActivity(
  newActivity: NewActivity
): DbInsertableActivity {
  return newActivity
}

export const activityService = {
  async getActivities(userId: number): Promise<ActivityTable[]> {
    console.log(`Fetching activities for user ${userId}`)
    const activities = await db
      .selectFrom('activities')
      .selectAll()
      .where('user_id', '=', userId)
      .orderBy('date', 'desc')
      .execute()

    console.log(`Retrieved ${activities.length} activities for user ${userId}`)
    console.log('Activities:', activities)
    return activities
  },

  async getActivityById(
    id: number,
    userId: number
  ): Promise<ActivityTable | undefined> {
    return db
      .selectFrom('activities')
      .selectAll()
      .where('id', '=', id)
      .where('user_id', '=', userId)
      .executeTakeFirst()
  },

  async createActivity(
    userId: number,
    activityData: ActivityInput
  ): Promise<ActivityTable> {
    console.log('Creating activity for user:', userId)
    console.log('Activity data:', activityData)
    if (!isValidDateString(activityData.date)) {
      throw new Error('Invalid date format')
    }

    const newActivity: NewActivity = {
      ...activityData,
      user_id: userId,
    }

    const dbInsertableActivity = toDbInsertableActivity(newActivity)

    const insertedActivity = await db
      .insertInto('activities')
      .values(dbInsertableActivity as Insertable<ActivityTable>)
      .returning(['id', 'user_id', 'date', 'activity', 'duration', 'notes'])
      .executeTakeFirst()

    if (!insertedActivity) {
      throw new Error('Failed to create activity')
    }

    return insertedActivity
  },

  async getActivitiesByDateRange(
    userId: number,
    startDate: string,
    endDate: string
  ): Promise<ActivityTable[]> {
    return db
      .selectFrom('activities')
      .selectAll()
      .where('user_id', '=', userId)
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .orderBy('date', 'desc')
      .execute()
  },
}
