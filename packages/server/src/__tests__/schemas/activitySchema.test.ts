import {
  activityInputSchema,
  isValidDateString,
} from '../../schemas/activitySchema'
import { z } from 'zod'

describe('Activity Schema Validation', () => {
  describe('isValidDateString', () => {
    it('should return true for a valid ISO date string', () => {
      expect(isValidDateString('2024-08-26T14:30:00.000Z')).toBe(true)
    })

    it('should return false for an invalid date string', () => {
      expect(isValidDateString('not-a-date')).toBe(false)
    })

    it('should return false for a date with invalid day/month values', () => {
      expect(isValidDateString('2024-13-32T00:00:00.000Z')).toBe(false)
    })
  })

  describe('activityInputSchema', () => {
    it('should validate a correct activity input schema', () => {
      const validInput = {
        userId: '123',
        activity: 'Exercise',
        date: '2024-08-26T14:30:00.000Z',
        duration: 30,
        notes: 'Jogging in the park',
      }
      expect(() => activityInputSchema.parse(validInput)).not.toThrow()
    })

    it('should fail validation if the date format is invalid', () => {
      const invalidInput = {
        userId: '123',
        activity: 'Exercise',
        date: '2024-08-26', // Invalid format, missing time
        duration: 30,
      }

      expect(() => activityInputSchema.parse(invalidInput)).toThrow(z.ZodError)
      expect(() => activityInputSchema.parse(invalidInput)).toThrow(
        /Invalid date format/
      )
    })

    it('should fail validation if the required fields are missing', () => {
      const invalidInput = {
        userId: '123',
      }
      expect(() => activityInputSchema.parse(invalidInput)).toThrow()
    })

    it('should validate successfully without optional fields', () => {
      const validInput = {
        userId: '123',
        activity: 'Exercise',
        date: '2024-08-26T14:30:00.000Z',
      }
      expect(() => activityInputSchema.parse(validInput)).not.toThrow()
    })

    it('should fail validation if duration is not a number', () => {
      const invalidInput = {
        userId: '123',
        activity: 'Exercise',
        date: '2024-08-26T14:30:00.000Z',
        duration: 'thirty',
      }
      expect(() => activityInputSchema.parse(invalidInput)).toThrow()
    })
  })
})
