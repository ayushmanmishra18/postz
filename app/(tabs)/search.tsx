import React from 'react';
import { View, Text, TextInput, FlatList, Pressable } from 'react-native';
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
  const followUser = useFollowUser();
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
      className={"flex-row items-center gap-4 p-4 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-700"}
    >
      <Avatar source={user.avatar} name={user.displayName} size="md" status={user.lastActiveAt ? 'online' : 'offline'} />
      <View className={"flex-1 min-w-0"}>
        <View className={"flex-row items-center gap-2"}>
          <Text className={"font-semibold text-surface-900 dark:text-surface-50 truncate"}>
            {user.displayName}
          </Text>
          {user.isVerified && <Ionicons name="checkmark-circle" size={16} color="#0ea5e9" />}
        </View>
        <Text className={"text-sm text-surface-500 dark:text-surface-400 truncate"}>@{user.username}</Text>
        {user.bio && (
          <Text className={"mt-1 text-sm text-surface-600 dark:text-surface-400 line-clamp-1 truncate"}>
            {user.bio}
          </Text>
        )}
      </View>
      <Button
        variant={user.isFollowing ? 'secondary' : 'primary'}
        size="sm"
        onPress={() => followUser.mutate({ userId: user._id, isFollowing: !!user.isFollowing })}
        disabled={followUser.isPending}
      >
        {user.isFollowing ? 'Following' : 'Follow'}
      </Button>
    </Pressable>
  );

  if (!isSearching) {
    return (
      <SafeAreaView edges={['top']} className={"flex-1 bg-slate-50 dark:bg-slate-950"}>
        <View className={"px-4 pt-4 pb-3"}>
          <Text className={"text-2xl font-bold text-slate-900 dark:text-white mb-3"}>Discover people</Text>
          <View className={"flex-row items-center bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-2xl px-3"}>
          <Ionicons name="search" size={20} color="#94a3b8" />
          <TextInput
            placeholder="Search users..."
            value={query}
            onChangeText={setQuery}
            placeholderTextColor="#a1a1aa"
            autoFocus
            className={"flex-1 px-3 py-3 text-surface-900 dark:text-surface-50"}
          />
          </View>
        </View>
        {suggestions && suggestions.length > 0 && (
          <View className={"px-4"}>
            <Text className={"text-sm font-semibold text-surface-500 dark:text-surface-400 mb-3"}>Suggested for you</Text>
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
    <SafeAreaView edges={['top']} className={"flex-1 bg-slate-50 dark:bg-slate-950"}>
      <View className={"p-4"}>
        <TextInput
          placeholder="Search users..."
          value={query}
          onChangeText={setQuery}
          className={"bg-white dark:bg-surface-900 border-2 border-surface-200 dark:border-surface-700 rounded-xl px-4 py-3 text-surface-900 dark:text-surface-50 placeholder:text-surface-400"}
          placeholderTextColor="#a1a1aa"
          autoFocus
        />
      </View>
      {isLoading && users.length === 0 ? (
        <View className={"flex-1 items-center justify-center"}>
          <Ionicons name="refresh" size={32} color="#0ea5e9" className={"animate-spin"} />
        </View>
      ) : users.length === 0 ? (
        <View className={"flex-1 items-center justify-center px-4"}>
          <Ionicons name="person-outline" size={64} color="#a1a1aa" />
          <Text className={"mt-4 text-lg font-medium text-surface-600 dark:text-surface-400 text-center"}>
            No users found
          </Text>
          <Text className={"mt-2 text-surface-500 dark:text-surface-400 text-center"}>
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
            hasNextPage ? (
              <View className={"py-4 flex-row items-center justify-center gap-2"}>
                <Ionicons name="refresh" size={20} color="#71717a" className={"animate-spin"} />
                <Text className={"text-surface-500 dark:text-surface-400 text-sm"}>Loading more...</Text>
              </View>
            ) : null
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}
    </SafeAreaView>
  );
}
