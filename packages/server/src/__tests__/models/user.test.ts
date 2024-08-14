import { describe, it, expect } from 'vitest'
import type { ColumnType } from 'kysely'
import type { UserTable, NewUser } from '../../models/user'

describe('User Model', () => {
  it('should have correct structure for UserTable', () => {
    const user: UserTable = {
      id: {} as ColumnType<number, number | undefined, never>,
      email: 'test@example.com',
      username: 'testuser',
      password: 'hashedpassword',
    }

    expect(user).toHaveProperty('id')
    expect(user).toHaveProperty('email')
    expect(user).toHaveProperty('username')
    expect(user).toHaveProperty('password')

    expect(typeof user.email).toBe('string')
    expect(typeof user.username).toBe('string')
    expect(typeof user.password).toBe('string')
  })

  it('should allow NewUser without id', () => {
    const newUser: NewUser = {
      email: 'newuser@example.com',
      username: 'newuser',
      password: 'newpassword',
    }

    expect(newUser).not.toHaveProperty('id')
    expect(newUser).toHaveProperty('email')
    expect(newUser).toHaveProperty('username')
    expect(newUser).toHaveProperty('password')
  })
})
