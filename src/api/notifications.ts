import { api } from '@/lib/api';
import { Notification, PaginatedResponse } from '@/types';

export const notificationsApi = {
  getNotifications: async (params?: { page?: number; limit?: number; unreadOnly?: boolean }): Promise<PaginatedResponse<Notification>> => {
    const response = await api.get<PaginatedResponse<Notification>>('/notifications', { params });
    return response.data;
  },

  getUnreadCount: async (): Promise<{ count: number }> => {
    const response = await api.get<{ count: number }>('/notifications/unread-count');
    return response.data;
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    await api.patch(`/notifications/${notificationId}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.patch('/notifications/read-all');
  },

  deleteNotification: async (notificationId: string): Promise<void> => {
    await api.delete(`/notifications/${notificationId}`);
  },
};