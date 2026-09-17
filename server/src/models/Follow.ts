import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IFollow extends Document {
  _id: Types.ObjectId;
  follower: Types.ObjectId;
  following: Types.ObjectId;
  createdAt: Date;
}

const followSchema = new Schema<IFollow>({
  follower: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  following: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

followSchema.index({ follower: 1, following: 1 }, { unique: true });
followSchema.index({ follower: 1, createdAt: -1 });
followSchema.index({ following: 1, createdAt: -1 });

followSchema.virtual('followerData', {
  ref: 'User',
  localField: 'follower',
  foreignField: '_id',
  justOne: true,
});

followSchema.virtual('followingData', {
  ref: 'User',
  localField: 'following',
  foreignField: '_id',
  justOne: true,
});

followSchema.set('toJSON', { virtuals: true });
followSchema.set('toObject', { virtuals: true });

export default mongoose.model<IFollow>('Follow', followSchema);