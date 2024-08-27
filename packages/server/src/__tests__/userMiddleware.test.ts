import { describe, it, expect, vi } from 'vitest'
import type { CustomRequest, User } from '../../src/types/customRequest'
import type { Response, NextFunction } from 'express'

function authMiddleware(req: CustomRequest, res: Response, next: NextFunction) {
  const user: User = {
    id: 1,
    email: 'test@example.com',
    username: 'testuser',
  }
  req.user = user
  next()
}

async function userProfileHandler(req: CustomRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  return res.json({
    id: req.user.id,
    email: req.user.email,
    username: req.user.username,
  })
}

describe('Middleware and Route Handler Tests', () => {
  it('should add the user object to the request via middleware', () => {
    // Mock request, response, and next function
    const req = {} as CustomRequest
    const res = {} as Response
    const next = vi.fn()

    authMiddleware(req, res, next)

    expect(req.user).toBeDefined()
    expect(req.user?.id).toBe(1)
    expect(req.user?.email).toBe('test@example.com')
    expect(req.user?.username).toBe('testuser')

    expect(next).toHaveBeenCalled()
  })

  it('should return user profile when user is present on the request', async () => {
    const req = {
      user: { id: 1, email: 'test@example.com', username: 'testuser' },
    } as CustomRequest

    const res = {
      json: vi.fn(),
    } as unknown as Response

    await userProfileHandler(req, res)

    expect(res.json).toHaveBeenCalledWith({
      id: 1,
      email: 'test@example.com',
      username: 'testuser',
    })
  })

  it('should return 401 error when user is not present on the request', async () => {
    const req = {} as CustomRequest
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response

    await userProfileHandler(req, res)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' })
  })
})
