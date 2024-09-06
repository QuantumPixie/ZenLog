import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TRPCError } from '@trpc/server'
import { createCallerFactory } from '../mocks/trpcMock'
import { userRouter } from '../../routers/userRouter'
import {
  createUser,
  loginUser,
  changePassword,
  getUserById,
} from '../../services/userService'

vi.mock('../../services/userService', () => ({
  createUser: vi.fn(),
  loginUser: vi.fn(),
  changePassword: vi.fn(),
  getUserById: vi.fn(),
}))

const mockUserId = 1
const createCaller = createCallerFactory(userRouter)

const createAuthenticatedCaller = () =>
  createCaller({
    user: { id: mockUserId, email: 'test@example.com', username: 'testuser' },
  }) as ReturnType<typeof userRouter.createCaller>

const createUnauthenticatedCaller = () =>
  createCaller({}) as ReturnType<typeof userRouter.createCaller>

describe('User Router', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should call all procedures', async () => {
    vi.mocked(createUser).mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      username: 'testuser',
    })
    vi.mocked(loginUser).mockResolvedValue({
      token: 'mocktoken',
      user: { id: 1, email: 'test@example.com', username: 'testuser' },
    })
    vi.mocked(changePassword).mockResolvedValue(true)
    vi.mocked(getUserById).mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      username: 'testuser',
    })

    const unauthenticatedCaller = createUnauthenticatedCaller()
    const authenticatedCaller = createAuthenticatedCaller()

    await unauthenticatedCaller
      .signup({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      })
      .catch(() => {})

    await unauthenticatedCaller
      .login({
        email: 'test@example.com',
        password: 'password123',
      })
      .catch(() => {})

    await authenticatedCaller
      .changePassword({
        oldPassword: 'oldpassword',
        newPassword: 'newpassword',
      })
      .catch(() => {})

    await authenticatedCaller.getCurrentUser().catch(() => {})

    expect(createUser).toHaveBeenCalled()
    expect(loginUser).toHaveBeenCalled()
    expect(changePassword).toHaveBeenCalled()
    expect(getUserById).toHaveBeenCalled()
  })

  describe('signup', () => {
    it('should register a new user', async () => {
      const newUser = { id: 1, email: 'test@example.com', username: 'testuser' }
      vi.mocked(createUser).mockResolvedValue(newUser)

      const caller = createUnauthenticatedCaller()
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
      const caller = createUnauthenticatedCaller()
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

      const caller = createUnauthenticatedCaller()
      await expect(
        caller.signup({
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123',
        })
      ).rejects.toThrow(TRPCError)
    })
  })

  describe('login', () => {
    it('should login a user', async () => {
      const loginResult = {
        token: 'mocktoken',
        user: { id: 1, email: 'test@example.com', username: 'testuser' },
      }
      vi.mocked(loginUser).mockResolvedValue(loginResult)

      const caller = createUnauthenticatedCaller()
      const result = await caller.login({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(result).toEqual(loginResult)
      expect(loginUser).toHaveBeenCalledWith('test@example.com', 'password123')
    })

    it('should handle login failure', async () => {
      vi.mocked(loginUser).mockResolvedValue(null)

      const caller = createUnauthenticatedCaller()
      await expect(
        caller.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow(TRPCError)
    })

    it('should throw a TRPCError for invalid login input', async () => {
      const caller = createUnauthenticatedCaller()
      await expect(
        caller.login({
          email: 'invalid-email',
          password: 'password123',
        })
      ).rejects.toThrow(TRPCError)
    })

    it('should throw INTERNAL_SERVER_ERROR for unexpected errors', async () => {
      const error = new Error('Unexpected error')
      vi.mocked(loginUser).mockRejectedValue(error)

      const caller = createUnauthenticatedCaller()
      await expect(
        caller.login({
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('An unexpected error occurred')
    })
  })

  describe('changePassword', () => {
    it('should change user password', async () => {
      vi.mocked(changePassword).mockResolvedValue(true)

      const caller = createAuthenticatedCaller()
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

      const caller = createAuthenticatedCaller()
      await expect(
        caller.changePassword({
          oldPassword: 'wrongpassword',
          newPassword: 'newpassword',
        })
      ).rejects.toThrow(TRPCError)
    })

    it('should throw a TRPCError for invalid changePassword input', async () => {
      const caller = createAuthenticatedCaller()
      await expect(
        caller.changePassword({
          oldPassword: 'oldpassword',
          newPassword: '12345', // too short
        })
      ).rejects.toThrow(TRPCError)
    })

    it('should throw INTERNAL_SERVER_ERROR when changePassword throws', async () => {
      vi.mocked(changePassword).mockRejectedValue(new Error('Unexpected error'))

      const caller = createAuthenticatedCaller()
      await expect(
        caller.changePassword({
          oldPassword: 'oldpassword',
          newPassword: 'newpassword',
        })
      ).rejects.toThrow('Failed to change password')
    })
  })

  describe('getCurrentUser', () => {
    it('should get current user details', async () => {
      const user = {
        id: mockUserId,
        email: 'test@example.com',
        username: 'testuser',
      }
      vi.mocked(getUserById).mockResolvedValue(user)

      const caller = createAuthenticatedCaller()
      const result = await caller.getCurrentUser()

      expect(result).toEqual(user)
      expect(getUserById).toHaveBeenCalledWith(mockUserId)
    })

    it('should throw an error for non-existent user', async () => {
      vi.mocked(getUserById).mockResolvedValue(undefined)

      const caller = createAuthenticatedCaller()
      await expect(caller.getCurrentUser()).rejects.toThrow(TRPCError)
    })

    it('should handle unexpected errors in getCurrentUser', async () => {
      const error = new Error('Database error')
      vi.mocked(getUserById).mockRejectedValue(error)

      const caller = createAuthenticatedCaller()
      await expect(caller.getCurrentUser()).rejects.toThrow(TRPCError)
    })
  })

  describe('Error logging', () => {
    it('should log errors during signup', async () => {
      const error = new Error('Signup error')
      vi.mocked(createUser).mockRejectedValue(error)
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const caller = createUnauthenticatedCaller()
      await expect(
        caller.signup({
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123',
        })
      ).rejects.toThrow(TRPCError)

      expect(consoleSpy).toHaveBeenCalledWith('Error in signup:', error)
      consoleSpy.mockRestore()
    })

    it('should log errors during login', async () => {
      const error = new Error('Login error')
      vi.mocked(loginUser).mockRejectedValue(error)
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const caller = createUnauthenticatedCaller()
      await expect(
        caller.login({
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow(TRPCError)

      expect(consoleSpy).toHaveBeenCalledWith('Error in login:', error)
      consoleSpy.mockRestore()
    })
  })

  describe('Edge cases', () => {
    it('should handle empty input for signup', async () => {
      const caller = createUnauthenticatedCaller()
      await expect(
        caller.signup({
          email: '',
          username: '',
          password: '',
        })
      ).rejects.toThrow(TRPCError)
    })

    it('should handle empty input for login', async () => {
      const caller = createUnauthenticatedCaller()
      await expect(
        caller.login({
          email: '',
          password: '',
        })
      ).rejects.toThrow(TRPCError)
    })

    it('should handle very long inputs for signup', async () => {
      const caller = createUnauthenticatedCaller()
      const veryLongString = 'a'.repeat(1000)
      await expect(
        caller.signup({
          email: `${veryLongString}@example.com`,
          username: veryLongString,
          password: veryLongString,
        })
      ).rejects.toThrow(TRPCError)
    })

    it('should handle very long inputs for changePassword', async () => {
      const caller = createAuthenticatedCaller()
      const veryLongString = 'a'.repeat(1000)
      await expect(
        caller.changePassword({
          oldPassword: veryLongString,
          newPassword: veryLongString,
        })
      ).rejects.toThrow(TRPCError)
    })
  })
})
