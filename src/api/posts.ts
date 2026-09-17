import { api } from '@/lib/api';
import { CreatePostInput, Post, PaginatedResponse, FeedParams, UserPostsParams } from '@/types';

export const postsApi = {
  getFeed: async (params?: FeedParams): Promise<PaginatedResponse<Post>> => {
    const response = await api.get<PaginatedResponse<Post>>('/posts/feed', { params });
    return response.data;
  },

  getPost: async (id: string): Promise<Post> => {
    const response = await api.get<Post>(`/posts/${id}`);
    return response.data;
  },

  createPost: async (data: CreatePostInput): Promise<Post> => {
    const response = await api.post<Post>('/posts', data);
    return response.data;
  },

  updatePost: async (id: string, content: string): Promise<Post> => {
    const response = await api.patch<Post>(`/posts/${id}`, { content });
    return response.data;
  },

  deletePost: async (id: string): Promise<void> => {
    await api.delete(`/posts/${id}`);
  },

  likePost: async (id: string): Promise<{ likesCount: number; isLiked: boolean }> => {
    const response = await api.post<{ likesCount: number; isLiked: boolean }>(`/posts/${id}/like`);
    return response.data;
  },

  unlikePost: async (id: string): Promise<{ likesCount: number; isLiked: boolean }> => {
    const response = await api.delete<{ likesCount: number; isLiked: boolean }>(`/posts/${id}/like`);
    return response.data;
  },

  savePost: async (id: string): Promise<{ savesCount: number; isSaved: boolean }> => {
    const response = await api.post<{ savesCount: number; isSaved: boolean }>(`/posts/${id}/save`);
    return response.data;
  },

  unsavePost: async (id: string): Promise<{ savesCount: number; isSaved: boolean }> => {
    const response = await api.delete<{ savesCount: number; isSaved: boolean }>(`/posts/${id}/save`);
    return response.data;
  },

  repost: async (id: string): Promise<Post> => {
    const response = await api.post<Post>(`/posts/${id}/repost`);
    return response.data;
  },

  getUserPosts: async (userId: string, params?: UserPostsParams): Promise<PaginatedResponse<Post>> => {
    const response = await api.get<PaginatedResponse<Post>>(`/posts/user/${userId}`, { params });
    return response.data;
  },

  getLikedPosts: async (userId: string, params?: FeedParams): Promise<PaginatedResponse<Post>> => {
    const response = await api.get<PaginatedResponse<Post>>(`/posts/user/${userId}/liked`, { params });
    return response.data;
  },

  getSavedPosts: async (params?: FeedParams): Promise<PaginatedResponse<Post>> => {
    const response = await api.get<PaginatedResponse<Post>>('/posts/saved', { params });
    return response.data;
  },

  uploadImages: async (images: string[]): Promise<string[]> => {
    const formData = new FormData();
    images.forEach((uri, index) => {
      formData.append('images', {
        uri,
        name: `image_${index}.jpg`,
        type: 'image/jpeg',
      } as any);
    });
    const response = await api.upload<{ urls: string[] }>('/posts/upload', formData);
    return response.data.urls;
  },
};