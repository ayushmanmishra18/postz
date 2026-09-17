import { api } from '@/lib/api';
import { User, PaginatedResponse, SearchUsersParams, UpdateProfileInput } from '@/types';

export const usersApi = {
  getProfile: async (username: string): Promise<User> => {
    const response = await api.get<User>(`/users/${username}`);
    return response.data;
  },

  getProfileById: async (userId: string): Promise<User> => {
    const response = await api.get<User>(`/users/id/${userId}`);
    return response.data;
  },

  updateProfile: async (data: UpdateProfileInput): Promise<User> => {
    const response = await api.patch<User>('/users/me', data);
    return response.data;
  },

  uploadAvatar: async (uri: string): Promise<{ avatar: string }> => {
    const formData = new FormData();
    formData.append('avatar', {
      uri,
      name: 'avatar.jpg',
      type: 'image/jpeg',
    } as any);
    const response = await api.upload<{ avatar: string }>('/users/me/avatar', formData);
    return response.data;
  },

  uploadCover: async (uri: string): Promise<{ coverImage: string }> => {
    const formData = new FormData();
    formData.append('coverImage', {
      uri,
      name: 'cover.jpg',
      type: 'image/jpeg',
    } as any);
    const response = await api.upload<{ coverImage: string }>('/users/me/cover', formData);
    return response.data;
  },

  followUser: async (userId: string): Promise<{ isFollowing: boolean; followersCount: number }> => {
    const response = await api.post<{ isFollowing: boolean; followersCount: number }>(`/users/${userId}/follow`);
    return response.data;
  },

  unfollowUser: async (userId: string): Promise<{ isFollowing: boolean; followersCount: number }> => {
    const response = await api.delete<{ isFollowing: boolean; followersCount: number }>(`/users/${userId}/follow`);
    return response.data;
  },

  getFollowers: async (userId: string, params?: { page?: number; limit?: number }): Promise<PaginatedResponse<User>> => {
    const response = await api.get<PaginatedResponse<User>>(`/users/${userId}/followers`, { params });
    return response.data;
  },

  getFollowing: async (userId: string, params?: { page?: number; limit?: number }): Promise<PaginatedResponse<User>> => {
    const response = await api.get<PaginatedResponse<User>>(`/users/${userId}/following`, { params });
    return response.data;
  },

  searchUsers: async (params: SearchUsersParams): Promise<PaginatedResponse<User>> => {
    const response = await api.get<PaginatedResponse<User>>('/users/search', { params });
    return response.data;
  },

  getSuggestions: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users/suggestions');
    return response.data;
  },

  checkUsername: async (username: string): Promise<{ available: boolean }> => {
    const response = await api.get<{ available: boolean }>(`/users/check-username/${username}`);
    return response.data;
  },
};