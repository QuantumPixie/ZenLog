import Chance from 'chance'
const chance = new Chance()

export function generateFakeActivity() {
  return {
    date: new Date().toISOString(),
    activity: chance.word(),
    duration: chance.integer({ min: 15, max: 120 }),
    notes: chance.sentence({ words: 5 }),
  }
}
