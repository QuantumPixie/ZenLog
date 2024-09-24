import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import {
  setupTestDatabase,
  cleanupTestDatabase,
  teardownTestDatabase,
} from '../setupTestDatabase'
import { createUser, getUserById } from '../../services/userService'

describe('User Service Integration Tests', () => {
  let uniqueEmail: string

  beforeAll(async () => {
    await setupTestDatabase()
  })

  beforeEach(async () => {
    await cleanupTestDatabase()
    uniqueEmail = `test_${Date.now()}@example.com`
  })

  afterAll(async () => {
    await teardownTestDatabase()
  })

  it('should create a user and retrieve it by id', async () => {
    const newUser = {
      email: uniqueEmail,
      username: 'testuser',
      password: 'password123',
    }

    const { user: createdUser } = await createUser(newUser)
    expect(createdUser).toHaveProperty('id')
    expect(createdUser.email).toBe(newUser.email)
    expect(createdUser.username).toBe(newUser.username)

    const retrievedUser = await getUserById(createdUser.id)
    expect(retrievedUser).toEqual(createdUser)
  })
})
