import Sentiment from 'sentiment'

const sentiment = new Sentiment()

export const analyze = (text: string): Promise<number> => {
  const result = sentiment.analyze(text)
  const convertedScore = convertScore(result.score)
  return Promise.resolve(convertedScore)
}

function convertScore(score: number): number {
  const normalizedScore = Math.max(0, Math.min(1, score)) // Ensure score is between 0 and 1
  const converted = ((normalizedScore + 5) / 10) * 9 + 1
  return Math.round(Math.min(Math.max(converted, 1), 10))
}
