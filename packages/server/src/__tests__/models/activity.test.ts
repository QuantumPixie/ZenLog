import { describe, it, expect } from 'vitest'
import type {
  ActivityTable,
  NewActivity,
  ActivityInput,
} from '../../models/activity'

describe('Activity Model', () => {
  it('should have correct structure for ActivityTable', () => {
    const activity: ActivityTable = {
      id: 1,
      user_id: 2,
      date: '2023-08-04',
      activity: 'Running',
      duration: 30,
      notes: 'Morning jog',
    }

    expect(activity).toHaveProperty('id')
    expect(activity).toHaveProperty('user_id')
    expect(activity).toHaveProperty('date')
    expect(activity).toHaveProperty('activity')
    expect(activity).toHaveProperty('duration')
    expect(activity).toHaveProperty('notes')

    expect(typeof activity.id).toBe('number')
    expect(typeof activity.user_id).toBe('number')
    expect(typeof activity.date).toBe('string')
    expect(typeof activity.activity).toBe('string')
    expect(typeof activity.duration).toBe('number')
    expect(typeof activity.notes).toBe('string')
  })

  it('should allow NewActivity without id', () => {
    const newActivity: NewActivity = {
      user_id: 2,
      date: '2023-08-04',
      activity: 'Yoga',
      duration: 60,
      notes: 'Evening session',
    }

    expect(newActivity).not.toHaveProperty('id')
    expect(newActivity).toHaveProperty('user_id')
    expect(newActivity).toHaveProperty('date')
    expect(newActivity).toHaveProperty('activity')
    expect(newActivity).toHaveProperty('duration')
    expect(newActivity).toHaveProperty('notes')
  })

  it('should allow ActivityInput without user_id and id', () => {
    const activityInput: ActivityInput = {
      date: '2023-08-04',
      activity: 'Meditation',
      duration: 15,
      notes: 'Morning meditation',
    }

    expect(activityInput).not.toHaveProperty('id')
    expect(activityInput).not.toHaveProperty('user_id')
    expect(activityInput).toHaveProperty('date')
    expect(activityInput).toHaveProperty('activity')
    expect(activityInput).toHaveProperty('duration')
    expect(activityInput).toHaveProperty('notes')
  })

  it('should allow optional fields in ActivityInput', () => {
    const minimalActivityInput: ActivityInput = {
      date: '2023-08-04',
      activity: 'Reading',
    }

    expect(minimalActivityInput).toHaveProperty('date')
    expect(minimalActivityInput).toHaveProperty('activity')
    expect(minimalActivityInput).not.toHaveProperty('duration')
    expect(minimalActivityInput).not.toHaveProperty('notes')
  })
})
