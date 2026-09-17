import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  location?: string;
  website?: string;
  birthDate?: Date;
  isVerified: boolean;
  isPrivate: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  following?: Types.ObjectId[];
  followers?: Types.ObjectId[];
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  lastActiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: /^[a-zA-Z0-9_]+$/
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  bio: {
    type: String,
    maxlength: 160,
    default: '',
  },
  avatar: {
    type: String,
    default: '',
  },
  coverImage: {
    type: String,
    default: '',
  },
  location: {
    type: String,
    maxlength: 100,
    default: '',
  },
  website: {
    type: String,
    maxlength: 100,
    default: '',
  },
  birthDate: {
    type: Date,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isPrivate: {
    type: Boolean,
    default: false,
  },
  followersCount: {
    type: Number,
    default: 0,
  },
  followingCount: {
    type: Number,
    default: 0,
  },
  postsCount: {
    type: Number,
    default: 0,
  },
  following: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  followers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  lastActiveAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

userSchema.index({ username: 'text', displayName: 'text' });
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

export default mongoose.model<IUser>('User', userSchema);