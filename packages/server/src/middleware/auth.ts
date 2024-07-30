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
  console.log('Auth header:', authHeader);
  const token = authHeader?.split(' ')[1];
  console.log('Extracted token:', token);

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    console.log('Verifying token');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Decoded token:', decoded);

    if (!isTokenPayload(decoded)) {
      console.log('Invalid token payload');
      return res.status(403).json({ error: 'Invalid token payload' });
    }

    const user = getUserFromToken(decoded);
    console.log('User from token:', user);
    if (user) {
      req.user = user;
      next();
    } else {
      console.log('Invalid user data in token');
      return res.status(403).json({ error: 'Invalid user data in token' });
    }
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(403).json({ error: 'Invalid token' });
  }
};