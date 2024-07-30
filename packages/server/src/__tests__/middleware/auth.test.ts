import { describe, it, expect, vi } from 'vitest';
import type { Mock } from 'vitest';
import { authenticateJWT } from '../../middleware/auth';
import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import type { CustomRequest } from '../../types/customRequest';

vi.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  it('should add user to request if token is valid', () => {
    const req = {
      header: vi.fn().mockReturnValue('Bearer validtoken'),
      user: undefined
    } as unknown as CustomRequest;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    (jwt.verify as Mock).mockReturnValue({ user_id: 1 });

    authenticateJWT(req, res, next);

    expect(req.user).toEqual({ id: 1 });
    expect(next).toHaveBeenCalled();
  });
  it('should return 401 if no token is provided', () => {
    const req = {
      header: vi.fn().mockReturnValue(undefined),
    } as unknown as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    } as unknown as Response;
    const next = vi.fn() as NextFunction;

    authenticateJWT(req as CustomRequest, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
  });

  it('should return 403 if token is invalid', () => {
    const req = {
      header: vi.fn().mockReturnValue('Bearer invalidtoken'),
    } as unknown as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    } as unknown as Response;
    const next = vi.fn() as NextFunction;

    (jwt.verify as Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    authenticateJWT(req as CustomRequest, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
  });
});