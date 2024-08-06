import { initTRPC, TRPCError } from '@trpc/server';
import type { inferAsyncReturnType } from '@trpc/server';
import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';
import type { CustomRequest, User } from './types/customRequest';
import { getUserFromToken } from './utils/tokenUtils';
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('JWT_SECRET is not set');
  throw new Error('JWT_SECRET must be set');
}

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
      console.error('Invalid authorization header format');
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid authorization header format',
      });
    }

    try {
      console.log('Attempting to verify token');
      const decoded = jwt.verify(token, JWT_SECRET!);
      console.log('Decoded token:', decoded);
      
      if (typeof decoded !== 'object' || decoded === null || !('user_id' in decoded)) {
        console.error('Invalid token payload');
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid token payload',
        });
      }
      
      user = getUserFromToken(decoded as JwtPayload) as User | null;
      if (!user) {
        console.error('User not found from token');
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not found',
        });
      }
      console.log('User authenticated:', user);
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        console.error('JWT verification error:', error.message);
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid token',
          cause: error,
        });
      }
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Unexpected error during authentication:', error);
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