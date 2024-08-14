import { describe, it, expect } from 'vitest'
import { sentimentService } from '../../services/sentimentService'

describe('sentimentService', () => {
  describe('analyze', () => {
    it('should return a score between 1 and 10 for any input', () => {
      const texts = [
        "I love this! It's amazing.",
        "I hate this. It's terrible.",
        'This is a neutral statement.',
      ]

      texts.forEach((text) => {
        const result = sentimentService.analyze(text)
        expect(result.score).toBeGreaterThanOrEqual(1)
        expect(result.score).toBeLessThanOrEqual(10)
      })
    })
  })

  describe('convertScore', () => {
    it('should convert scores correctly', () => {
      expect(sentimentService.convertScore(-5)).toBe(1)
      expect(sentimentService.convertScore(0)).toBe(5.5)
      expect(sentimentService.convertScore(5)).toBe(10)
    })

    it('should handle edge cases', () => {
      expect(sentimentService.convertScore(-10)).toBe(1)
      expect(sentimentService.convertScore(10)).toBe(10)
    })

    it('should round to one decimal place', () => {
      expect(sentimentService.convertScore(-2.5)).toBe(3.3)
      expect(sentimentService.convertScore(2.5)).toBe(7.8)
    })
  })
})
