import {
  TRPCError,
  initTRPC,
  type AnyRouter,
  type inferRouterInputs,
  type inferRouterOutputs,
} from '@trpc/server'
import type { CustomRequest } from '../../types/customRequest.ts'

export type Context = {
  user?: {
    id: number
    email: string
    username: string
  }
  req?: CustomRequest
  res?: Response
}

export const createCallerFactory = <TRouter extends AnyRouter>(
  router: TRouter
) => {
  return (ctx: Context) =>
    router.createCaller(ctx) as ReturnType<TRouter['createCaller']>
}

export const t = initTRPC.context<Context>().create()

export const { router } = t
export const publicProcedure = t.procedure
export const { middleware } = t

export const authedProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    })
  }
  return next({ ctx: { ...ctx, user: ctx.user } })
})
export type RouterInput<TRouter extends AnyRouter> = inferRouterInputs<TRouter>
export type RouterOutput<TRouter extends AnyRouter> =
  inferRouterOutputs<TRouter>
