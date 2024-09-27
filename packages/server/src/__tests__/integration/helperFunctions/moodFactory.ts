import Chance from 'chance'
const chance = new Chance()

export function generateFakeMood(userId: number) {
  return {
    user_id: userId,
    date: new Date().toISOString(),
    mood_score: chance.integer({ min: 1, max: 10 }),
    emotions: chance
      .pickset(
        ['happy', 'sad', 'angry', 'excited', 'anxious', 'relaxed'],
        chance.integer({ min: 1, max: 3 })
      )
      .sort(),
  }
}
