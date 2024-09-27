import { type Selectable, type Insertable, sql, Kysely } from 'kysely'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { TRPCError } from '@trpc/server'
import { db, type Database } from '../database/index'
import type { UserTable } from '../models/user'

type User = Selectable<UserTable>
type NewUser = Insertable<UserTable>
type SafeUser = Omit<User, 'password'>

export async function createUser(
  newUser: NewUser,
  dbInstance: Kysely<Database> = db
): Promise<{ user: SafeUser; token: string }> {
  try {
    const hashedPassword = await bcrypt.hash(newUser.password, 10)
    const userToInsert = { ...newUser, password: hashedPassword }

    const [createdUser] = await dbInstance
      .insertInto('users')
      .values(userToInsert)
      .returning(['id', 'email', 'username', 'deleted_at'])
      .execute()

    if (!createdUser) {
      throw new Error('Failed to create user')
    }

    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Server configuration error',
      })
    }

    const token = jwt.sign({ user_id: createdUser.id }, jwtSecret, {
      expiresIn: '1d',
    })

    return { user: createdUser, token }
  } catch (error) {
    console.error('Error in createUser:', error)
    throw error
  }
}

export async function loginUser(
  email: string,
  password: string,
  dbInstance: Kysely<Database> = db
): Promise<{ user: SafeUser; token: string } | null> {
  try {
    console.log(`Attempting login for email: ${email}`)

    const [user] = await dbInstance
      .selectFrom('users')
      .select(['id', 'email', 'username', 'password', 'deleted_at'])
      .where('email', '=', email)
      .limit(1)
      .execute()

    if (!user) {
      console.log(`User not found for email: ${email}`)
      return null // user not found
    }

    console.log(`User found for email: ${email}`)

    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      console.log(`Password mismatch for email: ${email}`)
      return null // invalid password
    }

    console.log(`Password match successful for email: ${email}`)

    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      console.error('JWT_SECRET is not set')
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Server configuration error',
      })
    }

    const token = jwt.sign({ user_id: user.id }, jwtSecret, { expiresIn: '1d' })

    const { id, email: userEmail, username } = user

    console.log(`Login successful for email: ${email}`)

    return {
      user: { id, email: userEmail, username, deleted_at: user.deleted_at },
      token,
    }
  } catch (error) {
    console.error('Error in loginUser:', error)
    throw error
  }
}

export async function getUserById(
  userId: number,
  dbInstance: Kysely<Database> = db
): Promise<SafeUser | undefined> {
  try {
    const [user] = await dbInstance
      .selectFrom('users')
      .select(['id', 'email', 'username', 'deleted_at'])
      .where('id', '=', userId)
      .limit(1)
      .execute()

    return user
  } catch (error) {
    console.error('Error in getUserById:', error)
    throw error
  }
}

export async function changePassword(
  id: number,
  oldPassword: string,
  newPassword: string,
  dbInstance: Kysely<Database> = db
): Promise<boolean> {
  try {
    const [user] = await dbInstance
      .selectFrom('users')
      .select(['password'])
      .where('id', '=', id)
      .limit(1)
      .execute()

    if (!user) {
      return false
    }

    const passwordMatch = await bcrypt.compare(oldPassword, user.password)
    if (!passwordMatch) {
      return false
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    const result = await db
      .updateTable('users')
      .set({ password: hashedPassword })
      .where('id', '=', id)
      .execute()

    return result.length > 0
  } catch (error) {
    console.error('Error in changePassword:', error)
    throw error
  }
}

export function generateToken(userId: number): string {
  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Server configuration error',
    })
  }
  return jwt.sign({ user_id: userId }, jwtSecret, { expiresIn: '1d' })
}

export async function deleteUser(
  userId: number,
  dbInstance: Kysely<Database> = db
): Promise<void> {
  const result = await dbInstance
    .updateTable('users')
    .set({
      deleted_at: sql`CURRENT_TIMESTAMP`,
    })
    .where('id', '=', userId)
    .execute()

  if (result.length === 0) {
    throw new Error('User not found')
  }
}
