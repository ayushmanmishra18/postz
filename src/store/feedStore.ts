import { create } from 'zustand';
import { Post } from '@/types';

interface FeedState {
  posts: Post[];
  hasMore: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  cursor: string | null;
  setPosts: (posts: Post[]) => void;
  prependPosts: (posts: Post[]) => void;
  appendPosts: (posts: Post[]) => void;
  updatePost: (postId: string, updates: Partial<Post>) => void;
  removePost: (postId: string) => void;
  setHasMore: (hasMore: boolean) => void;
  setCursor: (cursor: string | null) => void;
  setLoading: (loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  clearFeed: () => void;
}

export const useFeedStore = create<FeedState>((set) => ({
  posts: [],
  hasMore: true,
  isLoading: false,
  isRefreshing: false,
  cursor: null,

  setPosts: (posts) => set({ posts }),
  prependPosts: (posts) => set((state) => ({ posts: [...posts, ...state.posts] })),
  appendPosts: (posts) => set((state) => ({ posts: [...state.posts, ...posts] })),
  updatePost: (postId, updates) =>
    set((state) => ({
      posts: state.posts.map((p) => (p._id === postId ? { ...p, ...updates } : p)),
    })),
  removePost: (postId) =>
    set((state) => ({
      posts: state.posts.filter((p) => p._id !== postId),
    })),
  setHasMore: (hasMore) => set({ hasMore }),
  setCursor: (cursor) => set({ cursor }),
  setLoading: (isLoading) => set({ isLoading }),
  setRefreshing: (isRefreshing) => set({ isRefreshing }),
  clearFeed: () => set({ posts: [], hasMore: true, cursor: null }),
}));