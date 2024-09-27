import Chance from 'chance'

const chance = new Chance()

export function generateFakeJournalEntries(userId: number, days: number = 7) {
  const now = new Date()

  return Array.from({ length: days }, (_, i) => {
    const entryDate = new Date(now)
    entryDate.setDate(now.getDate() - i)

    return {
      user_id: userId,
      date: entryDate.toISOString(), // This ensures ISO 8601 format
      entry: chance.paragraph({ sentences: 2 }),
      sentiment: chance.floating({ min: 1, max: 10, fixed: 1 }),
    }
  })
}
