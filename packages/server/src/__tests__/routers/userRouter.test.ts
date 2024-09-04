import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TRPCError } from '@trpc/server'
import { router, authedProcedure, createCallerFactory } from '../mocks/trpcMock'
import {
  createUser,
  loginUser,
  changePassword,
  getUserById,
} from '../../services/userService'
import { z } from 'zod'

vi.mock('../../services/userService', () => ({
  createUser: vi.fn(),
  loginUser: vi.fn(),
  changePassword: vi.fn(),
  getUserById: vi.fn(),
}))

const mockUserRouter = router({
  signup: authedProcedure
    .input(
      z.object({
        email: z.string().email(),
        username: z.string().min(3),
        password: z.string().min(6),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const user = await createUser(input)
        return { user }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to register user',
          cause: error,
        })
      }
    }),

  login: authedProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await loginUser(input.email, input.password)
      if (!result) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials',
        })
      }
      return result
    }),

  changePassword: authedProcedure
    .input(
      z.object({
        oldPassword: z.string(),
        newPassword: z.string().min(6),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const success = await changePassword(
        ctx.user.id,
        input.oldPassword,
        input.newPassword
      )
      if (success) {
        return { message: 'Password changed successfully' }
      }
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Failed to change password',
      })
    }),

  getCurrentUser: authedProcedure.query(async ({ ctx }) => {
    const user = await getUserById(ctx.user.id)
    if (user) {
      return user
    }
    throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' })
  }),
})

const createCaller = createCallerFactory(mockUserRouter)

describe('User Router', () => {
  const mockUserId = 1

  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should register a new user', async () => {
    const newUser = { id: 1, email: 'test@example.com', username: 'testuser' }
    vi.mocked(createUser).mockResolvedValue(newUser)

    const caller = createCaller({ user: { id: mockUserId } })
    const result = await caller.signup({
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
    })

    expect(result).toEqual({ user: newUser })
    expect(createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      })
    )
  })

  it('should throw a TRPCError for invalid signup input', async () => {
    const caller = createCaller({ user: { id: mockUserId } })
    await expect(
      caller.signup({
        email: 'invalid-email',
        username: 'a', // too short
        password: '12345', // too short
      })
    ).rejects.toThrow(TRPCError)
  })

  it('should handle database errors during signup', async () => {
    const dbError = new Error('Database connection failed')
    vi.mocked(createUser).mockRejectedValue(dbError)

    const caller = createCaller({ user: { id: mockUserId } })
    await expect(
      caller.signup({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      })
    ).rejects.toThrow(TRPCError)

    try {
      await caller.signup({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      })
    } catch (error) {
      expect(error.message).toContain('Failed to register user')
      expect(error.code).toBe('INTERNAL_SERVER_ERROR')
    }
  })

  it('should login a user', async () => {
    const loginResult = {
      token: 'mocktoken',
      user: { id: 1, email: 'test@example.com', username: 'testuser' },
    }
    vi.mocked(loginUser).mockResolvedValue(loginResult)

    const caller = createCaller({ user: { id: mockUserId } })
    const result = await caller.login({
      email: 'test@example.com',
      password: 'password123',
    })

    expect(result).toEqual(loginResult)
    expect(loginUser).toHaveBeenCalledWith('test@example.com', 'password123')
  })

  it('should handle login failure', async () => {
    vi.mocked(loginUser).mockResolvedValue(null)

    const caller = createCaller({ user: { id: mockUserId } })
    await expect(
      caller.login({
        email: 'test@example.com',
        password: 'wrongpassword',
      })
    ).rejects.toThrow(TRPCError)

    try {
      await caller.login({
        email: 'test@example.com',
        password: 'wrongpassword',
      })
    } catch (error) {
      expect(error.message).toBe('Invalid credentials')
      expect(error.code).toBe('UNAUTHORIZED')
    }
  })

  it('should throw a TRPCError for invalid login input', async () => {
    const caller = createCaller({ user: { id: mockUserId } })
    await expect(
      caller.login({
        email: 'invalid-email',
        password: 'password123',
      })
    ).rejects.toThrow(TRPCError)
  })

  it('should change user password', async () => {
    vi.mocked(changePassword).mockResolvedValue(true)

    const caller = createCaller({ user: { id: mockUserId } })
    const result = await caller.changePassword({
      oldPassword: 'oldpassword',
      newPassword: 'newpassword',
    })

    expect(result).toEqual({ message: 'Password changed successfully' })
    expect(changePassword).toHaveBeenCalledWith(
      mockUserId,
      'oldpassword',
      'newpassword'
    )
  })

  it('should handle password change failure', async () => {
    vi.mocked(changePassword).mockResolvedValue(false)

    const caller = createCaller({ user: { id: mockUserId } })
    await expect(
      caller.changePassword({
        oldPassword: 'wrongpassword',
        newPassword: 'newpassword',
      })
    ).rejects.toThrow(TRPCError)

    try {
      await caller.changePassword({
        oldPassword: 'wrongpassword',
        newPassword: 'newpassword',
      })
    } catch (error) {
      expect(error.message).toBe('Failed to change password')
      expect(error.code).toBe('BAD_REQUEST')
    }
  })

  it('should throw a TRPCError for invalid changePassword input', async () => {
    const caller = createCaller({ user: { id: mockUserId } })
    await expect(
      caller.changePassword({
        oldPassword: 'oldpassword',
        newPassword: '12345', // too short
      })
    ).rejects.toThrow(TRPCError)
  })

  it('should get current user details', async () => {
    const user = {
      id: mockUserId,
      email: 'test@example.com',
      username: 'testuser',
    }
    vi.mocked(getUserById).mockResolvedValue(user)

    const caller = createCaller({ user: { id: mockUserId } })
    const result = await caller.getCurrentUser()

    expect(result).toEqual(user)
    expect(getUserById).toHaveBeenCalledWith(mockUserId)
  })

  it('should throw an error for non-existent user', async () => {
    vi.mocked(getUserById).mockResolvedValue(undefined)

    const caller = createCaller({ user: { id: mockUserId } })
    await expect(caller.getCurrentUser()).rejects.toThrow(TRPCError)

    try {
      await caller.getCurrentUser()
    } catch (error) {
      expect(error.message).toBe('User not found')
      expect(error.code).toBe('NOT_FOUND')
    }
  })

  it('should handle unexpected errors in getCurrentUser', async () => {
    const error = new Error('Database error')
    vi.mocked(getUserById).mockRejectedValue(error)

    const caller = createCaller({ user: { id: mockUserId } })
    await expect(caller.getCurrentUser()).rejects.toThrow(TRPCError)
  })
})
