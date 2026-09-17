import React from 'react';
import { View, Text, Image, Pressable, StyleSheet, Dimensions, Alert, Share } from 'react-native';
import { tw } from '@/lib/tw';
import { Ionicons } from '@expo/vector-icons';
import { Post } from '@/types';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { useLikePost, useSavePost, useDeletePost } from '@/hooks/usePosts';
import { formatDistanceToNow } from 'date-fns';
import { useUIStore } from '@/store/uiStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_WIDTH = SCREEN_WIDTH - 32;

interface PostCardProps {
  post: Post;
  onPress?: () => void;
  onCommentPress?: () => void;
  onProfilePress?: () => void;
  showFullContent?: boolean;
  isCompact?: boolean;
}

export function PostCard({
  post,
  onPress,
  onCommentPress,
  onProfilePress,
  showFullContent = false,
  isCompact = false,
}: PostCardProps) {
  const likePost = useLikePost();
  const savePost = useSavePost();
  const deletePost = useDeletePost();
  const { openCommentSheet, openUserProfile } = useUIStore();

  const author = post.author as any;
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
  const hasImages = post.images && post.images.length > 0;

  const handleLike = () => {
    likePost.mutate({ postId: post._id, isLiked: post.isLiked });
  };

  const handleSave = () => {
    savePost.mutate({ postId: post._id, isSaved: post.isSaved });
  };

  const handleDelete = () => {
    Alert.alert('Delete thought?', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deletePost.mutate(post._id) },
    ]);
  };

  const handleComment = () => {
    if (onCommentPress) {
      onCommentPress();
    } else {
      openCommentSheet(post);
    }
  };

  const handleProfile = () => {
    if (onProfilePress) {
      onProfilePress();
    } else if (author) {
      openUserProfile(author);
    }
  };

  if (isCompact) {
    return (
      <Pressable onPress={onPress} className={tw`bg-white dark:bg-surface-900 p-4`}>
        <View className={tw`flex-row gap-3`}>
          <Pressable onPress={handleProfile} className={tw`flex-shrink-0`}>
            <Avatar source={author?.avatar} name={author?.displayName} size="sm" />
          </Pressable>
          <View className={tw`flex-1 min-w-0`}>
            <View className={tw`flex-row items-center justify-between`}>
              <View className={tw`flex-row items-center gap-2 flex-1 min-w-0`}>
                <Text className={tw`font-semibold text-surface-900 dark:text-surface-50 truncate`}>
                  {author?.displayName}
                </Text>
                <Text className={tw`text-sm text-surface-500 dark:text-surface-400`}>
                  @{author?.username} · {timeAgo}
                </Text>
              </View>
            </View>
            <Text className={tw`mt-1 text-surface-900 dark:text-surface-500 text-sm line-clamp-2`}>
              {post.content}
            </Text>
            {hasImages && (
              <View className={tw`mt-2 flex-row gap-2 overflow-x-auto pb-2`}>
                {post.images.slice(0, 4).map((image, index) => (
                  <Image
                    key={index}
                    source={{ uri: image }}
                    className={tw`w-24 h-24 rounded-lg bg-cover flex-shrink-0`}
                  />
                ))}
                {post.images.length > 4 && (
                  <View className={tw`w-24 h-24 rounded-lg bg-surface-200 dark:bg-surface-700 flex-shrink-0 items-center justify-center`}>
                    <Text className={tw`text-surface-500 text-sm font-medium`}>+{post.images.length - 4}</Text>
                  </View>
                )}
              </View>
            )}
            <View className={tw`mt-3 flex-row items-center gap-4 text-sm text-surface-500 dark:text-surface-400`}>
              <Pressable onPress={handleLike} className={tw`flex-row items-center gap-1.5`}>
                <Ionicons
                  name={post.isLiked ? 'heart' : 'heart-outline'}
                  size={20}
                  color={post.isLiked ? '#ef4444' : undefined}
                />
                <Text>{post.likesCount}</Text>
              </Pressable>
              <Pressable onPress={handleComment} className={tw`flex-row items-center gap-1.5`}>
                <Ionicons name="chatbubble-outline" size={20} />
                <Text>{post.commentsCount}</Text>
              </Pressable>
              <Pressable onPress={handleSave} className={tw`flex-row items-center gap-1.5`}>
                <Ionicons
                  name={post.isSaved ? 'bookmark' : 'bookmark-outline'}
                  size={20}
                  color={post.isSaved ? '#0ea5e9' : undefined}
                />
                <Text>{post.savesCount}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <View className={tw`bg-white dark:bg-surface-900`}>
      <Pressable onPress={handleProfile} className={tw`p-4 flex-row items-center gap-3`}>
        <Avatar source={author?.avatar} name={author?.displayName} size="md" />
        <View className={tw`flex-1 min-w-0`}>
          <View className={tw`flex-row items-center gap-2`}>
            <Text className={tw`font-semibold text-surface-900 dark:text-surface-50 truncate`}>
              {author?.displayName}
            </Text>
            {author?.isVerified && (
              <Ionicons name="checkmark-circle" size={16} color="#0ea5e9" />
            )}
          </View>
          <View className={tw`flex-row items-center gap-2`}>
            <Text className={tw`text-sm text-surface-500 dark:text-surface-400`}>
              @{author?.username}
            </Text>
            <Text className={tw`text-sm text-surface-400 dark:text-surface-500`}>·</Text>
            <Text className={tw`text-sm text-surface-500 dark:text-surface-400`}>{timeAgo}</Text>
          </View>
        </View>
      </Pressable>

      <Pressable onPress={onPress} className={tw`px-4 pb-3`}>
        <Text className={tw`text-surface-900 dark:text-surface-50 text-base leading-relaxed ${showFullContent ? '' : 'line-clamp-4'}`}>
          {post.content}
        </Text>
      </Pressable>

      {hasImages && (
        <View className={tw`px-4 pb-3`}>
          {post.images.length === 1 ? (
            <Image
              source={{ uri: post.images[0] }}
              className={tw`w-full h-64 rounded-xl bg-cover`}
              style={{ maxHeight: IMAGE_WIDTH }}
            />
          ) : post.images.length === 2 ? (
            <View className={tw`flex-row gap-2`}>
              {post.images.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  className={tw`flex-1 h-48 rounded-xl bg-cover`}
                />
              ))}
            </View>
          ) : post.images.length === 3 ? (
            <View className={tw`flex-row gap-2`}>
              <Image
                source={{ uri: post.images[0] }}
                className={tw`flex-1 h-48 rounded-xl bg-cover`}
              />
              <View className={tw`flex-1 flex-col gap-2`}>
                <Image
                  source={{ uri: post.images[1] }}
                  className={tw`flex-1 rounded-xl bg-cover`}
                />
                <Image
                  source={{ uri: post.images[2] }}
                  className={tw`flex-1 rounded-xl bg-cover`}
                />
              </View>
            </View>
          ) : (
            <View className={tw`flex-row gap-2`}>
              <Image
                source={{ uri: post.images[0] }}
                className={tw`flex-1 h-48 rounded-xl bg-cover`}
              />
              <View className={tw`flex-1 flex-col gap-2`}>
                <Image
                  source={{ uri: post.images[1] }}
                  className={tw`flex-1 rounded-xl bg-cover`}
                />
                <View className={tw`flex-1 flex-row gap-2`}>
                  <Image
                    source={{ uri: post.images[2] }}
                    className={tw`flex-1 rounded-xl bg-cover`}
                  />
                  {post.images.length > 3 && (
                    <View className={tw`flex-1 rounded-xl bg-surface-200 dark:bg-surface-700 items-center justify-center`}>
                      <Text className={tw`text-surface-500 text-lg font-bold`}>+{post.images.length - 3}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}
        </View>
      )}

      <View className={tw`border-t border-surface-200 dark:border-surface-700 px-4 py-3 flex-row items-center justify-between`}>
        <View className={tw`flex-row gap-6`}>
          <Pressable
            onPress={handleLike}
            className={tw`flex-row items-center gap-2 py-1 px-2 rounded-full active:bg-surface-100 dark:active:bg-surface-800`}
            accessibilityLabel={post.isLiked ? 'Unlike' : 'Like'}
          >
            <Ionicons
              name={post.isLiked ? 'heart' : 'heart-outline'}
              size={22}
              color={post.isLiked ? '#ef4444' : '#71717a'}
            />
            <Text className={tw`text-sm font-medium ${post.isLiked ? 'text-red-600' : 'text-surface-600 dark:text-surface-400'}`}>
              {post.likesCount > 0 ? post.likesCount : ''}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleComment}
            className={tw`flex-row items-center gap-2 py-1 px-2 rounded-full active:bg-surface-100 dark:active:bg-surface-800`}
            accessibilityLabel={`Comments: ${post.commentsCount}`}
          >
            <Ionicons name="chatbubble-outline" size={22} color="#71717a" />
            <Text className={tw`text-sm font-medium text-surface-600 dark:text-surface-400`}>
              {post.commentsCount > 0 ? post.commentsCount : ''}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleSave}
            className={tw`flex-row items-center gap-2 py-1 px-2 rounded-full active:bg-surface-100 dark:active:bg-surface-800`}
            accessibilityLabel={post.isSaved ? 'Unsave' : 'Save'}
          >
            <Ionicons
              name={post.isSaved ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color={post.isSaved ? '#0ea5e9' : '#71717a'}
            />
            <Text className={tw`text-sm font-medium ${post.isSaved ? 'text-primary-600' : 'text-surface-600 dark:text-surface-400'}`}>
              {post.savesCount > 0 ? post.savesCount : ''}
            </Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() => Share.share({ message: post.content })}
          className={tw`flex-row items-center gap-2 py-1 px-2 rounded-full active:bg-surface-100 dark:active:bg-surface-800`}
          accessibilityLabel="Share"
        >
          <Ionicons name="share-outline" size={22} color="#71717a" />
        </Pressable>
      </View>
    </View>
  );
}