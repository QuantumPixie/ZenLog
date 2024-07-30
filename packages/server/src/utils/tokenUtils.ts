import type { JwtPayload } from 'jsonwebtoken';

interface TokenPayload extends JwtPayload {
  user_id: number;
}

export const getUserFromToken = (decoded: JwtPayload): { id: number } | null => {
  if (typeof decoded === 'object' && 'user_id' in decoded) {
    return { id: (decoded as TokenPayload).user_id };
  }
  return null;
};
