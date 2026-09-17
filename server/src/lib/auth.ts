import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';

const getJwtSecret = () => process.env.JWT_SECRET || 'your-secret-key';
const getRefreshSecret = () => process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';

function assertProductionSecrets() {
  if (process.env.NODE_ENV !== 'production') return;
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-in-production' || process.env.JWT_SECRET === 'your-secret-key') {
    throw new Error('JWT_SECRET must be set in production');
  }
  if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET === 'your-refresh-token-secret' || process.env.JWT_REFRESH_SECRET === 'your-refresh-secret') {
    throw new Error('JWT_REFRESH_SECRET must be set in production');
  }
}

export interface TokenPayload {
  userId: string;
  email: string;
  username: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  assertProductionSecrets();
  return jwt.sign(payload, getJwtSecret(), { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'] });
}

export function generateRefreshToken(payload: TokenPayload): string {
  assertProductionSecrets();
  return jwt.sign(payload, getRefreshSecret(), { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '30d') as jwt.SignOptions['expiresIn'] });
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as TokenPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, getRefreshSecret()) as TokenPayload;
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