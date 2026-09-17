import { api } from '@/lib/api';
import { Comment, PaginatedResponse } from '@/types';

export const commentsApi = {
  getComments: async (postId: string, params?: { page?: number; limit?: number; cursor?: string }): Promise<PaginatedResponse<Comment>> => {
    const response = await api.get<PaginatedResponse<Comment>>(`/comments/post/${postId}`, { params });
    return response.data;
  },

  createComment: async (postId: string, content: string, parentCommentId?: string): Promise<Comment> => {
    const response = await api.post<Comment>(`/comments/post/${postId}`, { content, parentCommentId });
    return response.data;
  },

  updateComment: async (commentId: string, content: string): Promise<Comment> => {
    const response = await api.patch<Comment>(`/comments/${commentId}`, { content });
    return response.data;
  },

  deleteComment: async (commentId: string): Promise<void> => {
    await api.delete(`/comments/${commentId}`);
  },

  likeComment: async (commentId: string): Promise<{ likesCount: number; isLiked: boolean }> => {
    const response = await api.post<{ likesCount: number; isLiked: boolean }>(`/comments/${commentId}/like`);
    return response.data;
  },

  unlikeComment: async (commentId: string): Promise<{ likesCount: number; isLiked: boolean }> => {
    const response = await api.delete<{ likesCount: number; isLiked: boolean }>(`/comments/${commentId}/like`);
    return response.data;
  },

  getReplies: async (commentId: string, params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Comment>> => {
    const response = await api.get<PaginatedResponse<Comment>>(`/comments/${commentId}/replies`, { params });
    return response.data;
  },
};