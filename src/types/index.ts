export interface User {
  _id: string;
  username: string;
  email: string;
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
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt?: Date;
  isFollowing?: boolean;
}

export interface Post {
  _id: string;
  author: User | string;
  content: string;
  images: string[];
  likesCount: number;
  commentsCount: number;
  savesCount: number;
  sharesCount: number;
  isLiked: boolean;
  isSaved: boolean;
  isReposted: boolean;
  originalPost?: Post | string;
  visibility: 'public' | 'followers' | 'private';
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  _id: string;
  post: string;
  author: User | string;
  content: string;
  likesCount: number;
  isLiked: boolean;
  parentComment?: string;
  repliesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Like {
  _id: string;
  user: string;
  post?: string;
  comment?: string;
  createdAt: Date;
}

export interface Save {
  _id: string;
  user: string;
  post: string;
  createdAt: Date;
}

export interface Follow {
  _id: string;
  follower: string;
  following: string;
  createdAt: Date;
}

export interface Notification {
  _id: string;
  user: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'repost';
  actor: User | string;
  post?: Post | string;
  comment?: Comment | string;
  isRead: boolean;
  createdAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface CreatePostInput {
  content: string;
  images?: string[];
  visibility?: 'public' | 'followers' | 'private';
  originalPostId?: string;
}

export interface UpdateProfileInput {
  displayName?: string;
  bio?: string;
  location?: string;
  website?: string;
  birthDate?: string;
  isPrivate?: boolean;
  avatar?: string;
  coverImage?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  displayName: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

export interface SearchUsersParams {
  query: string;
  page?: number;
  limit?: number;
}

export interface FeedParams {
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface UserPostsParams {
  page?: number;
  limit?: number;
  cursor?: string;
  tab?: 'posts' | 'replies' | 'media' | 'likes';
}

export interface SocketEvents {
  'post:created': (post: Post) => void;
  'post:updated': (post: Post) => void;
  'post:deleted': (postId: string) => void;
  'post:liked': (data: { postId: string; userId: string; likesCount: number }) => void;
  'post:unliked': (data: { postId: string; userId: string; likesCount: number }) => void;
  'post:saved': (data: { postId: string; userId: string; savesCount: number }) => void;
  'post:unsaved': (data: { postId: string; userId: string; savesCount: number }) => void;
  'comment:created': (comment: Comment) => void;
  'comment:updated': (comment: Comment) => void;
  'comment:deleted': (commentId: string) => void;
  'user:followed': (data: { followerId: string; followingId: string }) => void;
  'user:unfollowed': (data: { followerId: string; followingId: string }) => void;
  'notification:created': (notification: Notification) => void;
}