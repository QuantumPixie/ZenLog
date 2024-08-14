import { describe, it, expect } from 'vitest'
import type { ColumnType } from 'kysely'
import type { MoodTable } from '../../models/mood'

describe('Mood Model', () => {
  it('should have correct structure for MoodTable', () => {
    const mood: MoodTable = {
      id: {} as ColumnType<number, number | undefined, never>,
      user_id: 1,
      date: '2023-08-04',
      moodScore: 7,
      emotions: ['happy', 'excited'],
    }

    expect(mood).toHaveProperty('id')
    expect(mood).toHaveProperty('user_id')
    expect(mood).toHaveProperty('date')
    expect(mood).toHaveProperty('moodScore')
    expect(mood).toHaveProperty('emotions')

    expect(typeof mood.user_id).toBe('number')
    expect(typeof mood.date).toBe('string')
    expect(typeof mood.moodScore).toBe('number')
    expect(Array.isArray(mood.emotions)).toBe(true)
    expect(mood.emotions.every((emotion) => typeof emotion === 'string')).toBe(
      true
    )
  })

  it('should allow mood without id for insertion', () => {
    const newMood: Omit<MoodTable, 'id'> = {
      user_id: 1,
      date: '2023-08-04',
      moodScore: 8,
      emotions: ['calm', 'content'],
    }

    expect(newMood).not.toHaveProperty('id')
    expect(newMood).toHaveProperty('user_id')
    expect(newMood).toHaveProperty('date')
    expect(newMood).toHaveProperty('moodScore')
    expect(newMood).toHaveProperty('emotions')
  })
})
