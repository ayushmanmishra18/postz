import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { notificationsApi } from '@/api/notifications';
import { queryKeys } from '@/lib/queryClient';
import { Notification } from '@/types';

export function useNotifications(params?: { page?: number; limit?: number; unreadOnly?: boolean }) {
  return useInfiniteQuery({
    queryKey: queryKeys.notifications.list(params),
    queryFn: ({ pageParam }) => notificationsApi.getNotifications({ ...params, page: pageParam }),
    getNextPageParam: (lastPage, allPages) => lastPage.hasNextPage ? allPages.length + 1 : undefined,
    initialPageParam: 1,
    staleTime: 1000 * 60 * 1,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount,
    queryFn: notificationsApi.getUnreadCount,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => notificationsApi.markAsRead(notificationId),
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.all });

      const previousNotifications = queryClient.getQueriesData({ queryKey: queryKeys.notifications.list() });

      queryClient.setQueriesData({ queryKey: queryKeys.notifications.list() }, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            items: page.items.map((n: Notification) =>
              n._id === notificationId ? { ...n, isRead: true } : n
            ),
          })),
        };
      });

      return { previousNotifications };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.list() });

      const previousNotifications = queryClient.getQueryData(queryKeys.notifications.list());

      queryClient.setQueryData(queryKeys.notifications.list(), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            items: page.items.map((n: Notification) => ({ ...n, isRead: true })),
          })),
        };
      });

      return { previousNotifications };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount });
    },
  });
}