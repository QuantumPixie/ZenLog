import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TRPCError } from '@trpc/server'
import jwt from 'jsonwebtoken'
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express'
import type { inferAsyncReturnType } from '@trpc/server'
import type { Response } from 'express'
import type { JwtPayload } from 'jsonwebtoken'
import type { CustomRequest, User } from '../../types/customRequest'
import { getUserFromToken } from '../../utils/tokenUtils'
import { createContext, authedProcedure } from '../../trpc'

vi.mock('jsonwebtoken')
vi.mock('../../utils/tokenUtils', () => ({
  getUserFromToken: vi.fn(),
}))

type Context = inferAsyncReturnType<typeof createContext>

describe('tRPC Setup', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('createContext', () => {
    it('should create context without user when no auth header is present', async () => {
      const req = {
        header: vi.fn().mockReturnValue(null),
      } as unknown as CustomRequest
      const res = {} as Response

      const context = await createContext({
        req,
        res,
      } as CreateExpressContextOptions)

      expect(context).toEqual({ req, res, user: null })
      expect(req.header).toHaveBeenCalledWith('Authorization')
    })

    it('should create context with user when valid auth header is present', async () => {
      const req = {
        header: vi.fn().mockReturnValue('Bearer validtoken'),
      } as unknown as CustomRequest
      const res = {} as Response
      const mockUser: User = { id: 1 }

      vi.mocked(jwt.verify).mockImplementation(
        () => ({ user_id: 1 }) as JwtPayload
      )
      vi.mocked(getUserFromToken).mockReturnValue(mockUser)

      const context = await createContext({
        req,
        res,
      } as CreateExpressContextOptions)

      expect(context).toEqual({ req, res, user: mockUser })
      expect(req.header).toHaveBeenCalledWith('Authorization')
      expect(jwt.verify).toHaveBeenCalledWith('validtoken', expect.any(String))
      expect(getUserFromToken).toHaveBeenCalledWith({ user_id: 1 })
    })

    it('should throw UNAUTHORIZED error when token verification fails', async () => {
      const req = {
        header: vi.fn().mockReturnValue('Bearer invalidtoken'),
      } as unknown as CustomRequest
      const res = {} as Response

      vi.mocked(jwt.verify).mockImplementation(() => {
        throw new jwt.JsonWebTokenError('Invalid token')
      })

      await expect(async () => {
        await createContext({ req, res } as CreateExpressContextOptions)
      }).rejects.toThrow(TRPCError)

      await expect(async () => {
        await createContext({ req, res } as CreateExpressContextOptions)
      }).rejects.toThrow('Invalid token')
    })

    it('should throw UNAUTHORIZED error when token payload is invalid', async () => {
      const req = {
        header: vi.fn().mockReturnValue('Bearer validtoken'),
      } as unknown as CustomRequest
      const res = {} as Response

      vi.mocked(jwt.verify).mockImplementation(() => ({}) as JwtPayload)
      vi.mocked(getUserFromToken).mockReturnValue(null)

      await expect(async () => {
        await createContext({ req, res } as CreateExpressContextOptions)
      }).rejects.toThrow(TRPCError)

      await expect(async () => {
        await createContext({ req, res } as CreateExpressContextOptions)
      }).rejects.toThrow('Invalid token payload')
    })
  })

  describe('isAuthenticated middleware', () => {
    it('should allow access for authenticated users', async () => {
      const mockUser: User = { id: 1 }
      const mockContext: Context = {
        req: {} as CustomRequest,
        res: {} as Response,
        user: mockUser,
      }

      const middleware = authedProcedure._def.middlewares[0]
      const mockNext = vi.fn().mockResolvedValue({ result: 'success' })

      const result = await middleware({
        ctx: mockContext,
        next: mockNext,
        path: '',
        type: 'query',
        input: undefined,
        rawInput: undefined,
        meta: undefined,
      })

      expect(result).toEqual({ result: 'success' })
      expect(mockNext).toHaveBeenCalledWith({
        ctx: expect.objectContaining({ user: mockUser }),
      })
    })

    it('should throw UNAUTHORIZED error for unauthenticated users', async () => {
      const mockContext: Context = {
        req: {} as CustomRequest,
        res: {} as Response,
        user: null,
      }

      const middleware = authedProcedure._def.middlewares[0]
      const mockNext = vi.fn()

      await expect(async () => {
        await middleware({
          ctx: mockContext,
          next: mockNext,
          path: '',
          type: 'query',
          input: undefined,
          rawInput: undefined,
          meta: undefined,
        })
      }).rejects.toThrow(TRPCError)

      await expect(async () => {
        await middleware({
          ctx: mockContext,
          next: mockNext,
          path: '',
          type: 'query',
          input: undefined,
          rawInput: undefined,
          meta: undefined,
        })
      }).rejects.toThrow('You must be logged in to access this resource')

      expect(mockNext).not.toHaveBeenCalled()
    })
  })
})
