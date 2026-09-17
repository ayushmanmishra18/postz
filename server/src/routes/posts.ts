import { Router } from 'express';
import Post from '../models/Post';
import User from '../models/User';
import Notification from '../models/Notification';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';
import { Response } from 'express';

const router = Router();

router.get('/feed', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10, cursor } = req.query;
  const currentUser = await User.findById(req.user._id);
  const following = currentUser.following || [];

  const query: any = {
    author: { $in: [...following, req.user._id] },
    visibility: 'public',
  };

  if (cursor) {
    query._id = { $lt: cursor };
  }

  const posts = await Post.find(query)
    .populate('author', 'username displayName avatar isVerified')
    .populate('originalPost', 'content author images')
    .sort({ createdAt: -1 })
    .limit(Number(limit) + 1)
    .lean();

  const hasNextPage = posts.length > Number(limit);
  const items = hasNextPage ? posts.slice(0, -1) : posts;

  const enrichedPosts = items.map(post => ({
    ...post,
    isLiked: post.likes?.includes(req.user._id) || false,
    isSaved: post.saves?.includes(req.user._id) || false,
  }));

  res.json({
    success: true,
    data: {
      items: enrichedPosts,
      page: Number(page),
      limit: Number(limit),
      total: await Post.countDocuments(query),
      totalPages: 0,
      hasNextPage,
      hasPrevPage: Number(page) > 1,
    },
  });
}));

router.get('/:id', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new AppError('Invalid post ID', 400);
  }

  const post = await Post.findById(req.params.id)
    .populate('author', 'username displayName avatar isVerified')
    .populate('originalPost', 'content author images')
    .lean();

  if (!post) throw new AppError('Post not found', 404);

  if (post.visibility === 'private' && post.author._id.toString() !== req.user._id.toString()) {
    throw new AppError('Post not found', 404);
  }

  res.json({
    success: true,
    data: {
      ...post,
      isLiked: post.likes?.includes(req.user._id) || false,
      isSaved: post.saves?.includes(req.user._id) || false,
    },
  });
}));

router.post('/', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { content, images = [], visibility = 'public', originalPostId } = req.body;

  if (!content?.trim() && images.length === 0) {
    throw new AppError('Post must have content or images', 400);
  }

  const postData: any = {
    author: req.user._id,
    content: content?.trim(),
    images,
    visibility,
  };

  if (originalPostId) {
    if (!mongoose.Types.ObjectId.isValid(originalPostId)) {
      throw new AppError('Invalid original post ID', 400);
    }
    const originalPost = await Post.findById(originalPostId);
    if (!originalPost) throw new AppError('Original post not found', 404);
    postData.originalPost = originalPostId;
    postData.isRepost = true;
  }

  const post = await Post.create(postData);
  await User.findByIdAndUpdate(req.user._id, { $inc: { postsCount: 1 } });

  const populatedPost = await Post.findById(post._id)
    .populate('author', 'username displayName avatar isVerified')
    .lean();

  (req as any).io?.emit('post:created', populatedPost);

  res.status(201).json({
    success: true,
    data: populatedPost,
    message: 'Post created',
  });
}));

router.patch('/:id', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new AppError('Invalid post ID', 400);
  }

  const post = await Post.findById(req.params.id);
  if (!post) throw new AppError('Post not found', 404);
  if (post.author.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized', 403);
  }

  post.content = req.body.content?.trim() || post.content;
  await post.save();

  const populatedPost = await Post.findById(post._id)
    .populate('author', 'username displayName avatar isVerified')
    .lean();

  (req as any).io?.emit('post:updated', populatedPost);

  res.json({ success: true, data: populatedPost, message: 'Post updated' });
}));

router.delete('/:id', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new AppError('Invalid post ID', 400);
  }

  const post = await Post.findById(req.params.id);
  if (!post) throw new AppError('Post not found', 404);
  if (post.author.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized', 403);
  }

  await post.deleteOne();
  await User.findByIdAndUpdate(req.user._id, { $inc: { postsCount: -1 } });

  (req as any).io?.emit('post:deleted', req.params.id);

  res.json({ success: true, message: 'Post deleted' });
}));

router.post('/:id/like', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new AppError('Invalid post ID', 400);
  }

  const post = await Post.findById(req.params.id);
  if (!post) throw new AppError('Post not found', 404);

  const isLiked = post.likes?.includes(req.user._id);
  if (isLiked) {
    post.likes = post.likes.filter((id: any) => id.toString() !== req.user._id.toString());
    post.likesCount = Math.max(0, post.likesCount - 1);
  } else {
    if (!post.likes) post.likes = [];
    post.likes.push(req.user._id);
    post.likesCount += 1;
  }

  await post.save();

  if (!isLiked && post.author.toString() !== req.user._id.toString()) {
    const notification = await Notification.create({ user: post.author, type: 'like', actor: req.user._id, post: post._id });
    (req as any).io?.to(post.author.toString()).emit('notification:created', notification);
  }

  (req as any).io?.emit('post:liked', {
    postId: post._id,
    userId: req.user._id,
    likesCount: post.likesCount,
  });

  res.json({
    success: true,
    data: { likesCount: post.likesCount, isLiked: !isLiked },
  });
}));

router.delete('/:id/like', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new AppError('Invalid post ID', 400);
  }

  const post = await Post.findById(req.params.id);
  if (!post) throw new AppError('Post not found', 404);

  const isLiked = post.likes?.includes(req.user._id);
  if (!isLiked) {
    throw new AppError('Post not liked', 400);
  }

  post.likes = post.likes.filter((id: any) => id.toString() !== req.user._id.toString());
  post.likesCount = Math.max(0, post.likesCount - 1);
  await post.save();

  (req as any).io?.emit('post:unliked', {
    postId: post._id,
    userId: req.user._id,
    likesCount: post.likesCount,
  });

  res.json({
    success: true,
    data: { likesCount: post.likesCount, isLiked: false },
  });
}));

