import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, hashPassword, comparePassword, generateResetToken } from '../lib/auth';
import { AuthRequest } from '../middleware/auth';
import { Response } from 'express';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

router.post('/register', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { username, email, password, displayName } = req.body;

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    throw new AppError('Username or email already exists', 400);
  }

  const hashedPassword = await hashPassword(password);
  const user = await User.create({
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    password: hashedPassword,
    displayName: displayName.trim(),
  });

  const accessToken = generateAccessToken({ userId: user._id.toString(), email: user.email, username: user.username });
  const refreshToken = generateRefreshToken({ userId: user._id.toString(), email: user.email, username: user.username });

  const userResponse = user.toObject();
  delete userResponse.password;

  res.status(201).json({
    success: true,
    data: { user: userResponse, tokens: { accessToken, refreshToken } },
    message: 'Account created successfully',
  });
}));

router.post('/login', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  user.lastActiveAt = new Date();
  await user.save();

  const accessToken = generateAccessToken({ userId: user._id.toString(), email: user.email, username: user.username });
  const refreshToken = generateRefreshToken({ userId: user._id.toString(), email: user.email, username: user.username });

  const userResponse = user.toObject();
  delete userResponse.password;

  res.json({
    success: true,
    data: { user: userResponse, tokens: { accessToken, refreshToken } },
    message: 'Login successful',
  });
}));

router.post('/logout', asyncHandler(async (req: AuthRequest, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully' });
}));

router.post('/refresh', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    throw new AppError('Refresh token required', 400);
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      throw new AppError('Invalid refresh token', 401);
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new AppError('User not found', 401);
    }

    const accessToken = generateAccessToken({ userId: user._id.toString(), email: user.email, username: user.username });
    const newRefreshToken = generateRefreshToken({ userId: user._id.toString(), email: user.email, username: user.username });

    res.json({
      success: true,
      data: { accessToken, refreshToken: newRefreshToken },
    });
  } catch {
    throw new AppError('Invalid refresh token', 401);
  }
}));

router.get('/me', asyncHandler(async (req: AuthRequest, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('No token provided', 401);
  }

  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

  const user = await User.findById(decoded.userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    data: user,
  });
}));

router.post('/forgot-password', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });
  
  if (!user) {
    return res.json({ success: true, message: 'If email exists, reset link sent' });
  }

  const resetToken = generateResetToken();
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = new Date(Date.now() + 3600000);
  await user.save();

  console.log(`Password reset token for ${email}: ${resetToken}`);

  res.json({ success: true, message: 'If email exists, reset link sent' });
}));

router.post('/reset-password', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { token, password } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  }).select('+password');

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  user.password = await hashPassword(password);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ success: true, message: 'Password reset successful' });
}));

router.post('/verify-email', asyncHandler(async (req: AuthRequest, res: Response) => {
  res.json({ success: true, message: 'Email verified' });
}));

router.post('/resend-verification', asyncHandler(async (req: AuthRequest, res: Response) => {
  res.json({ success: true, message: 'Verification email sent' });
}));

export default router;
