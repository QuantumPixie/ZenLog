import { describe, it, expect } from 'vitest';
import { sentimentService } from '../../services/sentimentService';

describe('sentimentService', () => {
  describe('analyze', () => {
    it('should return a positive score for positive text', () => {
      const result = sentimentService.analyze('I love this! It\'s amazing.');
      expect(result.score).toBeGreaterThan(0);
    });

    it('should return a negative score for negative text', () => {
      const result = sentimentService.analyze('I hate this. It\'s terrible.');
      expect(result.score).toBeLessThan(0);
    });

    it('should return a neutral score for neutral text', () => {
      const result = sentimentService.analyze('This is a neutral statement.');
      expect(result.score).toBe(0);
    });
  });
});