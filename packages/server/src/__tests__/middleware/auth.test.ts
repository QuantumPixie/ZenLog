import { describe, it, expect, vi, beforeEach } from 'vitest'
import jwt from 'jsonwebtoken'
import { TRPCError } from '@trpc/server'
import { authenticateJWT } from '../../middleware/auth'
import type { CustomRequest, User } from '../../types/customRequest'
import type { Response, NextFunction } from 'express'
import * as tokenUtils from '../../utils/tokenUtils'
import type { JwtPayload } from 'jsonwebtoken'

vi.mock('jsonwebtoken')
vi.mock('../../utils/tokenUtils')

describe('Authentication Middleware', () => {
  let req: CustomRequest
  let res: Response
  let next: NextFunction

  beforeEach(() => {
    req = {
      header: vi.fn(),
    } as unknown as CustomRequest
    res = {} as Response
    next = vi.fn()
    vi.resetAllMocks()
    process.env.JWT_SECRET = 'test-secret'
  })

  it('should throw an error if no token is provided', () => {
    req.header = vi.fn().mockReturnValue(undefined)

    expect(() => authenticateJWT(req, res, next)).toThrow(TRPCError)
    expect(() => authenticateJWT(req, res, next)).toThrow('No token provided')
  })

  it('should throw an error if the token is invalid', () => {
    req.header = vi.fn().mockReturnValue('Bearer invalid-token')
    vi.mocked(jwt.verify).mockImplementation(() => {
      throw new jwt.JsonWebTokenError('invalid token')
    })

    expect(() => authenticateJWT(req, res, next)).toThrow(TRPCError)
    expect(() => authenticateJWT(req, res, next)).toThrow('Invalid token')
  })

  it('should throw an error if the token payload is invalid', () => {
    req.header = vi.fn().mockReturnValue('Bearer valid-token')
    vi.mocked(jwt.verify).mockImplementation(() => ({}) as JwtPayload)

    expect(() => authenticateJWT(req, res, next)).toThrow(TRPCError)
    expect(() => authenticateJWT(req, res, next)).toThrow(
      'Invalid token payload'
    )
  })

  it('should throw an error if user data in token is invalid', () => {
    req.header = vi.fn().mockReturnValue('Bearer valid-token')
    vi.mocked(jwt.verify).mockImplementation(
      () => ({ user_id: 1 }) as JwtPayload
    )
    vi.mocked(tokenUtils.getUserFromToken).mockReturnValue(null)

    expect(() => authenticateJWT(req, res, next)).toThrow(TRPCError)
    expect(() => authenticateJWT(req, res, next)).toThrow(
      'Invalid user data in token'
    )
  })

  it('should set user on request and call next for valid token', () => {
    const mockUser: User = {
      id: 1,
      email: 'test@example.com',
      username: 'testuser',
    }
    req.header = vi.fn().mockReturnValue('Bearer valid-token')
    vi.mocked(jwt.verify).mockImplementation(
      () => ({ user_id: 1 }) as JwtPayload
    )
    vi.mocked(tokenUtils.getUserFromToken).mockReturnValue(mockUser)

    authenticateJWT(req, res, next)

    expect(req.user).toEqual(mockUser)
    expect(next).toHaveBeenCalled()
  })
})
