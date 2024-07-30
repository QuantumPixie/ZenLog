import Sentiment from 'sentiment';

const sentiment = new Sentiment();

export const sentimentService = {
  analyze: (text: string): { score: number } => {
    const result = sentiment.analyze(text);
    return { score: result.score };
  }
};