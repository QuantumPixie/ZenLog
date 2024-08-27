import { describe, it, expect } from 'vitest'
import { journalEntrySchema } from '../../schemas/journalEntrySchema'

describe('Journal Entry Schema Validation', () => {
  it('should validate a correct journal entry schema', () => {
    const validEntry = {
      id: 1,
      user_id: 100,
      date: '2024-08-26',
      entry: 'This is my journal entry for today.',
      sentiment: 7,
    }

    expect(() => journalEntrySchema.parse(validEntry)).not.toThrow()
  })

  it('should fail validation if the date is invalid', () => {
    const invalidEntry = {
      user_id: 100,
      date: 'not-a-date',
      entry: 'This is my journal entry for today.',
      sentiment: 7,
    }

    expect(() => journalEntrySchema.parse(invalidEntry)).toThrowError(
      'Date must be a valid date string'
    )
  })

  it('should fail validation if the sentiment is out of range', () => {
    const invalidEntryTooLow = {
      user_id: 100,
      date: '2024-08-26',
      entry: 'This is my journal entry for today.',
      sentiment: 0, // Below the allowed minimum of 1
    }

    const invalidEntryTooHigh = {
      user_id: 100,
      date: '2024-08-26',
      entry: 'This is my journal entry for today.',
      sentiment: 11, // Above the allowed maximum of 10
    }

    expect(() => journalEntrySchema.parse(invalidEntryTooLow)).toThrowError()
    expect(() => journalEntrySchema.parse(invalidEntryTooHigh)).toThrowError()
  })

  it('should fail validation if required fields are missing', () => {
    const invalidEntryMissingUserId = {
      date: '2024-08-26',
      entry: 'This is my journal entry for today.',
      sentiment: 7,
    }

    expect(() =>
      journalEntrySchema.parse(invalidEntryMissingUserId)
    ).toThrowError()

    const invalidEntryMissingEntry = {
      user_id: 100,
      date: '2024-08-26',
      sentiment: 7,
    }

    expect(() =>
      journalEntrySchema.parse(invalidEntryMissingEntry)
    ).toThrowError()
  })

  it('should validate successfully with optional id', () => {
    const validEntryWithoutId = {
      user_id: 100,
      date: '2024-08-26',
      entry: 'This is my journal entry for today.',
      sentiment: 7,
    }

    expect(() => journalEntrySchema.parse(validEntryWithoutId)).not.toThrow()
  })

  it('should fail validation if sentiment is not a number', () => {
    const invalidEntryWithNonNumberSentiment = {
      user_id: 100,
      date: '2024-08-26',
      entry: 'This is my journal entry for today.',
      sentiment: 'high', // Invalid, should be a number
    }

    expect(() =>
      journalEntrySchema.parse(invalidEntryWithNonNumberSentiment)
    ).toThrowError()
  })
})
