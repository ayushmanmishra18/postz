import React from 'react';
import { View, Text, Image, FlatList, StyleSheet, Pressable, RefreshControl } from 'react-native';
import { tw } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useUserPosts, useLikedPosts } from '@/hooks/usePosts';
import { useFollowers, useFollowing } from '@/hooks/useUsers';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { PostCard } from '@/components/ui/PostCard';
import { useFollowUser } from '@/hooks/useUsers';
import { useUIStore } from '@/store/uiStore';
import { formatDistanceToNow } from 'date-fns';

type ProfileTab = 'posts' | 'replies' | 'media' | 'likes';

export default function ProfileScreen({ route }: any) {
  const { user: currentUser } = useAuth();
  const { params } = route;
  const username = params?.username;
  const isOwnProfile = !username || username === currentUser?.username;
  const targetUsername = username || currentUser?.username;

  const { data: profile } = useUserProfile(targetUsername!);
  const { data: postsData, fetchNextPage: fetchPosts, hasNextPage: hasMorePosts, isFetchingNextPage: isLoadingPosts } = useUserPosts(
    profile?._id || '',
    { tab: activeTab as any }
  );
  const { data: likedData, fetchNextPage: fetchLiked, hasNextPage: hasMoreLiked, isFetchingNextPage: isLoadingLiked } = useLikedPosts(
    profile?._id || ''
  );
  const { data: followersData, fetchNextPage: fetchFollowers, hasNextPage: hasMoreFollowers } = useFollowers(profile?._id || '');
  const { data: followingData, fetchNextPage: fetchFollowing, hasNextPage: hasMoreFollowing } = useFollowing(profile?._id || '');

  const { followUser } = useFollowUser();
  const { openUserProfile } = useUIStore();
  const [activeTab, setActiveTab] = React.useState<ProfileTab>('posts');
  const [showFollowers, setShowFollowers] = React.useState(false);
  const [showFollowing, setShowFollowing] = React.useState(false);

  const posts = React.useMemo(() => {
    if (!postsData) return [];
    return postsData.pages.flatMap(page => page.items);
  }, [postsData]);

  const likedPosts = React.useMemo(() => {
    if (!likedData) return [];
    return likedData.pages.flatMap(page => page.items);
  }, [likedData]);

  const followers = React.useMemo(() => {
    if (!followersData) return [];
    return followersData.pages.flatMap(page => page.items);
  }, [followersData]);

  const following = React.useMemo(() => {
    if (!followingData) return [];
    return followingData.pages.flatMap(page => page.items);
  }, [followingData]);

  const currentPosts = activeTab === 'likes' ? likedPosts : posts;
  const hasMore = activeTab === 'likes' ? hasMoreLiked : hasMorePosts;
  const isLoadingMore = activeTab === 'likes' ? isLoadingLiked : isLoadingPosts;
  const fetchMore = activeTab === 'likes' ? fetchLiked : fetchPosts;

  const handleFollow = () => {
    if (profile && !isOwnProfile) {
      followUser.mutate({ userId: profile._id, isFollowing: profile.isFollowing });
    }
  };

  if (!profile) {
    return (
      <View className={tw`flex-1 items-center justify-center`}>
        <Ionicons name="refresh" size={32} color="#0ea5e9" className={tw`animate-spin`} />
      </View>
    );
  }

  const renderUserItem = (user: any) => (
    <Pressable
      onPress={() => openUserProfile(user)}
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
      {!isOwnProfile && user._id !== currentUser?._id && (
        <Button
          variant={user.isFollowing ? 'secondary' : 'primary'}
          size="sm"
          onPress={() => followUser.mutate({ userId: user._id, isFollowing: user.isFollowing })}
          disabled={followUser.isPending}
        >
          {user.isFollowing ? 'Following' : 'Follow'}
        </Button>
      )}
    </Pressable>
  );

  const renderPostItem = (post: any) => (
    <PostCard
      post={post}
      isCompact
      onPress={() => {}}
      onCommentPress={() => {}}
    />
  );

  const headerHeight = 200;

  return (
    <View className={tw`flex-1 bg-surface-50 dark:bg-surface-950`}>
      <View className={tw`relative`}>
        {profile.coverImage && (
          <Image
            source={{ uri: profile.coverImage }}
            className={tw`absolute top-0 left-0 right-0 h-[200px] w-full bg-cover`}
            style={StyleSheet.absoluteFill}
          />
        )}
        <View className={tw`absolute bottom-0 left-0 right-0 pb-4 px-4`}>
          <View className={tw`flex-row items-end justify-between`}>
            <View className={tw`flex-row items-end gap-4 -mb-6`}>
              <Avatar
                source={profile.avatar}
                name={profile.displayName}
                size="2xl"
                className={tw`border-4 border-white dark:border-surface-900`}
              />
              {isOwnProfile ? (
                <Button variant="secondary" size="md" className={tw`mb-6`}>
                  Edit Profile
                </Button>
              ) : profile.isFollowing ? (
                <Button variant="secondary" size="md" className={tw`mb-6`} onPress={handleFollow}>
                  Following
                </Button>
              ) : (
                <Button variant="primary" size="md" className={tw`mb-6`} onPress={handleFollow}>
                  Follow
                </Button>
              )}
            </View>
          </View>
        </View>
      </View>

      <View className={tw`px-4 pt-6 pb-4`}>
        <View className={tw`flex-row items-center justify-between mb-4`}>
          <View>
            <Text className={tw`text-xl font-bold text-surface-900 dark:text-surface-50`}>
              {profile.displayName}
            </Text>
            <Text className={tw`text-surface-500 dark:text-surface-400`}>
              @{profile.username}
            </Text>
          </View>
          <View className={tw`flex-row items-center gap-4`}>
            <Pressable onPress={() => setShowFollowers(true)} className={tw`flex-col items-center`}>
              <Text className={tw`font-bold text-surface-900 dark:text-surface-50`}>{profile.followersCount}</Text>
              <Text className={tw`text-xs text-surface-500 dark:text-surface-400`}>Followers</Text>
            </Pressable>
            <Pressable onPress={() => setShowFollowing(true)} className={tw`flex-col items-center`}>
              <Text className={tw`font-bold text-surface-900 dark:text-surface-50`}>{profile.followingCount}</Text>
              <Text className={tw`text-xs text-surface-500 dark:text-surface-400`}>Following</Text>
            </Pressable>
          </View>
        </View>

        {profile.bio && (
          <Text className={tw`text-surface-900 dark:text-surface-50 mb-3`}>{profile.bio}</Text>
        )}

        {profile.location && (
          <View className={tw`flex-row items-center gap-1.5 text-sm text-surface-500 dark:text-surface-400 mb-1`}>
            <Ionicons name="location-outline" size={16} />
            <Text>{profile.location}</Text>
          </View>
        )}

        {profile.website && (
          <View className={tw`flex-row items-center gap-1.5 text-sm text-primary-600 dark:text-primary-400 mb-1`}>
            <Ionicons name="link-outline" size={16} />
            <Text>{profile.website}</Text>
          </View>
        )}

        <View className={tw`flex-row items-center gap-1.5 text-sm text-surface-500 dark:text-surface-400`}>
          <Ionicons name="calendar-outline" size={16} />
          <Text>Joined {formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true })}</Text>
        </View>
      </View>

      <View className={tw`border-t border-b border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900`}>
        <View className={tw`flex-row overflow-x-auto px-4`}>
          {(['posts', 'replies', 'media', 'likes'] as ProfileTab[]).map(tab => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={tw`py-3 px-4 border-b-2 flex-shrink-0 ${activeTab === tab ? 'border-primary-600 text-primary-600' : 'border-transparent text-surface-500'}`}
            >
              <Text className={tw`font-medium text-sm ${activeTab === tab ? 'font-semibold' : ''}`}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {showFollowers && (
        <View className={tw`fixed inset-0 z-50 bg-white dark:bg-surface-900 flex-col`}>
          <View className={tw`flex-row items-center justify-between p-4 border-b border-surface-200 dark:border-surface-700`}>
            <Pressable onPress={() => setShowFollowers(false)} className={tw`p-2`}>
              <Ionicons name="chevron-back" size={28} color="#71717a" />
            </Pressable>
            <Text className={tw`text-lg font-semibold text-surface-900 dark:text-surface-50`}>Followers</Text>
            <View className={tw`w-10`} />
          </View>
          <FlatList
            data={followers}
            keyExtractor={(u) => u._id}
            renderItem={({ item }) => renderUserItem(item)}
            onEndReached={() => {
              if (hasMoreFollowers) fetchFollowers();
            }}
            onEndReachedThreshold={0.5}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={tw`pb-20`}
          />
        </View>
      )}

      {showFollowing && (
        <View className={tw`fixed inset-0 z-50 bg-white dark:bg-surface-900 flex-col`}>
          <View className={tw`flex-row items-center justify-between p-4 border-b border-surface-200 dark:border-surface-700`}>
            <Pressable onPress={() => setShowFollowing(false)} className={tw`p-2`}>
              <Ionicons name="chevron-back" size={28} color="#71717a" />
            </Pressable>
            <Text className={tw`text-lg font-semibold text-surface-900 dark:text-surface-50`}>Following</Text>
            <View className={tw`w-10`} />
          </View>
          <FlatList
            data={following}
            keyExtractor={(u) => u._id}
            renderItem={({ item }) => renderUserItem(item)}
            onEndReached={() => {
              if (hasMoreFollowing) fetchFollowing();
            }}
            onEndReachedThreshold={0.5}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={tw`pb-20`}
          />
        </View>
      )}

      <FlatList
        data={currentPosts}
        keyExtractor={(p) => p._id}
        renderItem={({ item }) => renderPostItem(item)}
        onEndReached={() => {
          if (hasMore && !isLoadingMore) {
            fetchMore();
          }
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          currentPosts.length === 0 && (
            <View className={tw`flex-1 items-center justify-center py-12 px-4`}>
              <Ionicons name={activeTab === 'likes' ? 'heart-outline' : 'document-text-outline'} size={64} color="#a1a1aa" />
              <Text className={tw`mt-4 text-lg font-medium text-surface-600 dark:text-surface-400 text-center`}>
                {activeTab === 'likes' ? 'No liked thoughts yet' : 'No thoughts yet'}
              </Text>
              <Text className={tw`mt-2 text-surface-500 dark:text-surface-400 text-center px-4`}>
                {activeTab === 'likes' 
                  ? 'Thoughts you like will appear here' 
                  : isOwnProfile 
                    ? 'Share your first thought!'
                    : 'This user hasn\'t shared any thoughts yet'}
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          hasMore && (
            <View className={tw`py-4 flex-row items-center justify-center gap-2`}>
              <Ionicons name="refresh" size={20} color="#71717a" className={tw`animate-spin`} />
              <Text className={tw`text-surface-500 dark:text-surface-400 text-sm`}>Loading more...</Text>
            </View>
          )
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw`pb-20`}
      />
    </View>
  );
}