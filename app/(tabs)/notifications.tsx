import React from 'react';
import { View, Text, FlatList, RefreshControl, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications, useMarkAllAsRead, useMarkAsRead } from '@/hooks/useNotifications';
import { Notification } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PostCard } from '@/components/ui/PostCard';

export default function NotificationsScreen() {
  const { data: notificationsData, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch } = useNotifications();
  const markAllAsRead = useMarkAllAsRead();
  const markAsRead = useMarkAsRead();
  const router = useRouter();

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
          if (actor?.username) router.push({ pathname: '/(tabs)/profile', params: { username: actor.username } });
          if (!notification.isRead) {
            markAsRead.mutate(notification._id);
          }
        }}
        className={`flex-row gap-4 p-4 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-700 ${!notification.isRead ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}
      >
        <Avatar source={actor?.avatar} name={actor?.displayName} size="md" />
        <View className={"flex-1 min-w-0"}>
          <Text className={"text-surface-900 dark:text-surface-50"}>
            <Text className={"font-semibold"}>{actor?.displayName}</Text>{' '}
            {getNotificationContent()}
          </Text>
          <Text className={"text-sm text-surface-500 dark:text-surface-400 mt-1"}>{timeAgo}</Text>
          {notification.post && (
            <PostCard
              post={notification.post as any}
              isCompact
              onPress={() => {}}
            />
          )}
        </View>
        {!notification.isRead && (
          <View className={"w-2 h-2 rounded-full bg-primary-600 mt-6"} />
        )}
      </Pressable>
    );
  };


  if (isLoading && notifications.length === 0) {
    return (
      <View className={"flex-1 items-center justify-center"}>
        <Ionicons name="refresh" size={32} color="#0ea5e9" className={"animate-spin"} />
      </View>
    );
  }

  if (notifications.length === 0) {
    return (
      <View className={"flex-1 items-center justify-center px-4"}>
        <Ionicons name="notifications-outline" size={64} color="#a1a1aa" />
        <Text className={"mt-4 text-lg font-medium text-surface-600 dark:text-surface-400 text-center"}>
          No notifications yet
        </Text>
        <Text className={"mt-2 text-surface-500 dark:text-surface-400 text-center"}>
          When you get notifications, they'll appear here
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView edges={['top']} className={"flex-1 bg-slate-50 dark:bg-slate-950"}>
      <View className={"flex-row items-center justify-between px-5 py-4 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800"}>

        <View><Text className={"text-2xl font-bold text-slate-900 dark:text-white"}>Notifications</Text><Text className={"text-xs text-surface-500 mt-1"}>{notifications.filter(n => !n.isRead).length} unread</Text></View>
        <Pressable onPress={() => markAllAsRead.mutate()} className={"px-3 py-2 rounded-xl bg-primary-50 dark:bg-primary-900/20"}><Text className={"text-sm font-semibold text-primary-700"}>Mark all read</Text></Pressable>
      </View>
      <FlatList
        data={Object.entries(groupedNotifications)}
        keyExtractor={([date]) => date}
        renderItem={({ item }) => {
          const [date, items] = item;
          return (
            <View>
              <View className={"px-4 py-3 bg-surface-100 dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700"}>
                <Text className={"text-sm font-semibold text-surface-600 dark:text-surface-400 uppercase tracking-wide"}>
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
          hasNextPage ? (
            <View className={"py-4 flex-row items-center justify-center gap-2"}>
              <Ionicons name="refresh" size={20} color="#71717a" className={"animate-spin"} />
              <Text className={"text-surface-500 dark:text-surface-400 text-sm"}>Loading more...</Text>
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            colors={['#0ea5e9']}
          />
        }
      />
    </SafeAreaView>
  );
}
