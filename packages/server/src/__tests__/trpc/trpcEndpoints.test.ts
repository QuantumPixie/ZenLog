import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../server';
import { createServer, Server } from 'http';
import express from 'express';
import { appRouter } from '../../server';
import { createContext } from '../../trpc';
import * as trpcExpress from '@trpc/server/adapters/express';
import { authenticateJWT } from '../../middleware/auth';
import { setDb } from '../../services/userService';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { CustomRequest } from '../../types/customRequest';
import { beforeAll, afterAll, beforeEach, describe, it, expect, vi } from 'vitest';
import { MockDatabase, createMockDatabase } from '../mocks/databaseMock';
import { testConfig } from '../testConfig';

// Mocks
vi.mock('bcrypt');
vi.mock('jsonwebtoken');
vi.mock('../../middleware/auth', () => ({
  authenticateJWT: vi.fn((req: CustomRequest, _, next) => {
    const authHeader = req.header('Authorization');
    if (authHeader) {
      req.user = { id: 1, email: 'test@example.com', username: 'testuser' };
    }
    next();
  }),
}));
vi.mock('../../utils/tokenUtils', () => ({
  getUserFromToken: vi.fn().mockReturnValue({ id: 1, email: 'test@example.com', username: 'testuser' }),
}));

describe('tRPC Endpoints', () => {
  let client: ReturnType<typeof createTRPCProxyClient<AppRouter>>;
  let server: Server;
  let mockDb: MockDatabase;

  beforeAll(async () => {
    const app = express();
    app.use(express.json());

    app.use('/api/trpc/*', (req, res, next) => {
      authenticateJWT(req as CustomRequest, res, next);
    });

    app.use(
      '/api/trpc',
      trpcExpress.createExpressMiddleware({
        router: appRouter,
        createContext,
      })
    );

    server = createServer(app);
    await new Promise<void>((resolve) => {
      server.listen(testConfig.port, () => {
        console.log(`Test server listening on port ${testConfig.port}`);
        resolve();
      });
    });

    client = createTRPCProxyClient<AppRouter>({
      links: [
        httpBatchLink({
          url: `http://localhost:${testConfig.port}/api/trpc`,
        }),
      ],
    });
  });

  afterAll(() => {
    return new Promise<void>((resolve) => {
      server.close(() => {
        console.log('Test server closed');
        resolve();
      });
    });
  });

  beforeEach(() => {
    mockDb = createMockDatabase();
    setDb(mockDb);
  });


  describe('User Endpoints', () => {
    it('should register a new user', async () => {
      vi.mocked(bcrypt.hash).mockResolvedValue('hashedpassword' as never);
      mockDb.execute.mockResolvedValue([{ id: 1, email: 'test@example.com', username: 'testuser' }]);

      const result = await client.user.signup.mutate({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      });

      expect(result).toEqual({ user_id: 1 });
      expect(mockDb.insertInto).toHaveBeenCalledWith('users');
      expect(mockDb.values).toHaveBeenCalledWith(expect.objectContaining({
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedpassword'
      }));
    });


    it('should login a user', async () => {
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(jwt.sign).mockReturnValue('mocktoken' as never);
      mockDb.execute.mockResolvedValue([{ id: 1, email: 'test@example.com', username: 'testuser', password: 'hashedpassword' }]);

      const result = await client.user.login.mutate({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual({
        token: 'mocktoken',
        user: { id: 1, email: 'test@example.com', username: 'testuser' }
      });
      expect(mockDb.selectFrom).toHaveBeenCalledWith('users');
      expect(mockDb.where).toHaveBeenCalledWith('email', '=', 'test@example.com');
    });

    it('should not login with incorrect credentials', async () => {
      mockDb.execute.mockResolvedValue([]);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(client.user.login.mutate({
        email: 'test@example.com',
        password: 'wrongpassword',
      })).rejects.toThrow('Invalid credentials');

      expect(mockDb.selectFrom).toHaveBeenCalledWith('users');
      expect(mockDb.where).toHaveBeenCalledWith('email', '=', 'test@example.com');
    });
  });

  describe('Protected Endpoints', () => {
    let authenticatedClient: ReturnType<typeof createTRPCProxyClient<AppRouter>>;

    beforeEach(() => {
      vi.mocked(jwt.verify).mockReturnValue({ user_id: 1 } as any);
      authenticatedClient = createTRPCProxyClient<AppRouter>({
        links: [
          httpBatchLink({
            url: `http://localhost:${testConfig.port}/api/trpc`,
            headers: () => ({
              Authorization: 'Bearer mocktoken',
            }),
          }),
        ],
      });
    });

    it('should change password for authenticated user', async () => {
      mockDb.execute
        .mockResolvedValueOnce([{ password: 'hashedoldpassword' }])
        .mockResolvedValueOnce([{ affected: 1 }]);

      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashednewpassword' as never);

      const result = await authenticatedClient.user.changePassword.mutate({
        oldPassword: 'oldpassword',
        newPassword: 'newpassword',
      });

      expect(result).toEqual({ message: 'Password changed successfully' });
      expect(mockDb.updateTable).toHaveBeenCalledWith('users');
      expect(mockDb.set).toHaveBeenCalledWith({ password: 'hashednewpassword' });
      expect(mockDb.where).toHaveBeenCalledWith('id', '=', 1);
    });

    it('should get user details for authenticated user', async () => {
      mockDb.execute.mockResolvedValue([{ id: 1, email: 'test@example.com', username: 'testuser' }]);
    
      const result = await authenticatedClient.user.getUser.query({ id: 1 });

      expect(result).toEqual({ id: 1, email: 'test@example.com', username: 'testuser' });
      expect(mockDb.selectFrom).toHaveBeenCalledWith('users');
      expect(mockDb.select).toHaveBeenCalledWith(['id', 'email', 'username']);
      expect(mockDb.where).toHaveBeenCalledWith('id', '=', 1);
    });
  });
});