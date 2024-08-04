import { initTRPC, TRPCError } from '@trpc/server';
import type { inferAsyncReturnType } from '@trpc/server';
import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';
import type { CustomRequest, User } from './types/customRequest';
import { getUserFromToken } from './utils/tokenUtils';
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

export const createContext = ({
  req,
  res,
}: CreateExpressContextOptions): { req: CustomRequest; res: CreateExpressContextOptions['res']; user: User | null } => {
  const customReq = req as CustomRequest;
  const authHeader = customReq.header ? customReq.header('Authorization') : null;
  let user: User | null = null;

  if (authHeader) {
    const [bearer, token] = authHeader.split(' ');
    
    if (bearer !== 'Bearer' || !token) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid authorization header format',
      });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (typeof decoded !== 'object' || decoded === null || !('user_id' in decoded)) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid token payload',
        });
      }
      user = getUserFromToken(decoded as JwtPayload) as User | null;
      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not found',
        });
      }
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid token',
          cause: error,
        });
      }
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Authentication failed',
        cause: error,
      });
    }
  }

  return { req: customReq, res, user };
};

export type Context = inferAsyncReturnType<typeof createContext>;

export const t = initTRPC.context<Context>().create();

const isAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ 
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const router = t.router;
export const procedure = t.procedure;
export const authedProcedure = t.procedure.use(isAuthenticated);