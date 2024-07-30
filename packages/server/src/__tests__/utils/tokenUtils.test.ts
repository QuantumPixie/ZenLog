import { describe, it, expect } from 'vitest';
import { getUserFromToken } from '../../utils/tokenUtils';
import type { JwtPayload } from 'jsonwebtoken';

describe('Token Utils', () => {
  it('should extract user from valid token payload', () => {
    const payload: JwtPayload = { user_id: 1 };
    const user = getUserFromToken(payload);
    expect(user).toEqual({ id: 1 });
  });

  it('should return null for invalid token payload', () => {
    const payload: JwtPayload = {};
    const user = getUserFromToken(payload);
    expect(user).toBeNull();
  });

  it('should return null for non-object payload', () => {
    const payload = 'invalid' as unknown as JwtPayload;
    const user = getUserFromToken(payload);
    expect(user).toBeNull();
  });
});