import { describe, it, expect } from 'vitest'
import {
  userSchema,
  signupSchema,
  loginSchema,
  changePasswordSchema,
  getUserByIdSchema,
} from '../../schemas/userSchema'

describe('User Schema Validation', () => {
  it('should validate a correct user schema', () => {
    const validUser = {
      id: 1,
      email: 'test@example.com',
      password: 'password123',
      username: 'testuser',
    }

    expect(() => userSchema.parse(validUser)).not.toThrow()
  })

  it('should fail validation if the email is invalid', () => {
    const invalidUser = {
      id: 1,
      email: 'not-an-email',
      password: 'password123',
      username: 'testuser',
    }

    expect(() => userSchema.parse(invalidUser)).toThrowError('Invalid email')
  })

  it('should fail validation if the password is too short or too long', () => {
    const tooShortPasswordUser = {
      id: 1,
      email: 'test@example.com',
      password: 'short',
      username: 'testuser',
    }

    const tooLongPasswordUser = {
      id: 1,
      email: 'test@example.com',
      password: 'a'.repeat(65),
      username: 'testuser',
    }

    expect(() => userSchema.parse(tooShortPasswordUser)).toThrowError(
      'Password must be at least 8 characters long'
    )
    expect(() => userSchema.parse(tooLongPasswordUser)).toThrowError(
      'Password must be at most 64 characters long'
    )
  })

  it('should fail validation if the username is too short or too long', () => {
    const tooShortUsernameUser = {
      id: 1,
      email: 'test@example.com',
      password: 'password123',
      username: 'ab',
    }

    const tooLongUsernameUser = {
      id: 1,
      email: 'test@example.com',
      password: 'password123',
      username: 'a'.repeat(51),
    }

    expect(() => userSchema.parse(tooShortUsernameUser)).toThrowError()
    expect(() => userSchema.parse(tooLongUsernameUser)).toThrowError()
  })

  it('should validate a correct signup schema', () => {
    const validSignup = {
      email: 'test@example.com',
      password: 'password123',
      username: 'testuser',
    }

    expect(() => signupSchema.parse(validSignup)).not.toThrow()
  })

  it('should validate a correct login schema', () => {
    const validLogin = {
      email: 'test@example.com',
      password: 'password123',
    }

    expect(() => loginSchema.parse(validLogin)).not.toThrow()
  })

  it('should fail validation if login data is invalid', () => {
    const invalidLogin = {
      email: 'not-an-email',
      password: 'short',
    }

    expect(() => loginSchema.parse(invalidLogin)).toThrowError()
  })

  it('should validate a correct change password schema', () => {
    const validChangePassword = {
      oldPassword: 'oldpassword123',
      newPassword: 'newpassword123',
    }

    expect(() => changePasswordSchema.parse(validChangePassword)).not.toThrow()
  })

  it('should fail validation if change password data is invalid', () => {
    const invalidChangePassword = {
      oldPassword: 'short',
      newPassword: 'short',
    }

    expect(() =>
      changePasswordSchema.parse(invalidChangePassword)
    ).toThrowError()
  })

  it('should validate a correct getUserById schema', () => {
    const validGetUserById = {
      id: 1,
      email: 'test@example.com',
      username: 'testuser',
    }

    expect(() => getUserByIdSchema.parse(validGetUserById)).not.toThrow()
  })

  it('should fail validation if getUserById data is invalid', () => {
    const invalidGetUserById = {
      id: 'not-a-number',
      email: 'invalid-email',
      username: 'testuser',
    }

    expect(() => getUserByIdSchema.parse(invalidGetUserById)).toThrowError()
  })
})
