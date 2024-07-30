import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createUser, loginUser, getUserById, changePassword, setDb } from '../../services/userService';
import { mockKysely } from '../mocks/databaseMock';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

vi.mock('bcrypt');
vi.mock('jsonwebtoken');

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setDb(mockKysely);
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const newUser = { email: 'test@example.com', username: 'testuser', password: 'password' };
      const createdUser = { id: 1, email: newUser.email, username: newUser.username };

      mockKysely.insertInto = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockReturnValue({
            execute: vi.fn().mockResolvedValue([createdUser])
          })
        })
      });

      const result = await createUser(newUser);

      expect(result).toEqual(createdUser);
      expect(mockKysely.insertInto).toHaveBeenCalledWith('users');
      expect(mockKysely.insertInto('users').values).toHaveBeenCalledWith(newUser);
      expect(mockKysely.insertInto('users').values(newUser).returning).toHaveBeenCalledWith(['id', 'email', 'username']);
    });
  });

  describe('loginUser', () => {
    it('should login a user with correct credentials', async () => {
      const email = 'test@example.com';
      const password = 'password';
      const user = { id: 1, email, username: 'testuser', password: 'hashedpassword' };

      mockKysely.selectFrom= vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              execute: vi.fn().mockResolvedValue([user])
            })
          })
        })
      });

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

      mockKysely.selectFrom= vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              execute: vi.fn().mockResolvedValue([user])
            })
          })
        })
      });

      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      const result = await loginUser(email, password);

      expect(result).toBeNull();
    });
  });

  describe('getUserById', () => {
    it('should return a user by id', async () => {
      const userId = 1;
      const user = { id: userId, email: 'test@example.com', username: 'testuser' };

      mockKysely.selectFrom= vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              execute: vi.fn().mockResolvedValue([user])
            })
          })
        })
      });

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

      mockKysely.selectFrom= vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              execute: vi.fn().mockResolvedValue([user])
            })
          })
        })
      });

      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashednewpassword' as never);

      mockKysely.updateTable = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            execute: vi.fn().mockResolvedValue([{ affected: 1 }])
          })
        })
      });

      const result = await changePassword(userId, oldPassword, newPassword);

      expect(result).toBe(true);
      expect(mockKysely.updateTable).toHaveBeenCalledWith('users');
      expect(mockKysely.updateTable('users').set).toHaveBeenCalledWith({ password: 'hashednewpassword' });
      expect(mockKysely.updateTable('users').set({ password: 'hashednewpassword' }).where).toHaveBeenCalledWith('id', '=', userId);
    });

    it('should return false for incorrect old password', async () => {
      const userId = 1;
      const oldPassword = 'wrongpassword';
      const newPassword = 'newpassword';
      const user = { password: 'hashedoldpassword' };

      mockKysely.selectFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              execute: vi.fn().mockResolvedValue([user])
            })
          })
        })
      });

      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      const result = await changePassword(userId, oldPassword, newPassword);

      expect(result).toBe(false);
    });
  });
});