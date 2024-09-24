import Sentiment from 'sentiment'

const sentiment = new Sentiment()

export const analyze = (text: string): Promise<number> => {
  const result = sentiment.analyze(text)
  const convertedScore = convertScore(result.score)
  return Promise.resolve(convertedScore)
}

export function convertScore(score: number): number {
  // Normalize the score to a range of -1 to 1
  const normalizedScore = Math.max(-1, Math.min(1, score / 5))

  const convertedScore = ((normalizedScore + 1) / 2) * 9 + 1

  return Math.round(convertedScore * 10) / 10
}
