import { initTRPC, TRPCError } from '@trpc/server';
import type { inferAsyncReturnType } from '@trpc/server';
import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';
import type { CustomRequest, User } from './types/customRequest';
import { getUserFromToken } from './utils/tokenUtils';
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';

export const createContext = ({ 
  req,
  res,
}: CreateExpressContextOptions & { req: CustomRequest }) => {
  console.log('Creating context for request', req.url);
  const authHeader = req.header('Authorization');
  console.log('Auth header:', authHeader);
  let user: User | null = null;

  if (authHeader) {
    const token = authHeader.split(' ')[1];
    try {
      console.log('Verifying token');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as JwtPayload;
      console.log('Decoded token:', decoded);

      if (typeof decoded !== 'string' && decoded !== null) {
        console.log('Getting user from token');
        user = getUserFromToken(decoded);
        console.log('User from token:', user);
      } else {
        console.error('Decoded token is not of type JwtPayload');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
    }
  } else {
    console.log('No authorization header found');
  }
  console.log('Context created:', { user });
  return {
    req,
    res,
    user,
  };
};

export type Context = inferAsyncReturnType<typeof createContext>;

const t = initTRPC.context<Context>().create();

const isAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const router = t.router;
export const procedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthenticated);