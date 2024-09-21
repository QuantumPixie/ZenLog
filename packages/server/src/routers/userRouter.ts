import { z } from 'zod'
import { router, procedure, authedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import {
  createUser,
  loginUser,
  getUserById,
  changePassword,
  deleteUser,
} from '../services/userService'

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  username: z.string().min(3),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

const changePasswordSchema = z.object({
  oldPassword: z.string(),
  newPassword: z.string().min(6),
})

export const userRouter = router({
  signup: procedure.input(signupSchema).mutation(async ({ input, ctx }) => {
    try {
      const { user, token } = await createUser(input)
      ctx.res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      return { user }
    } catch (error) {
      console.error('Error in signup:', error)

      // Check if the error is a PostgreSQL unique constraint violation (code '23505')
      if (error instanceof Error && 'code' in error && error.code === '23505') {
        // Handle unique constraint violation (e.g., email already in use)
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Email already in use. Please use a different email.',
        })
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to register user. Please try again later.',
      })
    }
  }),

  login: procedure.input(loginSchema).mutation(async ({ input, ctx }) => {
    try {
      const result = await loginUser(input.email, input.password)
      if (!result) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message:
            'Invalid email or password. Please check your credentials and try again.',
        })
      }
      ctx.res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      return { user: result.user }
    } catch (error) {
      console.error('Error in login:', error)
      if (error instanceof TRPCError) {
        throw error
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message:
          'An unexpected error occurred during login. Please try again later.',
      })
    }
  }),

  logout: authedProcedure.mutation(({ ctx }) => {
    ctx.res.clearCookie('token')
    return { success: true }
  }),

  getCurrentUser: authedProcedure.query(async ({ ctx }) => {
    try {
      const user = await getUserById(ctx.user.id)
      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found. Please log in again.',
        })
      }
      return user
    } catch (error) {
      console.error('Error in getCurrentUser:', error)
      if (error instanceof TRPCError) {
        throw error
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve user information. Please try again later.',
      })
    }
  }),

  changePassword: authedProcedure
    .input(changePasswordSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const success = await changePassword(
          ctx.user.id,
          input.oldPassword,
          input.newPassword
        )
        if (!success) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message:
              'Failed to change password. Please check your old password and try again.',
          })
        }
        return { message: 'Password changed successfully' }
      } catch (error) {
        console.error('Error in changePassword:', error)
        if (error instanceof TRPCError) {
          throw error
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to change password. Please try again later.',
        })
      }
    }),
  deleteUser: authedProcedure.mutation(async ({ ctx }) => {
    try {
      await deleteUser(ctx.user.id)
      return { message: 'User deleted successfully' }
    } catch (error) {
      if (error instanceof TRPCError) throw error
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete user',
        cause: error,
      })
    }
  }),
})
