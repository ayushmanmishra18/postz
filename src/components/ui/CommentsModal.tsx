import React from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useComments, useCreateComment, useDeleteComment, useLikeComment } from '@/hooks/useComments';
import { useAuthStore } from '@/store/authStore';
import { Comment } from '@/types';
import { Avatar } from './Avatar';

interface CommentsModalProps {
  visible: boolean;
  postId: string;
  onClose: () => void;
}

export function CommentsModal({ visible, postId, onClose }: CommentsModalProps) {
  const currentUser = useAuthStore((s) => s.user);
  const [text, setText] = React.useState('');
  const [replyTo, setReplyTo] = React.useState<Comment | null>(null);
  const comments = useComments(postId, visible);
  const createComment = useCreateComment();
  const likeComment = useLikeComment();
  const deleteComment = useDeleteComment();

  const items = React.useMemo(
    () => comments.data?.pages.flatMap((page) => page.items) ?? [],
    [comments.data]
  );

  const submit = async () => {
    const content = text.trim();
    if (!content || createComment.isPending) return;
    await createComment.mutateAsync({
      postId,
      content,
      parentCommentId: replyTo?._id,
    });
    setText('');
    setReplyTo(null);
  };

  const renderItem = ({ item }: { item: Comment }) => {
    const author = item.author as any;
    const isMine = author?._id === currentUser?._id;
    return (
      <View className="flex-row gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <Avatar source={author?.avatar} name={author?.displayName} size="sm" />
        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2 flex-1">
              <Text className="font-semibold text-slate-900 dark:text-white" numberOfLines={1}>{author?.displayName || 'User'}</Text>
              <Text className="text-xs text-slate-400" numberOfLines={1}>@{author?.username || 'user'}</Text>
            </View>
            {isMine && (
              <Pressable onPress={() => deleteComment.mutate(item._id)} hitSlop={8}>
                <Ionicons name="trash-outline" size={17} color="#94a3b8" />
              </Pressable>
            )}
          </View>
          <Text className="mt-1 text-[15px] leading-5 text-slate-700 dark:text-slate-300">{item.content}</Text>
          <View className="flex-row items-center gap-5 mt-2">
            <Pressable onPress={() => likeComment.mutate({ commentId: item._id, isLiked: item.isLiked })} className="flex-row items-center gap-1.5">
              <Ionicons name={item.isLiked ? 'heart' : 'heart-outline'} size={17} color={item.isLiked ? '#ef4444' : '#94a3b8'} />
              <Text className="text-xs text-slate-500">{item.likesCount || ''}</Text>
            </Pressable>
            <Pressable onPress={() => setReplyTo(item)} className="flex-row items-center gap-1.5">
              <Ionicons name="return-down-forward-outline" size={17} color="#94a3b8" />
              <Text className="text-xs font-medium text-slate-500">Reply</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView className="flex-1 bg-white dark:bg-slate-950" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="pt-2">
          <View className="h-12 flex-row items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
            <View className="w-10" />
            <Text className="text-base font-bold text-slate-900 dark:text-white">Comments</Text>
            <Pressable onPress={onClose} className="w-10 h-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <Ionicons name="close" size={21} color="#64748b" />
            </Pressable>
          </View>
          {comments.isLoading ? (
            <View className="flex-1 items-center justify-center"><ActivityIndicator color="#0284c7" /></View>
          ) : comments.isError ? (
            <View className="flex-1 items-center justify-center px-8">
              <Ionicons name="chatbubble-ellipses-outline" size={40} color="#94a3b8" />
              <Text className="mt-3 text-center font-semibold text-slate-900 dark:text-white">Couldn't load comments</Text>
              <Pressable onPress={() => comments.refetch()} className="mt-4 rounded-xl bg-primary-600 px-4 py-2.5">
                <Text className="font-semibold text-white">Try again</Text>
              </Pressable>
            </View>
          ) : (
            <FlatList
              data={items}
              keyExtractor={(item) => item._id}
              renderItem={renderItem}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              onEndReached={() => comments.hasNextPage && !comments.isFetchingNextPage && comments.fetchNextPage()}
              onEndReachedThreshold={0.5}
              ListEmptyComponent={<View className="items-center px-8 py-16"><Ionicons name="chatbubble-outline" size={42} color="#cbd5e1" /><Text className="mt-3 text-slate-500">Be the first to comment.</Text></View>}
            />
          )}
          <View className="border-t border-slate-200 dark:border-slate-800 px-3 pt-2 pb-3">
            {replyTo && (
              <View className="mb-2 flex-row items-center justify-between rounded-xl bg-primary-50 dark:bg-primary-900/20 px-3 py-2">
                <Text className="flex-1 text-xs text-primary-700 dark:text-primary-300">Replying to @{(replyTo.author as any)?.username || 'user'}</Text>
                <Pressable onPress={() => setReplyTo(null)}><Ionicons name="close" size={17} color="#0284c7" /></Pressable>
              </View>
            )}
            <View className="flex-row items-end gap-2">
              <Avatar source={currentUser?.avatar} name={currentUser?.displayName} size="sm" />
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder={replyTo ? 'Write a reply...' : 'Write a comment...'}
                placeholderTextColor="#94a3b8"
                multiline
                maxLength={1000}
                className="max-h-28 flex-1 rounded-2xl bg-slate-100 dark:bg-slate-900 px-4 py-2.5 text-[15px] text-slate-900 dark:text-white"
              />
              <Pressable
                onPress={submit}
                disabled={!text.trim() || createComment.isPending}
                className="h-11 w-11 items-center justify-center rounded-full bg-primary-600 disabled:opacity-40"
              >
                <Ionicons name="arrow-up" size={20} color="white" />
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
