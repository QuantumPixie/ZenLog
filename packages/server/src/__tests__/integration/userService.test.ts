import { describe, it, expect, beforeEach } from 'vitest'
import { wrapInRollbacks } from './transactions/transactions'
import {
  createUser,
  getUserById,
  loginUser,
  changePassword,
  deleteUser,
} from '../../services/userService'
import { generateFakeUser } from './helperFunctions/userFactory'
import { testDb } from '../integration/transactions/testSetup'
import { Kysely } from 'kysely'
import { Database } from '../../models/database'

describe('User Service Integration Tests', () => {
  let db: Kysely<Database>
  let testUser: ReturnType<typeof generateFakeUser>

  beforeEach(async () => {
    db = (await wrapInRollbacks(testDb)) as Kysely<Database>
    testUser = generateFakeUser()
  })

  it('should create a user and retrieve it by id', async () => {
    const { user: createdUser } = await createUser(testUser, db)
    expect(createdUser).toHaveProperty('id')
    expect(createdUser.email).toBe(testUser.email)
    expect(createdUser.username).toBe(testUser.username)

    const retrievedUser = await getUserById(createdUser.id, db)
    expect(retrievedUser).toEqual(createdUser)
  })

  it('should login a user with correct credentials', async () => {
    await createUser(testUser, db)

    const loginResult = await loginUser(testUser.email, testUser.password, db)
    expect(loginResult).not.toBeNull()
    expect(loginResult?.user.email).toBe(testUser.email)
    expect(loginResult?.token).toBeDefined()
  })

  it('should not login a user with incorrect password', async () => {
    await createUser(testUser, db)

    const loginResult = await loginUser(testUser.email, 'wrongpassword', db)
    expect(loginResult).toBeNull()
  })

  it('should change user password', async () => {
    const { user: createdUser } = await createUser(testUser, db)

    const newPassword = 'newpassword123'
    const changePasswordResult = await changePassword(
      createdUser.id,
      testUser.password,
      newPassword,
      db
    )
    expect(changePasswordResult).toBe(true)

    const loginWithOldPassword = await loginUser(
      testUser.email,
      testUser.password,
      db
    )
    expect(loginWithOldPassword).toBeNull()

    const loginWithNewPassword = await loginUser(
      testUser.email,
      newPassword,
      db
    )
    expect(loginWithNewPassword).not.toBeNull()
  })

  it('should delete a user', async () => {
    const { user: createdUser } = await createUser(testUser, db)

    await deleteUser(createdUser.id, db)

    const deletedUser = await getUserById(createdUser.id, db)
    expect(deletedUser?.deleted_at).not.toBeNull()
  })
})
