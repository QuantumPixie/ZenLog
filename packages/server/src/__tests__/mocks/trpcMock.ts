import { initTRPC } from '@trpc/server';

const t = initTRPC.create();

export const router = t.router;
export const procedure = t.procedure;
export const middleware = t.middleware;
export const createCallerFactory = t.createCallerFactory;

type Context = {
    user?: {
      id: number;
    };
  };

  export const authedProcedure = t.procedure.use(
    middleware((opts) => {
      const { ctx }: { ctx: Context } = opts;
      if (!ctx.user) {
        throw new Error('Not authenticated');
      }
      return opts.next({
        ctx: {
          ...ctx,
          user: ctx.user,
        },
      });
    })
  );