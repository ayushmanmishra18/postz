import { Router } from 'express';
import User from '../models/User';
import Post from '../models/Post';
import Comment from '../models/Comment';
import Notification from '../models/Notification';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import mongoose from 'mongoose';
import { Response } from 'express';

const router = Router();

router.get('/me', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new AppError('User not found', 404);
  res.json({ success: true, data: user });
}));

router.get('/id/:userId', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
    throw new AppError('Invalid user ID', 400);
  }
  const user = await User.findById(req.params.userId);
  if (!user) throw new AppError('User not found', 404);
  res.json({ success: true, data: user });
}));

router.patch('/me', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { displayName, bio, location, website, birthDate, isPrivate } = req.body;
  const updates: any = {};

  if (displayName !== undefined) updates.displayName = displayName.trim();
  if (bio !== undefined) updates.bio = bio.trim().slice(0, 160);
  if (location !== undefined) updates.location = location.trim();
  if (website !== undefined) updates.website = website.trim();
  if (birthDate !== undefined) updates.birthDate = birthDate ? new Date(birthDate) : null;
  if (isPrivate !== undefined) updates.isPrivate = isPrivate;

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  res.json({ success: true, data: user, message: 'Profile updated' });
}));

router.post('/me/avatar', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.body.avatar) throw new AppError('Avatar URL required', 400);
  const user = await User.findByIdAndUpdate(req.user._id, { avatar: req.body.avatar }, { new: true });
  res.json({ success: true, data: { avatar: user?.avatar || req.body.avatar } });
}));

router.post('/me/cover', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.body.coverImage) throw new AppError('Cover image URL required', 400);
  const user = await User.findByIdAndUpdate(req.user._id, { coverImage: req.body.coverImage }, { new: true });
  res.json({ success: true, data: { coverImage: user?.coverImage || req.body.coverImage } });
}));

router.post('/:userId/follow', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  const targetUserId = req.params.userId;
  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    throw new AppError('Invalid user ID', 400);
  }
  if (targetUserId === req.user._id.toString()) {
    throw new AppError('Cannot follow yourself', 400);
  }

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) throw new AppError('User not found', 404);

  const currentUser = await User.findById(req.user._id);
  const isFollowing = currentUser.following?.includes(targetUserId);

  if (isFollowing) {
    currentUser.following = currentUser.following.filter((id: any) => id.toString() !== targetUserId);
    targetUser.followers = (targetUser.followers || []).filter((id: any) => id.toString() !== req.user._id.toString());
    currentUser.followingCount = Math.max(0, currentUser.followingCount - 1);
    targetUser.followersCount = Math.max(0, targetUser.followersCount - 1);
  } else {
    if (!currentUser.following) currentUser.following = [];
    if (!targetUser.followers) targetUser.followers = [];
    currentUser.following.push(targetUserId);
    targetUser.followers.push(req.user._id);
    currentUser.followingCount += 1;
    targetUser.followersCount += 1;
  }

  await Promise.all([currentUser.save(), targetUser.save()]);

  if (!isFollowing) {
    const notification = await Notification.create({ user: targetUserId, type: 'follow', actor: req.user._id });
    req.io?.to(targetUserId).emit('notification:created', notification);
  }

  req.io?.to(targetUserId).emit('user:followed', {
    followerId: req.user._id,
    followingId: targetUserId,
  });

  res.json({
    success: true,
    data: {
      isFollowing: !isFollowing,
      followersCount: targetUser.followersCount,
    },
  });
}));

router.delete('/:userId/follow', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  const targetUserId = req.params.userId;
  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    throw new AppError('Invalid user ID', 400);
  }
  if (targetUserId === req.user._id.toString()) {
    throw new AppError('Cannot unfollow yourself', 400);
  }

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) throw new AppError('User not found', 404);

  const currentUser = await User.findById(req.user._id);
  const isFollowing = currentUser.following?.includes(targetUserId);

  if (!isFollowing) {
    throw new AppError('Not following this user', 400);
  }

  currentUser.following = currentUser.following.filter((id: any) => id.toString() !== targetUserId);
  currentUser.followingCount = Math.max(0, currentUser.followingCount - 1);
  targetUser.followersCount = Math.max(0, targetUser.followersCount - 1);

  await Promise.all([currentUser.save(), targetUser.save()]);

  req.io?.to(targetUserId).emit('user:unfollowed', {
    followerId: req.user._id,
    followingId: targetUserId,
  });

  res.json({
    success: true,
    data: {
      isFollowing: false,
      followersCount: targetUser.followersCount,
    },
  });
}));

router.get('/:userId/followers', asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  if (!mongoose.Types.ObjectId.isValid(req.params.userId)) throw new AppError('Invalid user ID', 400);
  const user = await User.findById(req.params.userId).select('followersCount');
  if (!user) throw new AppError('User not found', 404);
  const items = await User.find({ followers: req.params.userId })
    .select('username displayName avatar bio isVerified followersCount followingCount lastActiveAt')
    .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean();
  const total = user.followersCount;
  const totalPages = Math.ceil(total / limit);
  res.json({ success: true, data: { items, page, limit, total, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 } });
}));

router.get('/:userId/following', asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  if (!mongoose.Types.ObjectId.isValid(req.params.userId)) throw new AppError('Invalid user ID', 400);
  const user = await User.findById(req.params.userId).select('followingCount');
  if (!user) throw new AppError('User not found', 404);
  const items = await User.find({ _id: { $in: user.following || [] } })
    .select('username displayName avatar bio isVerified followersCount followingCount lastActiveAt')
    .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean();
  const total = user.followingCount;
  const totalPages = Math.ceil(total / limit);
  res.json({ success: true, data: { items, page, limit, total, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 } });
}));

router.get('/search', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { query, page = 1, limit = 20 } = req.query;
  if (!query || (query as string).length < 2) {
    throw new AppError('Query must be at least 2 characters', 400);
  }

  const users = await User.find({
    $text: { $search: query },
    _id: { $ne: req.user?._id },
  })
    .select('username displayName avatar bio isVerified followersCount')
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .lean();

  res.json({
    success: true,
    data: {
      items: users,
      page: Number(page),
      limit: Number(limit),
      total: users.length,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: Number(page) > 1,
    },
  });
}));

router.get('/suggestions', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  const currentUser = await User.findById(req.user._id);
  const following = currentUser.following || [];

  const suggestions = await User.find({
    _id: { $nin: [...following, req.user._id] },
  })
    .select('username displayName avatar bio isVerified followersCount')
    .sort({ followersCount: -1, createdAt: -1 })
    .limit(10)
    .lean();

  res.json({ success: true, data: suggestions });
}));

router.get('/check-username/:username', asyncHandler(async (req: AuthRequest, res: Response) => {
  const username = req.params.username.toLowerCase();
  if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
    return res.json({ success: true, data: { available: false } });
  }

  const user = await User.findOne({ username });
  res.json({ success: true, data: { available: !user } });
}));

router.get('/:username', asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findOne({ username: req.params.username.toLowerCase() });
  if (!user) throw new AppError('User not found', 404);

  const isFollowing = req.user ? await User.findOne({
    _id: req.user._id,
    following: user._id
  }) : false;

  res.json({ success: true, data: { ...user.toObject(), isFollowing: !!isFollowing } });
}));

export default router;