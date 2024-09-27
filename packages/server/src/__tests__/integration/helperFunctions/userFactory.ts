import Chance from 'chance'
const chance = new Chance()

let userCounter = 0

export function generateFakeUser() {
  const timestamp = Date.now()
  userCounter++

  return {
    email: `user_${timestamp}_${userCounter}@example.com`,
    username: `user_${timestamp}_${userCounter}_${chance.string({ length: 4 })}`,
    password: 'password123',
  }
}
