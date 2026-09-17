import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { commentsApi } from '@/api/comments';
import { queryKeys } from '@/lib/queryClient';
import { Comment } from '@/types';
import Toast from 'react-native-toast-message';

export function useComments(postId: string, enabled = true) {
  return useInfiniteQuery({
    queryKey: queryKeys.posts.comments(postId),
    queryFn: ({ pageParam }) => commentsApi.getComments(postId, { cursor: pageParam }),
    getNextPageParam: (lastPage) => lastPage.hasNextPage ? lastPage.items[lastPage.items.length - 1]?._id : undefined,
    initialPageParam: undefined,
    enabled: enabled && !!postId,
    staleTime: 1000 * 60 * 1,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, content, parentCommentId }: { postId: string; content: string; parentCommentId?: string }) =>
      commentsApi.createComment(postId, content, parentCommentId),
    onMutate: async ({ postId, content, parentCommentId }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.comments(postId) });
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.detail(postId) });

      const previousComments = queryClient.getQueryData(queryKeys.posts.comments(postId));
      const previousPost = queryClient.getQueryData(queryKeys.posts.detail(postId));

      const optimisticComment: Comment = {
        _id: `temp-${Date.now()}`,
        post: postId,
        author: queryClient.getQueryData(queryKeys.auth.me) as any,
        content,
        likesCount: 0,
        isLiked: false,
        parentComment: parentCommentId,
        repliesCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      queryClient.setQueryData(queryKeys.posts.comments(postId), (old: any) => {
        if (!old) return old;
        if (parentCommentId) {
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              items: page.items.map((c: Comment) => 
                c._id === parentCommentId ? { ...c, repliesCount: c.repliesCount + 1 } : c
              ),
            })),
          };
        }
        return {
          ...old,
          pages: old.pages.map((page: any, i: number) =>
            i === 0 ? { ...page, items: [optimisticComment, ...page.items] } : page
          ),
        };
      });

      queryClient.setQueryData(queryKeys.posts.detail(postId), (old: any) =>
        old ? { ...old, commentsCount: old.commentsCount + 1 } : old
      );

      return { previousComments, previousPost };
    },
    onError: (err, { postId }, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(queryKeys.posts.comments(postId), context.previousComments);
      }
      if (context?.previousPost) {
        queryClient.setQueryData(queryKeys.posts.detail(postId), context.previousPost);
      }
      Toast.show({ type: 'error', text1: 'Failed to comment', text2: 'Please try again' });
    },
    onSuccess: (comment, { postId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.comments(postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(postId) });
    },
  });
}

export function useLikeComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, isLiked }: { commentId: string; isLiked: boolean }) =>
      isLiked ? commentsApi.unlikeComment(commentId) : commentsApi.likeComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.comments('') });
    },
    onError: () => {
      Toast.show({ type: 'error', text1: 'Failed to update like', text2: 'Please try again' });
    },
  });
}
export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => commentsApi.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.comments('') });
      Toast.show({ type: 'success', text1: 'Comment deleted' });
    },
    onError: () => {
      Toast.show({ type: 'error', text1: 'Failed to delete', text2: 'Please try again' });
    },
  });
}