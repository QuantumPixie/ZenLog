import { trpc } from '../../src/utils/trpc'

let testUserCredentials: { email: string; password: string; id: number } | null = null

function generateUniqueEmail(): string {
  return `testuser_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`
}

export function generateTestUserCredentials() {
  return {
    email: generateUniqueEmail(),
    password: 'TestPassword123!',
    username: `TestUser_${Date.now()}`
  }
}

export async function createTestUser() {
  const userCredentials = generateTestUserCredentials()
  try {
    const result = await trpc.user.signup.mutate(userCredentials)
    testUserCredentials = { ...userCredentials, id: result.user.id }
    console.log('Test user created successfully:', testUserCredentials.email)
    return testUserCredentials
  } catch (error) {
    console.error('Error creating test user:', error)
    throw error
  }
}

export async function cleanupTestUser() {
  if (testUserCredentials) {
    try {
      // Authenticate as the test user
      await trpc.user.login.mutate({
        email: testUserCredentials.email,
        password: testUserCredentials.password
      })

      // Delete the user
      await trpc.user.deleteUser.mutate()
      console.log('Test user deleted successfully')
      testUserCredentials = null
    } catch (error) {
      console.error('Error cleaning up test user:', error)
    }
  }
}
