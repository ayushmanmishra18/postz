import React from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { tw } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import { useFeed } from '@/hooks/usePosts';
import { PostList } from '@/components/ui/PostList';
import { CreatePostModal } from '@/components/ui/CreatePostModal';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';

export default function HomeScreen() {
  const { user, isAuthenticated } = useAuth();
  const { isCreatePostOpen, closeCreatePost } = useUIStore();
  const { data: feedData, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, refetch } = useFeed();

  const posts = React.useMemo(() => {
    if (!feedData) return [];
    return feedData.pages.flatMap(page => page.items);
  }, [feedData]);

  const onRefresh = React.useCallback(() => {
    refetch();
  }, [refetch]);

  const onEndReached = React.useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (!isAuthenticated) {
    return (
      <View className={tw`flex-1 items-center justify-center px-4`}>
        <Ionicons name="person-circle-outline" size={80} color="#71717a" />
        <Text className={tw`mt-4 text-xl font-semibold text-surface-900 dark:text-surface-50 text-center`}>
          Welcome to Thoughts
        </Text>
        <Text className={tw`mt-2 text-surface-500 dark:text-surface-400 text-center px-4`}>
          Sign in to see thoughts from people you follow
        </Text>
      </View>
    );
  }

  return (
    <View className={tw`flex-1 bg-surface-50 dark:bg-surface-950`}>
      <FlatList
        data={posts.length > 0 ? [{ type: 'feed', posts }] : [{ type: 'empty' }]}
        keyExtractor={(item) => item.type}
        renderItem={({ item }) => {
          if (item.type === 'empty') {
            return (
              <View className={tw`flex-1 items-center justify-center py-12 px-4`}>
                <Ionicons name="person-add-outline" size={64} color="#a1a1aa" />
                <Text className={tw`mt-4 text-lg font-medium text-surface-600 dark:text-surface-400 text-center`}>
                  No thoughts yet
                </Text>
                <Text className={tw`mt-2 text-surface-500 dark:text-surface-400 text-center px-4`}>
                  Follow some people to see their thoughts here
                </Text>
              </View>
            );
          }
          return (
            <PostList
              posts={item.posts}
              onEndReached={onEndReached}
              onRefresh={onRefresh}
              refreshing={isLoading}
              hasMore={hasNextPage}
            />
          );
        }}
        ListHeaderComponent={
          posts.length === 0 ? null : (
            <View className={tw`px-4 py-3 border-b border-surface-200 dark:border-surface-700`}>
              <Text className={tw`text-xl font-bold text-surface-900 dark:text-surface-50`}>Home</Text>
            </View>
          )
        }
        ListFooterComponent={
          hasNextPage && (
            <View className={tw`py-4 flex-row items-center justify-center gap-2`}>
              {isFetchingNextPage && (
                <>
                  <Ionicons name="refresh" size={20} color="#71717a" className={tw`animate-spin`} />
                  <Text className={tw`text-surface-500 dark:text-surface-400 text-sm`}>Loading more...</Text>
                </>
              )}
            </View>
          )
        }
        contentContainerStyle={tw`pb-20`}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            colors={['#0ea5e9']}
          />
        }
      />

      <CreatePostModal isOpen={isCreatePostOpen} onClose={closeCreatePost} />
    </View>
  );
}