import { Router } from 'express';
import Notification from '../models/Notification';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';
import { Response } from 'express';

const router = Router();

router.get('/', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 20, unreadOnly } = req.query;
  const query: any = { user: req.user._id };
  if (unreadOnly === 'true') query.isRead = false;

  const notifications = await Notification.find(query)
    .populate('actor', 'username displayName avatar isVerified')
    .populate('post', 'content images author')
    .populate('comment', 'content author')
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .lean();

  const total = await Notification.countDocuments(query);

  res.json({
    success: true,
    data: {
      items: notifications,
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
      hasNextPage: Number(page) < Math.ceil(total / Number(limit)),
      hasPrevPage: Number(page) > 1,
    },
  });
}));

router.get('/unread-count', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  const count = await Notification.countDocuments({ user: req.user._id, isRead: false });
  res.json({ success: true, data: { count } });
}));

router.patch('/:id/read', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new AppError('Invalid notification ID', 400);
  }

  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true },
    { new: true }
  );

  if (!notification) throw new AppError('Notification not found', 404);

  res.json({ success: true, data: notification });
}));

router.patch('/read-all', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  await Notification.updateMany(
    { user: req.user._id, isRead: false },
    { isRead: true }
  );

  res.json({ success: true, message: 'All notifications marked as read' });
}));

router.delete('/:id', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new AppError('Invalid notification ID', 400);
  }

  const notification = await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!notification) throw new AppError('Notification not found', 404);

  res.json({ success: true, message: 'Notification deleted' });
}));

export default router;
