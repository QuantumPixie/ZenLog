import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../server';
import * as userService from '../../services/userService';
import { createServer, Server } from 'http';
import express from 'express';
import { appRouter } from '../../server';
import * as trpcExpress from '@trpc/server/adapters/express';
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';

// Mock the userService
vi.mock('../../services/userService', () => ({
  createUser: vi.fn(),
  loginUser: vi.fn(),
  changePassword: vi.fn(),
  getUserById: vi.fn(),
}));

describe('User Router', () => {
  let server: Server;
  let client: ReturnType<typeof createTRPCProxyClient<AppRouter>>;

  beforeAll(async () => {
    const app = express();
    app.use(
      '/trpc',
      trpcExpress.createExpressMiddleware({
        router: appRouter,
        createContext: (opts: CreateExpressContextOptions) => {
          return {
            req: opts.req,
            res: opts.res,
            user: { id: 1 },
          };
        },
      })
    );
    
    server = createServer(app);
    
    await new Promise<void>((resolve) => {
      server.listen(0, () => {
        const address = server.address();
        const port = typeof address === 'string' ? address : address?.port;
        client = createTRPCProxyClient<AppRouter>({
          links: [
            httpBatchLink({
              url: `http://localhost:${port}/trpc`,
            }),
          ],
        });
        resolve();
      });
    });
  });

  afterAll(() => {
    return new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it('should register a new user', async () => {
    vi.mocked(userService.createUser).mockResolvedValue({ id: 1, email: '', username: '' });

    const result = await client.user.signup.mutate({
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123'
    });

    expect(result).toEqual({ user_id: 1 });
    expect(userService.createUser).toHaveBeenCalledWith(expect.objectContaining({
      email: 'test@example.com',
      username: 'testuser',
      password: expect.any(String)
    }));
  });

  it('should login a user', async () => {
    vi.mocked(userService.loginUser).mockResolvedValue({
      token: 'mocktoken',
      user: { id: 1, email: 'test@example.com', username: 'testuser' }
    });

    const result = await client.user.login.mutate({
      email: 'test@example.com',
      password: 'password123'
    });

    expect(result).toEqual({
      token: 'mocktoken',
      user: { id: 1, email: 'test@example.com', username: 'testuser' }
    });
    expect(userService.loginUser).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('should change user password', async () => {
    vi.mocked(userService.changePassword).mockResolvedValue(true);

    const result = await client.user.changePassword.mutate({
      oldPassword: 'oldpassword',
      newPassword: 'newpassword'
    });

    expect(result).toEqual({ message: 'Password changed successfully' });
    expect(userService.changePassword).toHaveBeenCalledWith(1, 'oldpassword', 'newpassword');
  });

  it('should get user details', async () => {
    vi.mocked(userService.getUserById).mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      username: 'testuser'
    });

    const result = await client.user.getUser.query({ id: 1 });

    expect(result).toEqual({
      id: 1,
      email: 'test@example.com',
      username: 'testuser'
    });
    expect(userService.getUserById).toHaveBeenCalledWith(1);
  });

  it('should throw an error for non-existent user', async () => {
    vi.mocked(userService.getUserById).mockResolvedValue(undefined);

    await expect(client.user.getUser.query({ id: 999 })).rejects.toThrow();
  });
});