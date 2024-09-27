import { generateFakeUser } from './userFactory'
import Chance from 'chance'
const chance = new Chance()

export function generateFakeDashboardData() {
  // Generate a unique user
  const user = generateFakeUser()
  const userId = user.email // Use email or create a userId depending on your setup

  // Generate 5 moods
  const recentMoods = Array.from({ length: 5 }, () => ({
    user_id: userId,
    mood: chance.integer({ min: 1, max: 5 }), // Assuming mood is between 1-5
    created_at: new Date().toISOString(), // Generate ISO date string
  }))

  // Generate 5 activities
  const recentActivities = Array.from({ length: 5 }, () => ({
    user_id: userId,
    activity: chance.word(),
    created_at: new Date().toISOString(), // Generate ISO date string
  }))

  // Generate 5 journal entries
  const recentEntries = Array.from({ length: 5 }, () => ({
    user_id: userId,
    entry: chance.sentence(),
    created_at: new Date().toISOString(), // Generate ISO date string
  }))

  return {
    user,
    recentMoods,
    recentActivities,
    recentEntries,
  }
}
