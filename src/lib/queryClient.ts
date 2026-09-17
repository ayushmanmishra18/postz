import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  users: {
    all: ['users'] as const,
    list: (params?: object) => ['users', 'list', params] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
    profile: (username: string) => ['users', 'profile', username] as const,
    followers: (userId: string, params?: object) => ['users', 'followers', userId, params] as const,
    following: (userId: string, params?: object) => ['users', 'following', userId, params] as const,
    search: (query: string, params?: object) => ['users', 'search', query, params] as const,
    suggestions: ['users', 'suggestions'] as const,
  },
  posts: {
    all: ['posts'] as const,
    feed: (params?: object) => ['posts', 'feed', params] as const,
    detail: (id: string) => ['posts', 'detail', id] as const,
    userPosts: (userId: string, params?: object) => ['posts', 'user', userId, params] as const,
    liked: (userId: string, params?: object) => ['posts', 'liked', userId, params] as const,
    saved: (params?: object) => ['posts', 'saved', params] as const,
    comments: (postId: string, params?: object) => ['posts', 'comments', postId, params] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    list: (params?: object) => ['notifications', 'list', params] as const,
    unreadCount: ['notifications', 'unreadCount'] as const,
  },
} as const;