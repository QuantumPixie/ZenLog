import { router, procedure, authedProcedure } from '../trpc';
import { signupSchema, loginSchema, changePasswordSchema } from '../schemas/userSchema';
import { changePassword, createUser, getUserById, loginUser } from '../services/userService';
import { TRPCError } from '@trpc/server';

  export const userRouter = router({
    signup: procedure
      .input(signupSchema)
      .mutation(async ({ input }) => {
        try {
          const user = await createUser(input);
          return { user };
        } catch (error) {
          console.error('Error in signup:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to register user',
            cause: error
          });
        }
      }),

    login: procedure
      .input(loginSchema)
      .mutation(async ({ input }) => {
        try {
          const result = await loginUser(input.email, input.password);
          if (!result) {
            throw new TRPCError({
              code: 'UNAUTHORIZED',
              message: 'Invalid credentials'
            });
          }
          return result;
        } catch (error) {
          console.error('Error in login:', error);
          if (error instanceof TRPCError) {
            throw error;
          }
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred'
          });
        }
      }),

  changePassword: authedProcedure
    .input(changePasswordSchema)
    .mutation(async ({ ctx, input }) => {
      const { oldPassword, newPassword } = input;

      try {
        const success = await changePassword(ctx.user.id, oldPassword, newPassword);
        if (success) {
          return { message: 'Password changed successfully' };
        } else {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Failed to change password'
          });
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to change password'
        });
      }
    }),

    getUser: authedProcedure
    .query(async ({ ctx }) => {
      const user = await getUserById(ctx.user.id);
      if (user) {
        return user;
      } else {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found'
        });
      }
    }),
});