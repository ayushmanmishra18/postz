import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISave extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  post: Types.ObjectId;
  createdAt: Date;
}

const saveSchema = new Schema<ISave>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
}, {
  timestamps: true,
});

saveSchema.index({ user: 1, post: 1 }, { unique: true });
saveSchema.index({ user: 1, createdAt: -1 });
saveSchema.index({ post: 1, createdAt: -1 });

saveSchema.virtual('userData', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true,
});

saveSchema.virtual('postData', {
  ref: 'Post',
  localField: 'post',
  foreignField: '_id',
  justOne: true,
});

saveSchema.set('toJSON', { virtuals: true });
saveSchema.set('toObject', { virtuals: true });

export const Save = mongoose.model<ISave>('Save', saveSchema);