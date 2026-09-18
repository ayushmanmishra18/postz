import React from 'react';
import { View, Text, Pressable, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Post } from '@/types';
import { PostCard } from './PostCard';

interface PostListProps {
  posts: Post[];
  onEndReached?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  hasMore?: boolean;
  renderItem?: (post: Post) => React.ReactElement | null;
  keyExtractor?: (post: Post) => string;
  ListEmptyComponent?: React.ReactNode;
  className?: string;
  onCommentPress?: (post: Post) => void;
  onProfilePress?: (userId: string) => void;
  onPress?: (post: Post) => void;
}

export function PostList({
  posts,
  onEndReached,
  onRefresh,
  refreshing = false,
  hasMore = false,
  renderItem,
  keyExtractor = (post) => post._id,
  ListEmptyComponent,
  className = '',
  onCommentPress,
  onProfilePress,
  onPress,
}: PostListProps) {
  if (posts.length === 0) {
    return (
      <View className={`flex-1 items-center justify-center py-12 px-4 ${className}`}>
        {ListEmptyComponent || (
          <View className={"items-center gap-4"}>
            <Ionicons name="document-text-outline" size={64} color="#a1a1aa" />
            <Text className={"text-surface-500 dark:text-surface-400 text-center text-lg"}>
              No thoughts yet
            </Text>
            <Text className={"text-surface-400 dark:text-surface-500 text-center"}>
              Be the first to share your thoughts!
            </Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      keyExtractor={keyExtractor}
      renderItem={({ item }) => (
        renderItem ? renderItem(item) : (
          <PostCard
            post={item}
            onPress={() => onPress?.(item)}
            onCommentPress={() => onCommentPress?.(item)}
            onProfilePress={() => onProfilePress?.((item.author as any)?._id || '')}
          />
        )
      )}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      onRefresh={onRefresh}
      refreshing={refreshing}
      ListFooterComponent={
        hasMore ? (
          <View className={"py-4 flex-row items-center justify-center gap-2"}>
            <Ionicons name="refresh" size={20} color="#71717a" className={"animate-spin"} />
            <Text className={"text-surface-500 dark:text-surface-400 text-sm"}>Loading more...</Text>
          </View>
        ) : null
      }
      showsVerticalScrollIndicator={false}
    />
  );
}
