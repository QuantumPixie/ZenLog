import type { Selectable, Insertable } from 'kysely';
import type { UserTable } from '../models/user';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../database';
import { TRPCError } from '@trpc/server';

type User = Selectable<UserTable>;
type NewUser = Insertable<UserTable>;
type SafeUser = Omit<User, 'password'>;

export async function createUser(newUser: NewUser): Promise<SafeUser> {
  console.log('createUser called with:', newUser);
  try {
    const [createdUser] = await db
      .insertInto('users')
      .values(newUser)
      .returning(['id', 'email', 'username'])
      .execute();

    if (!createdUser) {
      throw new Error('Failed to create user');
    }

    console.log('User created successfully:', createdUser);
    return createdUser;
  } catch (error) {
    console.error('Error in createUser:', error);
    throw error;
  }
}

export async function loginUser(email: string, password: string): Promise<{ token: string; user: SafeUser } | null> {
  console.log('loginUser called with email:', email);
  try {
    const [user] = await db
      .selectFrom('users')
      .select(['id', 'email', 'username', 'password'])
      .where('email', '=', email)
      .limit(1)
      .execute();


    if (!user) {
      return null; // user not found
    }

    console.log('Comparing passwords');
    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', passwordMatch);

    if (!passwordMatch) {
      return null; // invalid password
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not set');
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Server configuration error',
      });
    }

    const token = jwt.sign(
      { user_id: user.id },
      jwtSecret,
      { expiresIn: '1h' }
    );

    const { id, email: userEmail, username } = user;

    console.log('Login successful');
    return { token, user: { id, email: userEmail, username } };
  } catch (error) {
    console.error('Error in loginUser:', error);
    throw error;
  }
}

export async function getUserById(userId: number): Promise<SafeUser | undefined> {
  console.log('getUserById called with id:', userId);
  try {
    const [user] = await db
      .selectFrom('users')
      .select(['id', 'email', 'username'])
      .where('id', '=', userId)
      .limit(1)
      .execute();

    console.log('User found:', user ? 'Yes' : 'No');
    return user;
  } catch (error) {
    console.error('Error in getUserById:', error);
    throw error;
  }
}

export async function changePassword(id: number, oldPassword: string, newPassword: string): Promise<boolean> {
  console.log('changePassword called for user id:', id);
  try {
    const [user] = await db
      .selectFrom('users')
      .select(['password'])
      .where('id', '=', id)
      .limit(1)
      .execute();

    if (!user) {
      console.log('User not found');
      return false;
    }

    const passwordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!passwordMatch) {
      console.log('Old password is incorrect');
      return false;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await db
      .updateTable('users')
      .set({ password: hashedPassword })
      .where('id', '=', id)
      .execute();

    console.log('Password change result:', result.length > 0 ? 'Success' : 'Failure');
    return result.length > 0;
  } catch (error) {
    console.error('Error in changePassword:', error);
    throw error;
  }
}