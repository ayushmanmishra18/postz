import React from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { tw } from '@/lib/tw';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications, useMarkAllAsRead } from '@/hooks/useNotifications';
import { Notification } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { formatDistanceToNow } from 'date-fns';
import { useUIStore } from '@/store/uiStore';
import { PostCard } from '@/components/ui/PostCard';

export default function NotificationsScreen() {
  const { data: notificationsData, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch } = useNotifications();
  const { markAllAsRead } = useMarkAllAsRead();
  const { openUserProfile } = useUIStore();

  const notifications = React.useMemo(() => {
    if (!notificationsData) return [];
    return notificationsData.pages.flatMap(page => page.items);
  }, [notificationsData]);

  const groupedNotifications = React.useMemo(() => {
    const groups: Record<string, Notification[]> = {};
    notifications.forEach(n => {
      const date = new Date(n.createdAt).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(n);
    });
    return groups;
  }, [notifications]);

  const renderNotification = (notification: Notification) => {
    const actor = notification.actor as any;
    const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });

    const getNotificationContent = () => {
      switch (notification.type) {
        case 'like':
          return `${actor?.displayName} liked your thought`;
        case 'comment':
          return `${actor?.displayName} commented on your thought`;
        case 'follow':
          return `${actor?.displayName} started following you`;
        case 'mention':
          return `${actor?.displayName} mentioned you in a thought`;
        case 'repost':
          return `${actor?.displayName} reposted your thought`;
        default:
          return 'New notification';
      }
    };

    return (
      <Pressable
        onPress={() => {
          if (actor) openUserProfile(actor);
          if (!notification.isRead) {
            markAsRead.mutate(notification._id);
          }
        }}
        className={tw`flex-row gap-4 p-4 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-700 ${!notification.isRead ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}
      >
        <Avatar source={actor?.avatar} name={actor?.displayName} size="md" />
        <View className={tw`flex-1 min-w-0`}>
          <Text className={tw`text-surface-900 dark:text-surface-50`}>
            <Text className={tw`font-semibold`}>{actor?.displayName}</Text>{' '}
            {getNotificationContent()}
          </Text>
          <Text className={tw`text-sm text-surface-500 dark:text-surface-400 mt-1`}>{timeAgo}</Text>
          {notification.post && (
            <PostCard
              post={notification.post as any}
              isCompact
              onPress={() => {}}
            />
          )}
        </View>
        {!notification.isRead && (
          <View className={tw`w-2 h-2 rounded-full bg-primary-600 mt-6`} />
        )}
      </Pressable>
    );
  };

  const markAsRead = useMarkAllAsRead();

  if (isLoading && notifications.length === 0) {
    return (
      <View className={tw`flex-1 items-center justify-center`}>
        <Ionicons name="refresh" size={32} color="#0ea5e9" className={tw`animate-spin`} />
      </View>
    );
  }

  if (notifications.length === 0) {
    return (
      <View className={tw`flex-1 items-center justify-center px-4`}>
        <Ionicons name="notifications-outline" size={64} color="#a1a1aa" />
        <Text className={tw`mt-4 text-lg font-medium text-surface-600 dark:text-surface-400 text-center`}>
          No notifications yet
        </Text>
        <Text className={tw`mt-2 text-surface-500 dark:text-surface-400 text-center`}>
          When you get notifications, they'll appear here
        </Text>
      </View>
    );
  }

  return (
    <View className={tw`flex-1 bg-surface-50 dark:bg-surface-950`}>
      <FlatList
        data={Object.entries(groupedNotifications)}
        keyExtractor={([date]) => date}
        renderItem={({ item }) => {
          const [date, items] = item;
          return (
            <View>
              <View className={tw`px-4 py-3 bg-surface-100 dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700`}>
                <Text className={tw`text-sm font-semibold text-surface-600 dark:text-surface-400 uppercase tracking-wide`}>
                  {date === new Date().toDateString() ? 'Today' : date === new Date(Date.now() - 86400000).toDateString() ? 'Yesterday' : date}
                </Text>
              </View>
              {items.map(n => renderNotification(n))}
            </View>
          );
        }}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        onRefresh={refetch}
        refreshing={isLoading}
        ListFooterComponent={
          hasNextPage && (
            <View className={tw`py-4 flex-row items-center justify-center gap-2`}>
              <Ionicons name="refresh" size={20} color="#71717a" className={tw`animate-spin`} />
              <Text className={tw`text-surface-500 dark:text-surface-400 text-sm`}>Loading more...</Text>
            </View>
          )
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw`pb-20`}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            colors={['#0ea5e9']}
          />
        }
      />
    </View>
  );
}