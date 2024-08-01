/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createUser, loginUser, getUserById, changePassword } from '../../services/userService';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

vi.mock('bcrypt');
vi.mock('jsonwebtoken');
vi.mock('../../database', () => ({
  db: {
    insertInto: vi.fn(),
    selectFrom: vi.fn(),
    updateTable: vi.fn(),
  },
}));

import { db } from '../../database';

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const newUser = { email: 'test@example.com', username: 'testuser', password: 'password' };
      const createdUser = { id: 1, email: newUser.email, username: newUser.username };

      vi.mocked(db.insertInto).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockReturnValue({
            execute: vi.fn().mockResolvedValue([createdUser])
          })
        })
      } as any);

      const result = await createUser(newUser);

      expect(result).toEqual(createdUser);
      expect(db.insertInto).toHaveBeenCalledWith('users');
      expect(db.insertInto('users').values).toHaveBeenCalledWith(newUser);
      expect(db.insertInto('users').values(newUser).returning).toHaveBeenCalledWith(['id', 'email', 'username']);
    });
  });

  describe('loginUser', () => {
    it('should login a user with correct credentials', async () => {
      const email = 'test@example.com';
      const password = 'password';
      const user = { id: 1, email, username: 'testuser', password: 'hashedpassword' };

      vi.mocked(db.selectFrom).mockReturnValue({
        select: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              execute: vi.fn().mockResolvedValue([user])
            })
          })
        })
      } as any);

      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(jwt.sign).mockReturnValue('token' as never);

      const result = await loginUser(email, password);

      expect(result).toEqual({
        token: 'token',
        user: { id: user.id, email: user.email, username: user.username },
      });
    });

    it('should return null for incorrect credentials', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';
      const user = { id: 1, email, username: 'testuser', password: 'hashedpassword' };

      vi.mocked(db.selectFrom).mockReturnValue({
        select: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              execute: vi.fn().mockResolvedValue([user])
            })
          })
        })
      } as any);

      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      const result = await loginUser(email, password);

      expect(result).toBeNull();
    });
  });

  describe('getUserById', () => {
    it('should return a user by id', async () => {
      const userId = 1;
      const user = { id: userId, email: 'test@example.com', username: 'testuser' };

      vi.mocked(db.selectFrom).mockReturnValue({
        select: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              execute: vi.fn().mockResolvedValue([user])
            })
          })
        })
      } as any);

      const result = await getUserById(userId);

      expect(result).toEqual(user);
    });
  });

  describe('changePassword', () => {
    it('should change user password', async () => {
      const userId = 1;
      const oldPassword = 'oldpassword';
      const newPassword = 'newpassword';
      const user = { password: 'hashedoldpassword' };

      vi.mocked(db.selectFrom).mockReturnValue({
        select: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              execute: vi.fn().mockResolvedValue([user])
            })
          })
        })
      } as any);

      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashednewpassword' as never);

      vi.mocked(db.updateTable).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            execute: vi.fn().mockResolvedValue([{ affected: 1 }])
          })
        })
      } as any);

      const result = await changePassword(userId, oldPassword, newPassword);

      expect(result).toBe(true);
      expect(db.updateTable).toHaveBeenCalledWith('users');
      expect(db.updateTable('users').set).toHaveBeenCalledWith({ password: 'hashednewpassword' });
      expect(db.updateTable('users').set({ password: 'hashednewpassword' }).where).toHaveBeenCalledWith('id', '=', userId);
    });

    it('should return false for incorrect old password', async () => {
      const userId = 1;
      const oldPassword = 'wrongpassword';
      const newPassword = 'newpassword';
      const user = { password: 'hashedoldpassword' };

      vi.mocked(db.selectFrom).mockReturnValue({
        select: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              execute: vi.fn().mockResolvedValue([user])
            })
          })
        })
      } as any);

      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      const result = await changePassword(userId, oldPassword, newPassword);

      expect(result).toBe(false);
    });
  });
});