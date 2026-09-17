import { Router } from 'express';
import Comment from '../models/Comment';
import Post from '../models/Post';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';
import { Response } from 'express';

const router = Router();

router.get('/post/:postId', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { postId } = req.params;
  const { page = 1, limit = 20, cursor } = req.query;

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new AppError('Invalid post ID', 400);
  }

  const query: any = { post: postId, parentComment: { $exists: false } };
  if (cursor) query._id = { $lt: cursor };

  const comments = await Comment.find(query)
    .populate('author', 'username displayName avatar isVerified')
    .sort({ createdAt: 1 })
    .limit(Number(limit) + 1)
    .lean();

  const hasNextPage = comments.length > Number(limit);
  const items = hasNextPage ? comments.slice(0, -1) : comments;

  res.json({
    success: true,
    data: {
      items: items.map(c => ({ ...c, isLiked: c.likes?.includes(req.user._id) })),
      page: Number(page),
      limit: Number(limit),
      total: await Comment.countDocuments(query),
      totalPages: 0,
      hasNextPage,
      hasPrevPage: Number(page) > 1,
    },
  });
}));

router.post('/post/:postId', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { postId } = req.params;
  const { content, parentCommentId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new AppError('Invalid post ID', 400);
  }
  if (!content?.trim()) {
    throw new AppError('Comment cannot be empty', 400);
  }

  const post = await Post.findById(postId);
  if (!post) throw new AppError('Post not found', 404);

  let parentComment = null;
  if (parentCommentId) {
    if (!mongoose.Types.ObjectId.isValid(parentCommentId)) {
      throw new AppError('Invalid parent comment ID', 400);
    }
    parentComment = await Comment.findById(parentCommentId);
    if (!parentComment) throw new AppError('Parent comment not found', 404);
  }

  const comment = await Comment.create({
    post: postId,
    author: req.user._id,
    content: content.trim(),
    parentComment: parentCommentId,
  });

  post.commentsCount += 1;
  await post.save();

  if (parentComment) {
    parentComment.repliesCount += 1;
    await parentComment.save();
  }

  const populatedComment = await Comment.findById(comment._id)
    .populate('author', 'username displayName avatar isVerified')
    .lean();

  (req as any).io?.emit('comment:created', populatedComment);

  if (post.author.toString() !== req.user._id.toString()) {
    (req as any).io?.to(post.author.toString()).emit('notification:created', {
      type: 'comment',
      actor: req.user,
      post: postId,
      comment: comment._id,
    });
  }

  res.status(201).json({ success: true, data: populatedComment, message: 'Comment added' });
}));

router.get('/:id/replies', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError('Invalid comment ID', 400);
  const parent = await Comment.findById(id).select('_id');
  if (!parent) throw new AppError('Comment not found', 404);
  const total = await Comment.countDocuments({ parentComment: id });
  const items = await Comment.find({ parentComment: id })
    .populate('author', 'username displayName avatar isVerified')
    .sort({ createdAt: 1 }).skip((page - 1) * limit).limit(limit).lean();
  const totalPages = Math.ceil(total / limit);
  res.json({ success: true, data: { items, page, limit, total, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 } });
}));

router.patch('/:id', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new AppError('Invalid comment ID', 400);
  }

  const comment = await Comment.findById(req.params.id);
  if (!comment) throw new AppError('Comment not found', 404);
  if (comment.author.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized', 403);
  }

  comment.content = req.body.content?.trim() || comment.content;
  await comment.save();

  const populatedComment = await Comment.findById(comment._id)
    .populate('author', 'username displayName avatar isVerified')
    .lean();

  (req as any).io?.emit('comment:updated', populatedComment);

  res.json({ success: true, data: populatedComment, message: 'Comment updated' });
}));

router.delete('/:id', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new AppError('Invalid comment ID', 400);
  }

  const comment = await Comment.findById(req.params.id);
  if (!comment) throw new AppError('Comment not found', 404);
  if (comment.author.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized', 403);
  }

  await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } });

  if (comment.parentComment) {
    await Comment.findByIdAndUpdate(comment.parentComment, { $inc: { repliesCount: -1 } });
  }

  await comment.deleteOne();

  (req as any).io?.emit('comment:deleted', req.params.id);

  res.json({ success: true, message: 'Comment deleted' });
}));

router.post('/:id/like', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new AppError('Invalid comment ID', 400);
  }

  const comment = await Comment.findById(req.params.id);
  if (!comment) throw new AppError('Comment not found', 404);

  const isLiked = comment.likes?.includes(req.user._id);
  if (isLiked) {
    comment.likes = comment.likes.filter((id: any) => id.toString() !== req.user._id.toString());
    comment.likesCount = Math.max(0, comment.likesCount - 1);
  } else {
    if (!comment.likes) comment.likes = [];
    comment.likes.push(req.user._id);
    comment.likesCount += 1;
  }

  await comment.save();

  res.json({
    success: true,
    data: { likesCount: comment.likesCount, isLiked: !isLiked },
  });
}));

router.delete('/:id/like', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new AppError('Invalid comment ID', 400);
  }

  const comment = await Comment.findById(req.params.id);
  if (!comment) throw new AppError('Comment not found', 404);

  const isLiked = comment.likes?.includes(req.user._id);
  if (!isLiked) {
    throw new AppError('Comment not liked', 400);
  }

  comment.likes = comment.likes.filter((id: any) => id.toString() !== req.user._id.toString());
  comment.likesCount = Math.max(0, comment.likesCount - 1);
  await comment.save();

  res.json({
    success: true,
    data: { likesCount: comment.likesCount, isLiked: false },
  });
}));

router.get('/:commentId/replies', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  const { commentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new AppError('Invalid comment ID', 400);
  }

  const replies = await Comment.find({ parentComment: commentId })
    .populate('author', 'username displayName avatar isVerified')
    .sort({ createdAt: 1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .lean();

  res.json({
    success: true,
    data: {
      items: replies.map(c => ({ ...c, isLiked: c.likes?.includes(req.user._id) })),
      page: Number(page),
      limit: Number(limit),
      total: await Comment.countDocuments({ parentComment: commentId }),
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: Number(page) > 1,
    },
  });
}));

export default router;
