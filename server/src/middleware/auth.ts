import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../lib/auth';
import User from '../models/User';

export interface AuthRequest extends Request {
  user?: any;
  io?: any;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    if (!decoded) throw new Error('Invalid token');

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);
      if (!decoded) throw new Error('Invalid token');
      const user = await User.findById(decoded.userId).select('-password');
      if (user) req.user = user;
    }
    next();
  } catch {
    next();
  }
};