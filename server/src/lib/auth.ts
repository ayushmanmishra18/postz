import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';

const isProduction = process.env.NODE_ENV === 'production';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

if (isProduction) {
  if (!JWT_SECRET || JWT_SECRET === 'your-super-secret-jwt-key-change-in-production') {
    throw new Error('JWT_SECRET must be set in production');
  }
  if (!JWT_REFRESH_SECRET || JWT_REFRESH_SECRET === 'your-refresh-token-secret') {
    throw new Error('JWT_REFRESH_SECRET must be set in production');
  }
}

export interface TokenPayload {
  userId: string;
  email: string;
  username: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET!, { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET!, { expiresIn: JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET!) as TokenPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET!) as TokenPayload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateResetToken(): string {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateSecureSecret(length = 64): string {
  const crypto = require('crypto');
  return crypto.randomBytes(length).toString('hex');
}