import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { TRPCError } from '@trpc/server'
import type { Selectable, Insertable } from 'kysely'
import {
  createUser,
  loginUser,
  getUserById,
  changePassword,
} from '../../services/userService'
import type { UserTable } from '../../models/user'

import { db } from '../../database'

type User = Selectable<UserTable>
type NewUser = Insertable<UserTable>

vi.mock('bcrypt')
vi.mock('jsonwebtoken')
vi.mock('../../database', () => ({
  db: {
    insertInto: vi.fn(),
    selectFrom: vi.fn(),
    updateTable: vi.fn(),
  },
}))

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.JWT_SECRET = 'test_secret'
  })

  afterEach(() => {
    delete process.env.JWT_SECRET
  })

  describe('createUser', () => {
    it('should create a new user', async () => {
      const newUser: NewUser = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password',
      }
      const createdUser: Omit<User, 'password'> = {
        id: 1,
        email: newUser.email,
        username: newUser.username,
      }

      vi.mocked(bcrypt.hash).mockResolvedValue('hashedpassword' as never)

      vi.mocked(db.insertInto).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockReturnValue({
            execute: vi.fn().mockResolvedValue([createdUser]),
          }),
        }),
      } as unknown as ReturnType<typeof db.insertInto>)

      vi.mocked(jwt.sign).mockReturnValue('token' as never)

      const result = await createUser(newUser)

      expect(result).toEqual({ user: createdUser, token: 'token' })
      expect(db.insertInto).toHaveBeenCalledWith('users')
      expect(vi.mocked(db.insertInto('users').values)).toHaveBeenCalledWith({
        ...newUser,
        password: 'hashedpassword',
      })
      expect(
        vi.mocked(
          db
            .insertInto('users')
            .values({ ...newUser, password: 'hashedpassword' }).returning
        )
      ).toHaveBeenCalledWith(['id', 'email', 'username'])
    })

    it('should throw an error if user creation fails', async () => {
      const newUser: NewUser = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password',
      }

      vi.mocked(bcrypt.hash).mockResolvedValue('hashedpassword' as never)

      vi.mocked(db.insertInto).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockReturnValue({
            execute: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as unknown as ReturnType<typeof db.insertInto>)

      await expect(createUser(newUser)).rejects.toThrow('Failed to create user')
    })
  })

  describe('loginUser', () => {
    it('should login a user with correct credentials', async () => {
      const email = 'test@example.com'
      const password = 'password'
      const user: User = {
        id: 1,
        email,
        username: 'testuser',
        password: 'hashedpassword',
      }

      vi.mocked(db.selectFrom).mockReturnValue({
        select: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              execute: vi.fn().mockResolvedValue([user]),
            }),
          }),
        }),
      } as unknown as ReturnType<typeof db.selectFrom>)

      vi.mocked(bcrypt.compare).mockResolvedValue(true as never)
      vi.mocked(jwt.sign).mockReturnValue('token' as never)

      const result = await loginUser(email, password)

      expect(result).toEqual({
        token: 'token',
        user: { id: user.id, email: user.email, username: user.username },
      })
      expect(jwt.sign).toHaveBeenCalledWith(
        { user_id: user.id },
        'test_secret',
        { expiresIn: '1d' }
      )
    })

    it('should throw an error if JWT_SECRET is not set', async () => {
      delete process.env.JWT_SECRET

      const email = 'test@example.com'
      const password = 'password'
      const user: User = {
        id: 1,
        email,
        username: 'testuser',
        password: 'hashedpassword',
      }

      vi.mocked(db.selectFrom).mockReturnValue({
        select: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              execute: vi.fn().mockResolvedValue([user]),
            }),
          }),
        }),
      } as unknown as ReturnType<typeof db.selectFrom>)

      vi.mocked(bcrypt.compare).mockResolvedValue(true as never)

      await expect(loginUser(email, password)).rejects.toThrow(TRPCError)
    })

    it('should return null for incorrect credentials', async () => {
      const email = 'test@example.com'
      const password = 'wrongpassword'
      const user: User = {
        id: 1,
        email,
        username: 'testuser',
        password: 'hashedpassword',
      }

      vi.mocked(db.selectFrom).mockReturnValue({
        select: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              execute: vi.fn().mockResolvedValue([user]),
            }),
          }),
        }),
      } as unknown as ReturnType<typeof db.selectFrom>)

      vi.mocked(bcrypt.compare).mockResolvedValue(false as never)

      const result = await loginUser(email, password)

      expect(result).toBeNull()
    })
  })

  describe('getUserById', () => {
    it('should return a user by id', async () => {
      const userId = 1
      const user: Omit<User, 'password'> = {
        id: userId,
        email: 'test@example.com',
        username: 'testuser',
      }

      vi.mocked(db.selectFrom).mockReturnValue({
        select: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              execute: vi.fn().mockResolvedValue([user]),
            }),
          }),
        }),
      } as unknown as ReturnType<typeof db.selectFrom>)

      const result = await getUserById(userId)

      expect(result).toEqual(user)
    })
  })

  describe('changePassword', () => {
    it('should change user password', async () => {
      const userId = 1
      const oldPassword = 'oldpassword'
      const newPassword = 'newpassword'
      const user: Pick<User, 'password'> = { password: 'hashedoldpassword' }

      vi.mocked(db.selectFrom).mockReturnValue({
        select: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              execute: vi.fn().mockResolvedValue([user]),
            }),
          }),
        }),
      } as unknown as ReturnType<typeof db.selectFrom>)

      vi.mocked(bcrypt.compare).mockResolvedValue(true as never)
      vi.mocked(bcrypt.hash).mockResolvedValue('hashednewpassword' as never)

      vi.mocked(db.updateTable).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            execute: vi.fn().mockResolvedValue([{ numUpdatedRows: 1 }]),
          }),
        }),
      } as unknown as ReturnType<typeof db.updateTable>)

      const result = await changePassword(userId, oldPassword, newPassword)

      expect(result).toBe(true)
      expect(db.updateTable).toHaveBeenCalledWith('users')
      expect(vi.mocked(db.updateTable('users').set)).toHaveBeenCalledWith({
        password: 'hashednewpassword',
      })
      expect(
        vi.mocked(
          db.updateTable('users').set({ password: 'hashednewpassword' }).where
        )
      ).toHaveBeenCalledWith('id', '=', userId)
    })

    it('should return false for incorrect old password', async () => {
      const userId = 1
      const oldPassword = 'wrongpassword'
      const newPassword = 'newpassword'
      const user: Pick<User, 'password'> = { password: 'hashedoldpassword' }

      vi.mocked(db.selectFrom).mockReturnValue({
        select: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              execute: vi.fn().mockResolvedValue([user]),
            }),
          }),
        }),
      } as unknown as ReturnType<typeof db.selectFrom>)

      vi.mocked(bcrypt.compare).mockResolvedValue(false as never)

      const result = await changePassword(userId, oldPassword, newPassword)

      expect(result).toBe(false)
    })
  })
})
