import { describe, it, expect } from 'vitest'
import { analyze, convertScore } from '../../services/sentimentService'

describe('sentimentService', () => {
  describe('analyze', () => {
    it('should return a score between 1 and 10 for any input', async () => {
      const texts = [
        "I love this! It's amazing.",
        "I hate this. It's terrible.",
        'This is a neutral statement.',
      ]

      for (const text of texts) {
        const result = await analyze(text)
        expect(result).toBeGreaterThanOrEqual(1)
        expect(result).toBeLessThanOrEqual(10)
      }
    })
  })

  describe('convertScore', () => {
    it('should convert scores correctly', () => {
      expect(convertScore(-5)).toBe(1)
      expect(convertScore(0)).toBe(5.5)
      expect(convertScore(5)).toBe(10)
    })

    it('should handle edge cases', () => {
      expect(convertScore(-10)).toBe(1)
      expect(convertScore(10)).toBe(10)
    })

    it('should round to one decimal place', () => {
      expect(convertScore(-2.5)).toBe(3.3)
      expect(convertScore(2.5)).toBe(7.8)
    })
  })
})
