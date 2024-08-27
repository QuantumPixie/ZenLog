import { describe, it, expect } from 'vitest'
import {
  activityInputSchema,
  isValidDateString,
} from '../../schemas/activitySchema'

describe('Activity Schema Validation', () => {
  describe('isValidDateString', () => {
    it('should return true for a valid date string', () => {
      expect(isValidDateString('2024-08-26')).toBe(true)
    })

    it('should return false for an invalid date string', () => {
      expect(isValidDateString('invalid-date')).toBe(false)
      expect(isValidDateString('2024/08/26')).toBe(false)
      expect(isValidDateString('26-08-2024')).toBe(false)
    })

    it('should return false for a date with invalid day/month values', () => {
      expect(isValidDateString('2024-13-01')).toBe(false)
      expect(isValidDateString('2024-02-30')).toBe(false)
    })
  })

  describe('activityInputSchema', () => {
    it('should validate a correct activity input schema', () => {
      const validInput = {
        date: '2024-08-26',
        activity: 'Running',
        duration: 30,
        notes: 'Morning jog',
      }

      expect(() => activityInputSchema.parse(validInput)).not.toThrow()
    })

    it('should fail validation if the date format is invalid', () => {
      const invalidInput = {
        date: '26-08-2024',
        activity: 'Running',
      }

      expect(() => activityInputSchema.parse(invalidInput)).toThrowError(
        'Invalid date format. Use YYYY-MM-DD'
      )
    })

    it('should fail validation if the required fields are missing', () => {
      const invalidInput = {
        date: '2024-08-26',
      }

      expect(() => activityInputSchema.parse(invalidInput)).toThrowError()
    })

    it('should validate successfully without optional fields', () => {
      const validInput = {
        date: '2024-08-26',
        activity: 'Running',
      }

      expect(() => activityInputSchema.parse(validInput)).not.toThrow()
    })

    it('should fail validation if duration is not a number', () => {
      const invalidInput = {
        date: '2024-08-26',
        activity: 'Running',
        duration: 'thirty',
      }

      expect(() => activityInputSchema.parse(invalidInput)).toThrowError()
    })
  })
})
