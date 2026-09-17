import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPost extends Document {
  _id: Types.ObjectId;
  author: Types.ObjectId;
  content: string;
  images: string[];
  likesCount: number;
  commentsCount: number;
  savesCount: number;
  sharesCount: number;
  visibility: 'public' | 'followers' | 'private';
  originalPost?: Types.ObjectId;
  isRepost: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000,
    trim: true,
  },
  images: [{
    type: String,
    trim: true,
  }],
  likesCount: {
    type: Number,
    default: 0,
  },
  commentsCount: {
    type: Number,
    default: 0,
  },
  savesCount: {
    type: Number,
    default: 0,
  },
  sharesCount: {
    type: Number,
    default: 0,
  },
  visibility: {
    type: String,
    enum: ['public', 'followers', 'private'],
    default: 'public',
  },
  originalPost: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
  },
  isRepost: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ 'content': 'text' });
postSchema.index({ visibility: 1, createdAt: -1 });
postSchema.index({ originalPost: 1 });

postSchema.virtual('authorData', {
  ref: 'User',
  localField: 'author',
  foreignField: '_id',
  justOne: true,
});

postSchema.virtual('originalPostData', {
  ref: 'Post',
  localField: 'originalPost',
  foreignField: '_id',
  justOne: true,
});

postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

export const Post = mongoose.model<IPost>('Post', postSchema);