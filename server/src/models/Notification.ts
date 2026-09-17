import mongoose, { Document, Schema, Types } from 'mongoose';

export interface INotification extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'repost';
  actor: Types.ObjectId;
  post?: Types.ObjectId;
  comment?: Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['like', 'comment', 'follow', 'mention', 'repost'],
    required: true,
  },
  actor: {
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
  isRead: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ actor: 1, createdAt: -1 });

notificationSchema.virtual('userData', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true,
});

notificationSchema.virtual('actorData', {
  ref: 'User',
  localField: 'actor',
  foreignField: '_id',
  justOne: true,
});

notificationSchema.virtual('postData', {
  ref: 'Post',
  localField: 'post',
  foreignField: '_id',
  justOne: true,
});

notificationSchema.virtual('commentData', {
  ref: 'Comment',
  localField: 'comment',
  foreignField: '_id',
  justOne: true,
});

notificationSchema.set('toJSON', { virtuals: true });
notificationSchema.set('toObject', { virtuals: true });

export default mongoose.model<INotification>('Notification', notificationSchema);