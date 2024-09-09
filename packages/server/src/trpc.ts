import { initTRPC, TRPCError } from '@trpc/server'
import type { inferAsyncReturnType } from '@trpc/server'
import jwt from 'jsonwebtoken'
import type { JwtPayload } from 'jsonwebtoken'
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express'
import type { CustomRequest, User } from './types/customRequest'
import { getUserFromToken } from './utils/tokenUtils'

const { JWT_SECRET } = process.env
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be set')
}

export const createContext = ({
  req,
  res,
}: CreateExpressContextOptions): {
  req: CustomRequest
  res: CreateExpressContextOptions['res']
  user: User | null
} => {
  const customReq = req as CustomRequest
  const token = customReq.cookies.token
  let user: User | null = null

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload

      if (typeof decoded !== 'object' || !('user_id' in decoded)) {
        // Invalid token payload
        user = null
      } else {
        user = getUserFromToken(decoded)
      }
    } catch (error) {
      // Token is invalid or expired
      user = null
    }
  }

  return { req: customReq, res, user }
}

export type Context = inferAsyncReturnType<typeof createContext>

export const t = initTRPC.context<Context>().create()

const isAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    })
  }
  return next({ ctx: { ...ctx, user: ctx.user } })
})

export const router = t.router
export const procedure = t.procedure
export const authedProcedure = t.procedure.use(isAuthenticated)
