import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createContext, protectedProcedure, type Context } from '../../trpc';
import { TRPCError } from '@trpc/server';
import jwt from 'jsonwebtoken';
import { getUserFromToken } from '../../utils/tokenUtils';
import type { ServerResponse } from 'http';
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import type { MiddlewareFunction } from '@trpc/server';
import type { CustomRequest, User } from '../../types/customRequest';

vi.mock('jsonwebtoken');
vi.mock('../../utils/tokenUtils');

describe('tRPC Setup', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('createContext', () => {
    it('should create context without user when no auth header is present', async () => {
      const req = { header: vi.fn().mockReturnValue(null) } as unknown as CustomRequest;
      const res = {} as ServerResponse;

      const context = await createContext({ req, res } as CreateExpressContextOptions & { req: CustomRequest });

      expect(context).toEqual({ req, res, user: null });
      expect(req.header).toHaveBeenCalledWith('Authorization');
    });

    it('should create context with user when valid auth header is present', async () => {
        const req = { header: vi.fn().mockReturnValue('Bearer validtoken') } as unknown as CustomRequest;
        const res = {} as Response;
        const mockUser: User = { id: 1 };
  
        vi.mocked(jwt.verify).mockReturnValue({ user_id: 1 });
        vi.mocked(getUserFromToken).mockReturnValue(mockUser);
  
        const context = await createContext({ req, res });
  
        expect(context).toEqual({ req, res, user: mockUser });
        expect(req.header).toHaveBeenCalledWith('Authorization');
        expect(jwt.verify).toHaveBeenCalledWith('validtoken', expect.any(String));
        expect(getUserFromToken).toHaveBeenCalledWith(expect.objectContaining({ user_id: 1 }));
      });


    it('should create context without user when token verification fails', async () => {
      const req = { header: vi.fn().mockReturnValue('Bearer invalidtoken') } as unknown as CustomRequest;
      const res = {} as ServerResponse;

      vi.mocked(jwt.verify).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const context = await createContext({ req, res } as CreateExpressContextOptions & { req: CustomRequest });

      expect(context).toEqual({ req, res, user: null });
      expect(req.header).toHaveBeenCalledWith('Authorization');
      expect(jwt.verify).toHaveBeenCalledWith('invalidtoken', expect.any(String));
      expect(getUserFromToken).not.toHaveBeenCalled();
    });
  });

  describe('isAuthenticated middleware', () => {
    it('should allow access for authenticated users', async () => {
      const mockUser: User = { id: 1 };
      const mockContext: Context = {
        user: mockUser,
        req: {} as CustomRequest,
        res: {} as ServerResponse
      };
      const mockNext = vi.fn().mockResolvedValue('result');
  
      const middleware = protectedProcedure._def.middlewares[0] as MiddlewareFunction<Context, unknown>;
      
      const result = await middleware({
        ctx: mockContext,
        next: mockNext,
        rawInput: undefined,
        meta: undefined,
        path: '',
        type: 'query',
        input: undefined,
      });
  
      expect(result).toBe('result');
      expect(mockNext).toHaveBeenCalledWith({
        ctx: mockContext,
      });
    });
  
    it('should throw UNAUTHORIZED error for unauthenticated users', async () => {
      const mockContext: Context = {
        user: null,
        req: {} as CustomRequest,
        res: {} as ServerResponse
      };
      const mockNext = vi.fn();
  
      const middleware = protectedProcedure._def.middlewares[0] as MiddlewareFunction<Context, unknown>;
  
      try {
        await middleware({
          ctx: mockContext,
          next: mockNext,
          rawInput: undefined,
          meta: undefined,
          path: '',
          type: 'query',
          input: undefined,
        });

        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
        expect((error as TRPCError).code).toBe('UNAUTHORIZED');
      }
  
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
})