import { create } from 'zustand';
import { User } from '@/types';

interface UIState {
  isCreatePostOpen: boolean;
  isCommentSheetOpen: boolean;
  selectedPost: Post | null;
  selectedUser: User | null;
  activeTab: 'home' | 'search' | 'notifications' | 'profile';
  openCreatePost: () => void;
  closeCreatePost: () => void;
  openCommentSheet: (post: Post) => void;
  closeCommentSheet: () => void;
  openUserProfile: (user: User) => void;
  closeUserProfile: () => void;
  setActiveTab: (tab: 'home' | 'search' | 'notifications' | 'profile') => void;
}

type Post = {
  _id: string;
  author: User;
  content: string;
  images: string[];
  likesCount: number;
  commentsCount: number;
  savesCount: number;
  isLiked: boolean;
  isSaved: boolean;
  createdAt: string;
};

export const useUIStore = create<UIState>((set) => ({
  isCreatePostOpen: false,
  isCommentSheetOpen: false,
  selectedPost: null,
  selectedUser: null,
  activeTab: 'home',

  openCreatePost: () => set({ isCreatePostOpen: true }),
  closeCreatePost: () => set({ isCreatePostOpen: false }),
  openCommentSheet: (post) => set({ isCommentSheetOpen: true, selectedPost: post }),
  closeCommentSheet: () => set({ isCommentSheetOpen: false, selectedPost: null }),
  openUserProfile: (user) => set({ selectedUser: user }),
  closeUserProfile: () => set({ selectedUser: null }),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));