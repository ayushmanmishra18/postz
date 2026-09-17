import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { usersApi } from '@/api/users';
import { queryKeys } from '@/lib/queryClient';
import { User, SearchUsersParams, UpdateProfileInput } from '@/types';
import Toast from 'react-native-toast-message';

export function useUserProfile(username: string) {
  return useQuery({
    queryKey: queryKeys.users.profile(username),
    queryFn: () => usersApi.getProfile(username),
    enabled: !!username,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUserProfileById(userId: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: () => usersApi.getProfileById(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useFollowers(userId: string, params?: { page?: number; limit?: number }) {
  return useInfiniteQuery({
    queryKey: queryKeys.users.followers(userId, params),
    queryFn: ({ pageParam }) => usersApi.getFollowers(userId, { ...params, page: pageParam }),
    getNextPageParam: (lastPage, allPages) => lastPage.hasNextPage ? allPages.length + 1 : undefined,
    initialPageParam: 1,
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useFollowing(userId: string, params?: { page?: number; limit?: number }) {
  return useInfiniteQuery({
    queryKey: queryKeys.users.following(userId, params),
    queryFn: ({ pageParam }) => usersApi.getFollowing(userId, { ...params, page: pageParam }),
    getNextPageParam: (lastPage, allPages) => lastPage.hasNextPage ? allPages.length + 1 : undefined,
    initialPageParam: 1,
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useSearchUsers(query: string, params?: SearchUsersParams) {
  return useInfiniteQuery({
    queryKey: queryKeys.users.search(query, params),
    queryFn: ({ pageParam }) => usersApi.searchUsers({ ...params, query, page: pageParam }),
    getNextPageParam: (lastPage, allPages) => lastPage.hasNextPage ? allPages.length + 1 : undefined,
    initialPageParam: 1,
    enabled: query.length >= 2,
    staleTime: 1000 * 60 * 1,
  });
}

export function useUserSuggestions() {
  return useQuery({
    queryKey: queryKeys.users.suggestions,
    queryFn: usersApi.getSuggestions,
    staleTime: 1000 * 60 * 10,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileInput) => usersApi.updateProfile(data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(queryKeys.auth.me, updatedUser);
      queryClient.invalidateQueries({ queryKey: queryKeys.users.profile(updatedUser.username) });
      Toast.show({ type: 'success', text1: 'Profile updated', text2: 'Changes saved successfully' });
    },
    onError: (error: any) => {
      Toast.show({ type: 'error', text1: 'Update failed', text2: error.response?.data?.error || 'Please try again' });
    },
  });
}

export function useFollowUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, isFollowing }: { userId: string; isFollowing: boolean }) =>
      isFollowing ? usersApi.unfollowUser(userId) : usersApi.followUser(userId),
    onMutate: async ({ userId, isFollowing }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.users.detail(userId) });
      await queryClient.cancelQueries({ queryKey: queryKeys.users.profile('') });

      const previousUser = queryClient.getQueryData(queryKeys.users.detail(userId));

      queryClient.setQueryData(queryKeys.users.detail(userId), (old: User | undefined) => {
        if (!old) return old;
        return {
          ...old,
          isFollowing: !isFollowing,
          followersCount: isFollowing ? old.followersCount - 1 : old.followersCount + 1,
        };
      });

      return { previousUser };
    },
    onError: (err, { userId }, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(queryKeys.users.detail(userId), context.previousUser);
      }
      Toast.show({ type: 'error', text1: 'Failed', text2: 'Please try again' });
    },
    onSettled: (data, error, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
}

export function useUploadAvatar() {
  return useMutation({
    mutationFn: (uri: string) => usersApi.uploadAvatar(uri),
    onError: () => Toast.show({ type: 'error', text1: 'Upload failed', text2: 'Failed to upload avatar' }),
  });
}

export function useUploadCover() {
  return useMutation({
    mutationFn: (uri: string) => usersApi.uploadCover(uri),
    onError: () => Toast.show({ type: 'error', text1: 'Upload failed', text2: 'Failed to upload cover' }),
  });
}

export function useCheckUsername() {
  return useMutation({
    mutationFn: (username: string) => usersApi.checkUsername(username),
  });
}