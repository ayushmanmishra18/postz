import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ILike extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  post?: Types.ObjectId;
  comment?: Types.ObjectId;
  createdAt: Date;
}

const likeSchema = new Schema<ILike>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
  },
  comment: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
  },
}, {
  timestamps: true,
});

likeSchema.index({ user: 1, post: 1 }, { unique: true, sparse: true });
likeSchema.index({ user: 1, comment: 1 }, { unique: true, sparse: true });
likeSchema.index({ post: 1, createdAt: -1 });
likeSchema.index({ comment: 1, createdAt: -1 });

likeSchema.virtual('userData', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true,
});

likeSchema.virtual('postData', {
  ref: 'Post',
  localField: 'post',
  foreignField: '_id',
  justOne: true,
});

likeSchema.virtual('commentData', {
  ref: 'Comment',
  localField: 'comment',
  foreignField: '_id',
  justOne: true,
});

likeSchema.set('toJSON', { virtuals: true });
likeSchema.set('toObject', { virtuals: true });

export const Like = mongoose.model<ILike>('Like', likeSchema);