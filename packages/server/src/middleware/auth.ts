import { TRPCError } from '@trpc/server'
import type { Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import type { JwtPayload } from 'jsonwebtoken'
import type { CustomRequest } from '../types/customRequest'
import { getUserFromToken } from '../utils/tokenUtils'

const { JWT_SECRET } = process.env

if (!JWT_SECRET) {
  console.error('JWT_SECRET is not set in environment variables')
  process.exit(1)
}

interface TokenPayload extends JwtPayload {
  user_id: number
}

function isTokenPayload(payload: string | JwtPayload): payload is TokenPayload {
  return typeof payload === 'object' && payload !== null && 'user_id' in payload
}

export const authenticateJWT = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token

  if (!token) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'No token provided',
    })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)

    if (!isTokenPayload(decoded)) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid token payload',
      })
    }

    const user = getUserFromToken(decoded)
    if (user) {
      req.user = user
      next()
    } else {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid user data in token',
      })
    }
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid token',
      })
    }
    throw error
  }
}
