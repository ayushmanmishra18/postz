import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import User from '../models/User';

const router = Router();

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880');
const ALLOWED_MIME_TYPES = (process.env.ALLOWED_MIME_TYPES || 'image/jpeg,image/png,image/webp,image/gif').split(',');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req: AuthRequest, file: Express.Multer.File, cb: any) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Only images are allowed.', 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

router.post('/image', authMiddleware, upload.single('image'), asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  const fileUrl = `${process.env.PUBLIC_API_URL || `http://localhost:${process.env.PORT || 3000}`}/uploads/${req.file.filename}`;
  res.json({ success: true, data: { url: fileUrl } });
}));

router.post('/images', authMiddleware, upload.array('images', 4), asyncHandler(async (req: AuthRequest, res: Response) => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    throw new AppError('No files uploaded', 400);
  }

  const baseUrl = process.env.PUBLIC_API_URL || `http://localhost:${process.env.PORT || 3000}`;
  const urls = files.map(f => `${baseUrl}/uploads/${f.filename}`);
  res.json({ success: true, data: { urls } });
}));

router.post('/avatar', authMiddleware, upload.single('avatar'), asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  const fileUrl = `${process.env.PUBLIC_API_URL || `http://localhost:${process.env.PORT || 3000}`}/uploads/${req.file.filename}`;
  const user = await User.findByIdAndUpdate(req.user._id, { avatar: fileUrl }, { new: true });
  res.json({ success: true, data: { avatar: user?.avatar || fileUrl } });
}));

router.post('/cover', authMiddleware, upload.single('coverImage'), asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  const fileUrl = `${process.env.PUBLIC_API_URL || `http://localhost:${process.env.PORT || 3000}`}/uploads/${req.file.filename}`;
  const user = await User.findByIdAndUpdate(req.user._id, { coverImage: fileUrl }, { new: true });
  res.json({ success: true, data: { coverImage: user?.coverImage || fileUrl } });
}));

export default router;
