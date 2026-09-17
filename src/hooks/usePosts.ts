import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { postsApi } from '@/api/posts';
import { queryKeys } from '@/lib/queryClient';
import { CreatePostInput, Post, FeedParams, UserPostsParams } from '@/types';
import Toast from 'react-native-toast-message';

export function useFeed(params?: FeedParams) {
  return useInfiniteQuery({
    queryKey: queryKeys.posts.feed(params),
    queryFn: ({ pageParam }) => postsApi.getFeed({ ...params, cursor: pageParam as string | undefined }),
    getNextPageParam: (lastPage) => lastPage.hasNextPage ? lastPage.items[lastPage.items.length - 1]?._id : undefined,
    initialPageParam: undefined as string | undefined,
    staleTime: 1000 * 60 * 2,
  });
}

export function usePost(postId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.posts.detail(postId),
    queryFn: () => postsApi.getPost(postId),
    enabled: enabled && !!postId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUserPosts(userId: string, params?: UserPostsParams) {
  return useInfiniteQuery({
    queryKey: queryKeys.posts.userPosts(userId, params),
    queryFn: ({ pageParam }) => postsApi.getUserPosts(userId, { ...params, cursor: pageParam as string | undefined }),
    getNextPageParam: (lastPage) => lastPage.hasNextPage ? lastPage.items[lastPage.items.length - 1]?._id : undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useLikedPosts(userId: string, params?: FeedParams) {
  return useInfiniteQuery({
    queryKey: queryKeys.posts.liked(userId, params),
    queryFn: ({ pageParam }) => postsApi.getLikedPosts(userId, { ...params, cursor: pageParam as string | undefined }),
    getNextPageParam: (lastPage) => lastPage.hasNextPage ? lastPage.items[lastPage.items.length - 1]?._id : undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useSavedPosts(params?: FeedParams) {
  return useInfiniteQuery({
    queryKey: queryKeys.posts.saved(params),
    queryFn: ({ pageParam }) => postsApi.getSavedPosts({ ...params, cursor: pageParam as string | undefined }),
    getNextPageParam: (lastPage) => lastPage.hasNextPage ? lastPage.items[lastPage.items.length - 1]?._id : undefined,
    initialPageParam: undefined as string | undefined,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostInput) => postsApi.createPost(data),
    onMutate: async (newPost) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.feed() });
      const previousFeed = queryClient.getQueryData(queryKeys.posts.feed());
      
      const optimisticPost: Post = {
        _id: `temp-${Date.now()}`,
        author: queryClient.getQueryData(queryKeys.auth.me) as any,
        content: newPost.content,
        images: newPost.images || [],
        likesCount: 0,
        commentsCount: 0,
        savesCount: 0,
        sharesCount: 0,
        isLiked: false,
        isSaved: false,
        isReposted: false,
        visibility: newPost.visibility || 'public',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      queryClient.setQueryData(queryKeys.posts.feed(), (old: any) => ({
        ...old,
        pages: old.pages.map((page: any, i: number) => 
          i === 0 ? { ...page, items: [optimisticPost, ...page.items] } : page
        ),
      }));

      return { previousFeed };
    },
    onError: (err, newPost, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(queryKeys.posts.feed(), context.previousFeed);
      }
      Toast.show({ type: 'error', text1: 'Failed to post', text2: 'Please try again' });
    },
    onSuccess: (post) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.feed() });
      Toast.show({ type: 'success', text1: 'Posted!', text2: 'Your thought has been shared' });
    },
  });
}

export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, isLiked }: { postId: string; isLiked: boolean }) => 
      isLiked ? postsApi.unlikePost(postId) : postsApi.likePost(postId),
    onMutate: async ({ postId, isLiked }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.detail(postId) });
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.feed() });

      const previousPost = queryClient.getQueryData(queryKeys.posts.detail(postId));
      const previousFeed = queryClient.getQueryData(queryKeys.posts.feed());

      const updatePost = (post: Post) => ({
        ...post,
        isLiked: !isLiked,
        likesCount: isLiked ? post.likesCount - 1 : post.likesCount + 1,
      });

      queryClient.setQueryData(queryKeys.posts.detail(postId), (old: Post | undefined) => 
        old ? updatePost(old) : old
      );

      queryClient.setQueryData(queryKeys.posts.feed(), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            items: page.items.map((p: Post) => p._id === postId ? updatePost(p) : p),
          })),
        };
      });

      return { previousPost, previousFeed };
    },
    onError: (err, { postId }, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(queryKeys.posts.detail(postId), context.previousPost);
      }
      if (context?.previousFeed) {
        queryClient.setQueryData(queryKeys.posts.feed(), context.previousFeed);
      }
    },
    onSettled: (data, error, { postId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(postId) });
    },
  });
}

export function useSavePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, isSaved }: { postId: string; isSaved: boolean }) => 
      isSaved ? postsApi.unsavePost(postId) : postsApi.savePost(postId),
    onMutate: async ({ postId, isSaved }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.detail(postId) });
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.feed() });
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.saved() });

      const previousPost = queryClient.getQueryData(queryKeys.posts.detail(postId));
      const previousFeed = queryClient.getQueryData(queryKeys.posts.feed());
      const previousSaved = queryClient.getQueryData(queryKeys.posts.saved());

      const updatePost = (post: Post) => ({
        ...post,
        isSaved: !isSaved,
        savesCount: isSaved ? post.savesCount - 1 : post.savesCount + 1,
      });

      queryClient.setQueryData(queryKeys.posts.detail(postId), (old: Post | undefined) => 
        old ? updatePost(old) : old
      );

      queryClient.setQueryData(queryKeys.posts.feed(), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            items: page.items.map((p: Post) => p._id === postId ? updatePost(p) : p),
          })),
        };
      });

      return { previousPost, previousFeed, previousSaved };
    },
    onError: (err, { postId }, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(queryKeys.posts.detail(postId), context.previousPost);
      }
      if (context?.previousFeed) {
        queryClient.setQueryData(queryKeys.posts.feed(), context.previousFeed);
      }
      if (context?.previousSaved) {
        queryClient.setQueryData(queryKeys.posts.saved(), context.previousSaved);
      }
    },
    onSettled: (data, error, { postId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.saved() });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => postsApi.deletePost(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.feed() });
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.userPosts('') });

      const previousFeed = queryClient.getQueryData(queryKeys.posts.feed());

      queryClient.setQueryData(queryKeys.posts.feed(), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            items: page.items.filter((p: Post) => p._id !== postId),
          })),
        };
      });

      return { previousFeed };
    },
    onError: (err, postId, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(queryKeys.posts.feed(), context.previousFeed);
      }
      Toast.show({ type: 'error', text1: 'Failed to delete', text2: 'Please try again' });
    },
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Post deleted', text2: 'Your thought has been removed' });
    },
  });
}

export function useUploadImages() {
  return useMutation({
    mutationFn: (images: string[]) => postsApi.uploadImages(images),
    onError: () => {
      Toast.show({ type: 'error', text1: 'Upload failed', text2: 'Failed to upload images' });
    },
  });
}