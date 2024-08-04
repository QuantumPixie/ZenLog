import Sentiment from 'sentiment';

const sentiment = new Sentiment();

export const sentimentService = {
  analyze: (text: string): { score: number } => {
    const result = sentiment.analyze(text);
    const convertedScore = sentimentService.convertScore(result.score);
    return { score: convertedScore };
  },

/**
 * Converts a sentiment score to a range of 1 to 10.
 *
 * @param {number} score - The sentiment score to convert.
 * @return {number} The converted score in the range of 1 to 10.
 */
  convertScore: (score: number): number => {
    const converted = ((score + 5) / 10) * 9 + 1;
    return Math.round(Math.min(Math.max(converted, 1), 10) * 10) / 10;
  }
};