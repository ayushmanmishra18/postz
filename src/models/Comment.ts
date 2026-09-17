import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IComment extends Document {
  _id: Types.ObjectId;
  post: Types.ObjectId;
  author: Types.ObjectId;
  content: string;
  likesCount: number;
  parentComment?: Types.ObjectId;
  repliesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>({
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000,
    trim: true,
  },
  likesCount: {
    type: Number,
    default: 0,
  },
  parentComment: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
  },
  repliesCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

commentSchema.index({ post: 1, createdAt: 1 });
commentSchema.index({ author: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1, createdAt: 1 });

commentSchema.virtual('authorData', {
  ref: 'User',
  localField: 'author',
  foreignField: '_id',
  justOne: true,
});

commentSchema.virtual('parentCommentData', {
  ref: 'Comment',
  localField: 'parentComment',
  foreignField: '_id',
  justOne: true,
});

commentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentComment',
});

commentSchema.set('toJSON', { virtuals: true });
commentSchema.set('toObject', { virtuals: true });

export const Comment = mongoose.model<IComment>('Comment', commentSchema);