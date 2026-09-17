import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { queryKeys } from '@/lib/queryClient';

const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api').replace(/\/api\/?$/, '');

export function useRealtime() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    const socket: Socket = io(API_URL, {
      transports: ['websocket', 'polling'],
      auth: { token: accessToken },
      reconnection: true,
    });

    socket.on('post:created', () => queryClient.invalidateQueries({ queryKey: queryKeys.posts.feed() }));
    socket.on('post:updated', () => queryClient.invalidateQueries({ queryKey: queryKeys.posts.all }));
    socket.on('post:deleted', () => queryClient.invalidateQueries({ queryKey: queryKeys.posts.all }));
    socket.on('post:liked', () => queryClient.invalidateQueries({ queryKey: queryKeys.posts.all }));
    socket.on('post:unliked', () => queryClient.invalidateQueries({ queryKey: queryKeys.posts.all }));
    socket.on('post:saved', () => queryClient.invalidateQueries({ queryKey: queryKeys.posts.all }));
    socket.on('post:unsaved', () => queryClient.invalidateQueries({ queryKey: queryKeys.posts.all }));
    socket.on('comment:created', () => queryClient.invalidateQueries({ queryKey: queryKeys.posts.all }));
    socket.on('comment:updated', () => queryClient.invalidateQueries({ queryKey: queryKeys.posts.all }));
    socket.on('comment:deleted', () => queryClient.invalidateQueries({ queryKey: queryKeys.posts.all }));
    socket.on('user:followed', () => queryClient.invalidateQueries({ queryKey: queryKeys.users.all }));
    socket.on('user:unfollowed', () => queryClient.invalidateQueries({ queryKey: queryKeys.users.all }));
    socket.on('notification:created', () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount });
    });

    return () => { socket.removeAllListeners(); socket.disconnect(); };
  }, [accessToken, isAuthenticated, queryClient]);
}
