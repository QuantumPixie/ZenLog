import type { Response, NextFunction } from 'express';
import type { CustomRequest } from '../types/customRequest';
import { getUserFromToken } from '../utils/tokenUtils';
import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

interface TokenPayload extends JwtPayload {
  user_id: number;
}

function isTokenPayload(payload: string | JwtPayload): payload is TokenPayload {
  return typeof payload === 'object' && payload !== null && 'user_id' in payload;
}

export const authenticateJWT = (req: CustomRequest, res: Response, next: NextFunction) => {
  const authHeader = req.header('Authorization');
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!isTokenPayload(decoded)) {
      return res.status(403).json({ error: 'Invalid token payload' });
    }

    const user = getUserFromToken(decoded);
    if (user) {
      req.user = user;
      next();
    } else {
      return res.status(403).json({ error: 'Invalid user data in token' });
    }
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};