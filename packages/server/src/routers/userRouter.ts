import { router, procedure, protectedProcedure } from '../trpc';
import { createUser, loginUser, changePassword, getUserById } from '../services/userService';
import { signupSchema, loginSchema, changePasswordSchema, getUserByIdSchema } from '../schemas/userSchema';
import bcrypt from 'bcrypt';
import { TRPCError } from '@trpc/server';

export const userRouter = router({
  signup: procedure
    .input(signupSchema)
    .mutation(async ({ input }) => {
      console.log('Signup procedure called with input:', input);
      const { email, username, password } = input;
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = { email, username, password: hashedPassword };
      console.log('Signup procedure completed');

      try {
        const user = await createUser(newUser);
        return { user_id: user.id };
      } catch (error) {
        throw new TRPCError({ 
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to register user'
        });
      }
    }),

    login: procedure
    .input(loginSchema)
    .mutation(async ({ input }) => {
      const { email, password } = input;
      try {
        const result = await loginUser(email, password);
        if (result) {
          return result;
        } else {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Invalid credentials'
          });
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw new TRPCError({
            code: error.code,
            message: error.message
          });
        }
      }
    }),

  changePassword: protectedProcedure
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

  getUser: protectedProcedure
    .input(getUserByIdSchema)
    .query(async ({ input }) => {
      const user = await getUserById(input.id);
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