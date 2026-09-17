import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFeed } from '@/hooks/usePosts';
import { PostList } from '@/components/ui/PostList';
import { CreatePostModal } from '@/components/ui/CreatePostModal';
import { useUIStore } from '@/store/uiStore';

export default function HomeScreen() {
  const { isCreatePostOpen, openCreatePost, closeCreatePost } = useUIStore();
  const feed = useFeed();
  const posts = React.useMemo(() => feed.data?.pages.flatMap(page => page.items) ?? [], [feed.data]);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-slate-50 dark:bg-slate-950">
      <View className="flex-row items-center justify-between px-5 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <View>
          <Text className="text-xs font-bold tracking-widest text-primary-600">THOUGHTS</Text>
          <Text className="text-2xl font-bold text-slate-900 dark:text-white">Your feed</Text>
        </View>
        <Pressable className="w-11 h-11 rounded-full bg-primary-50 dark:bg-primary-900/20 items-center justify-center">
          <Ionicons name="notifications-outline" size={22} color="#334155" />
        </Pressable>
      </View>

      <View className="flex-1">
        {feed.isError ? (
          <View className="flex-1 items-center justify-center px-8">
            <Ionicons name="cloud-offline-outline" size={42} color="#ef4444" />
            <Text className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Couldn't load your feed</Text>
            <Text className="mt-2 text-center text-slate-500">Check your connection and try again.</Text>
            <Pressable onPress={() => feed.refetch()} className="mt-5 rounded-xl bg-primary-600 px-5 py-3">
              <Text className="font-semibold text-white">Try again</Text>
            </Pressable>
          </View>
        ) : (
          <PostList
            posts={posts}
            refreshing={feed.isRefetching}
            onRefresh={() => feed.refetch()}
            onEndReached={() => { if (feed.hasNextPage && !feed.isFetchingNextPage) feed.fetchNextPage(); }}
            hasMore={!!feed.hasNextPage}
            ListEmptyComponent={
              !feed.isLoading ? (
                <View className="items-center px-8 py-20">
                  <View className="w-20 h-20 rounded-3xl bg-primary-50 items-center justify-center">
                    <Ionicons name="sparkles-outline" size={38} color="#0284c7" />
                  </View>
                  <Text className="mt-5 text-xl font-bold text-slate-900 dark:text-white">Your feed is quiet</Text>
                  <Text className="mt-2 text-center text-slate-500">Follow people or share your first thought to get the conversation started.</Text>
                  <Pressable onPress={openCreatePost} className="mt-5 rounded-xl bg-primary-600 px-5 py-3">
                    <Text className="font-semibold text-white">Share a thought</Text>
                  </Pressable>
                </View>
              ) : undefined
            }
          />
        )}
      </View>

      <Pressable onPress={openCreatePost} accessibilityRole="button" accessibilityLabel="Create a new thought"
        className="absolute right-5 bottom-6 w-14 h-14 rounded-full bg-primary-600 items-center justify-center shadow-lg"
        style={{ elevation: 6 }}>
        <Ionicons name="add" size={30} color="white" />
      </Pressable>

      <CreatePostModal isOpen={isCreatePostOpen} onClose={closeCreatePost} />
    </SafeAreaView>
  );
}