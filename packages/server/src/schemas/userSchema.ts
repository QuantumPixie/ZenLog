import { z } from 'zod'
import { idSchema } from '../shared/idSchema'

export const userSchema = z.object({
  id: idSchema,
  email: z.string().trim().toLowerCase().email(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(64, 'Password must be at most 64 characters long'),
  username: z.string().min(3).max(50),
})

// Public keys exposed to the client
export const userKeysPublic = ['id', 'username'] as const

// Type for public user
export type UserPublic = Pick<
  z.infer<typeof userSchema>,
  (typeof userKeysPublic)[number]
>

export const authUserSchema = userSchema.pick({ id: true })
export type AuthUser = z.infer<typeof authUserSchema>

export const signupSchema = userSchema.pick({
  email: true,
  password: true,
  username: true,
})

export const loginSchema = userSchema.pick({
  email: true,
  password: true,
})

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(8).max(64),
  newPassword: z.string().min(8).max(64),
})

export const getUserByIdSchema = z.object({
  id: idSchema,
  email: z.string().email().optional(),
  username: z.string().optional(),
})
