import { describe, it, expect } from 'vitest'
import { moodSchema } from '../../schemas/moodSchema'

describe('Mood Schema Validation', () => {
  it('should validate a correct mood schema', () => {
    const validMood = {
      id: 1,
      user_id: 100,
      date: '2024-08-26',
      moodScore: 7,
      emotions: ['happy', 'excited'],
    }

    expect(() => moodSchema.parse(validMood)).not.toThrow()
  })

  it('should fail validation if the date is invalid', () => {
    const invalidMood = {
      id: 1,
      user_id: 100,
      date: 'not-a-date',
      moodScore: 7,
      emotions: ['happy', 'excited'],
    }

    expect(() => moodSchema.parse(invalidMood)).toThrowError(
      'Invalid date format'
    )
  })

  it('should fail validation if the moodScore is out of range', () => {
    const invalidMoodTooLow = {
      id: 1,
      user_id: 100,
      date: '2024-08-26',
      moodScore: 0, // Below the allowed minimum of 1
      emotions: ['sad'],
    }

    const invalidMoodTooHigh = {
      id: 1,
      user_id: 100,
      date: '2024-08-26',
      moodScore: 11, // Above the allowed maximum of 10
      emotions: ['overjoyed'],
    }

    expect(() => moodSchema.parse(invalidMoodTooLow)).toThrowError()
    expect(() => moodSchema.parse(invalidMoodTooHigh)).toThrowError()
  })

  it('should fail validation if required fields are missing', () => {
    const invalidMoodMissingUserId = {
      id: 1,
      date: '2024-08-26',
      moodScore: 7,
      emotions: ['happy', 'excited'],
    }

    expect(() => moodSchema.parse(invalidMoodMissingUserId)).toThrowError()

    const invalidMoodMissingEmotions = {
      id: 1,
      user_id: 100,
      date: '2024-08-26',
      moodScore: 7,
    }

    expect(() => moodSchema.parse(invalidMoodMissingEmotions)).toThrowError()
  })

  it('should fail validation if emotions are not an array of strings', () => {
    const invalidMoodWithInvalidEmotions = {
      id: 1,
      user_id: 100,
      date: '2024-08-26',
      moodScore: 7,
      emotions: 'happy', // Invalid, should be an array of strings
    }

    expect(() =>
      moodSchema.parse(invalidMoodWithInvalidEmotions)
    ).toThrowError()
  })

  it('should validate successfully with a valid array of emotions', () => {
    const validMoodWithEmotions = {
      id: 1,
      user_id: 100,
      date: '2024-08-26',
      moodScore: 7,
      emotions: ['happy', 'content'],
    }

    expect(() => moodSchema.parse(validMoodWithEmotions)).not.toThrow()
  })
})