router.post('/:id/save', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new AppError('Invalid post ID', 400);
  }

  const post = await Post.findById(req.params.id);
  if (!post) throw new AppError('Post not found', 404);

  const isSaved = post.saves?.includes(req.user._id);
  if (isSaved) {
    post.saves = post.saves.filter((id: any) => id.toString() !== req.user._id.toString());
    post.savesCount = Math.max(0, post.savesCount - 1);
  } else {
    if (!post.saves) post.saves = [];
    post.saves.push(req.user._id);
    post.savesCount += 1;
  }

  await post.save();

  (req as any).io?.emit(post.saves?.includes(req.user._id) ? 'post:saved' : 'post:unsaved', {
    postId: post._id,
    userId: req.user._id,
    savesCount: post.savesCount,
  });

  res.json({
    success: true,
    data: { savesCount: post.savesCount, isSaved: !isSaved },
  });
}));

router.delete('/:id/save', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new AppError('Invalid post ID', 400);
  }

  const post = await Post.findById(req.params.id);
  if (!post) throw new AppError('Post not found', 404);

  const isSaved = post.saves?.includes(req.user._id);
  if (!isSaved) {
    throw new AppError('Post not saved', 400);
  }

  post.saves = post.saves.filter((id: any) => id.toString() !== req.user._id.toString());
  post.savesCount = Math.max(0, post.savesCount - 1);
  await post.save();

  (req as any).io?.emit('post:unsaved', {
    postId: post._id,
    userId: req.user._id,
    savesCount: post.savesCount,
  });

  res.json({
    success: true,
    data: { savesCount: post.savesCount, isSaved: false },
  });
}));

router.post('/:id/repost', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new AppError('Invalid post ID', 400);
  }

  const originalPost = await Post.findById(req.params.id);
  if (!originalPost) throw new AppError('Post not found', 404);

  const post = await Post.create({
    author: req.user._id,
    content: '',
    images: [],
    visibility: 'public',
    originalPost: originalPost._id,
    isRepost: true,
  });

  await User.findByIdAndUpdate(req.user._id, { $inc: { postsCount: 1 } });
  await Post.findByIdAndUpdate(originalPost._id, { $inc: { sharesCount: 1 } });

  const populatedPost = await Post.findById(post._id)
    .populate('author', 'username displayName avatar isVerified')
    .populate('originalPost', 'content author images')
    .lean();

  (req as any).io?.emit('post:created', populatedPost);

  res.status(201).json({ success: true, data: populatedPost, message: 'Reposted' });
}));

router.get('/user/:userId', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10, cursor, tab = 'posts' } = req.query;
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError('Invalid user ID', 400);
  }

  const query: any = { author: userId };
  if (tab === 'replies') query.isReply = true;
  if (tab === 'media') query.images = { $exists: true, $ne: [] };
  if (tab === 'likes') query._id = { $in: [] };

  if (cursor) query._id = { $lt: cursor };

  const posts = await Post.find(query)
    .populate('author', 'username displayName avatar isVerified')
    .populate('originalPost', 'content author images')
    .sort({ createdAt: -1 })
    .limit(Number(limit) + 1)
    .lean();

  const hasNextPage = posts.length > Number(limit);
  const items = hasNextPage ? posts.slice(0, -1) : posts;

  res.json({
    success: true,
    data: {
      items: items.map(p => ({ ...p, isLiked: p.likes?.includes(req.user._id), isSaved: p.saves?.includes(req.user._id) })),
      page: Number(page),
      limit: Number(limit),
      total: await Post.countDocuments(query),
      totalPages: 0,
      hasNextPage,
      hasPrevPage: Number(page) > 1,
    },
  });
}));

router.get('/user/:userId/liked', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
  if (!mongoose.Types.ObjectId.isValid(req.params.userId)) throw new AppError('Invalid user ID', 400);
  const user = await User.findById(req.params.userId).select('_id');
  if (!user) throw new AppError('User not found', 404);
  const query: any = { likes: user._id };
  const total = await Post.countDocuments(query);
  const posts = await Post.find(query).populate('author', 'username displayName avatar isVerified')
    .populate('originalPost', 'content author images').sort({ createdAt: -1 })
    .skip((page - 1) * limit).limit(limit).lean();
  const totalPages = Math.ceil(total / limit);
  res.json({ success: true, data: {
    items: posts.map(p => ({ ...p, isLiked: p.likes?.some((id:any)=>id.toString()===req.user._id.toString()), isSaved: p.saves?.some((id:any)=>id.toString()===req.user._id.toString()) })),
    page, limit, total, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1
  }});
}));

router.get('/saved', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10, cursor } = req.query;
  const query: any = { saves: req.user._id };
  if (cursor) query._id = { $lt: cursor };

  const posts = await Post.find(query)
    .populate('author', 'username displayName avatar isVerified')
    .populate('originalPost', 'content author images')
    .sort({ createdAt: -1 })
    .limit(Number(limit) + 1)
    .lean();

  const hasNextPage = posts.length > Number(limit);
  const items = hasNextPage ? posts.slice(0, -1) : posts;

  res.json({
    success: true,
    data: {
      items: items.map(p => ({ ...p, isLiked: p.likes?.includes(req.user._id), isSaved: true })),
      page: Number(page),
      limit: Number(limit),
      total: await Post.countDocuments(query),
      totalPages: 0,
      hasNextPage,
      hasPrevPage: Number(page) > 1,
    },
  });
}));

export default router;
