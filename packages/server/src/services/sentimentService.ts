import Sentiment from 'sentiment';

const sentiment = new Sentiment();

export const sentimentService = {
  analyze: (text: string): { score: number } => {
    const result = sentiment.analyze(text);
    // Convert score to 1-10 range
    const convertedScore = sentimentService.convertScore(result.score);
    return { score: convertedScore };
  },

  convertScore: (score: number): number => {
    // Convert from typical -5 to +5 range to 1-10 range
    const converted = ((score + 5) / 10) * 9 + 1;
    // Limit to 1-10 range and round to one decimal place
    return Math.round(Math.min(Math.max(converted, 1), 10) * 10) / 10;
  }
};