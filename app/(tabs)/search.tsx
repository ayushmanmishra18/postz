import React from 'react';
import { View, Text, TextInput, FlatList, Pressable } from 'react-native';
import { tw } from '@/lib/tw';
import { Ionicons } from '@expo/vector-icons';
import { useSearchUsers, useUserSuggestions } from '@/hooks/useUsers';
import { User } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { useFollowUser } from '@/hooks/useUsers';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SearchScreen() {
  const [query, setQuery] = React.useState('');
  const [debouncedQuery, setDebouncedQuery] = React.useState('');
  const router = useRouter();
  const { followUser } = useFollowUser();
  const { data: suggestions } = useUserSuggestions();
  const { data: searchData, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useSearchUsers(debouncedQuery);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const users = React.useMemo(() => {
    if (!searchData) return [];
    return searchData.pages.flatMap(page => page.items);
  }, [searchData]);

  const isSearching = debouncedQuery.length >= 2;

  const renderUser = (user: User) => (
    <Pressable
      onPress={() => router.push({ pathname: '/(tabs)/profile', params: { username: user.username } })}
      className={tw`flex-row items-center gap-4 p-4 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-700`}
    >
      <Avatar source={user.avatar} name={user.displayName} size="md" status={user.lastActiveAt ? 'online' : 'offline'} />
      <View className={tw`flex-1 min-w-0`}>
        <View className={tw`flex-row items-center gap-2`}>
          <Text className={tw`font-semibold text-surface-900 dark:text-surface-50 truncate`}>
            {user.displayName}
          </Text>
          {user.isVerified && <Ionicons name="checkmark-circle" size={16} color="#0ea5e9" />}
        </View>
        <Text className={tw`text-sm text-surface-500 dark:text-surface-400 truncate`}>@{user.username}</Text>
        {user.bio && (
          <Text className={tw`mt-1 text-sm text-surface-600 dark:text-surface-400 line-clamp-1 truncate`}>
            {user.bio}
          </Text>
        )}
      </View>
      <Button
        variant={user.isFollowing ? 'secondary' : 'primary'}
        size="sm"
        onPress={() => followUser.mutate({ userId: user._id, isFollowing: user.isFollowing })}
        disabled={followUser.isPending}
      >
        {user.isFollowing ? 'Following' : 'Follow'}
      </Button>
    </Pressable>
  );

  if (!isSearching) {
    return (
      <SafeAreaView edges={['top']} className={tw`flex-1 bg-slate-50 dark:bg-slate-950`}>
        <View className={tw`px-4 pt-4 pb-3`}>
          <Text className={tw`text-2xl font-bold text-slate-900 dark:text-white mb-3`}>Discover people</Text>
          <View className={tw`flex-row items-center bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-2xl px-3`}>
          <Ionicons name="search" size={20} color="#94a3b8" />
          <TextInput
            placeholder="Search users..."
            value={query}
            onChangeText={setQuery}
            placeholderTextColor="#a1a1aa"
            autoFocus
            className={tw`flex-1 px-3 py-3 text-surface-900 dark:text-surface-50`}
          />
          </View>
        </View>
        {suggestions && suggestions.length > 0 && (
          <View className={tw`px-4`}>
            <Text className={tw`text-sm font-semibold text-surface-500 dark:text-surface-400 mb-3`}>Suggested for you</Text>
            <FlatList
              data={suggestions.slice(0, 10)}
              keyExtractor={(u) => u._id}
              renderItem={({ item }) => renderUser(item)}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} className={tw`flex-1 bg-slate-50 dark:bg-slate-950`}>
      <View className={tw`p-4`}>
        <TextInput
          placeholder="Search users..."
          value={query}
          onChangeText={setQuery}
          className={tw`bg-white dark:bg-surface-900 border-2 border-surface-200 dark:border-surface-700 rounded-xl px-4 py-3 text-surface-900 dark:text-surface-50 placeholder:text-surface-400`}
          placeholderTextColor="#a1a1aa"
          autoFocus
        />
      </View>
      {isLoading && users.length === 0 ? (
        <View className={tw`flex-1 items-center justify-center`}>
          <Ionicons name="refresh" size={32} color="#0ea5e9" className={tw`animate-spin`} />
        </View>
      ) : users.length === 0 ? (
        <View className={tw`flex-1 items-center justify-center px-4`}>
          <Ionicons name="person-search-outline" size={64} color="#a1a1aa" />
          <Text className={tw`mt-4 text-lg font-medium text-surface-600 dark:text-surface-400 text-center`}>
            No users found
          </Text>
          <Text className={tw`mt-2 text-surface-500 dark:text-surface-400 text-center`}>
            Try a different search term
          </Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(u) => u._id}
          renderItem={({ item }) => renderUser(item)}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            hasNextPage && (
              <View className={tw`py-4 flex-row items-center justify-center gap-2`}>
                <Ionicons name="refresh" size={20} color="#71717a" className={tw`animate-spin`} />
                <Text className={tw`text-surface-500 dark:text-surface-400 text-sm`}>Loading more...</Text>
              </View>
            )
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}
    </SafeAreaView>
  );
}