import { apiClient } from './client';
import { Post, CreatePostRequest, PostType, PostStatus } from '../types';

export const postsApi = {
  getAll: async (filters?: {
    post_type?: PostType;
    class_id?: number;
    status?: PostStatus;
  }): Promise<Post[]> => {
    const params = new URLSearchParams();
    if (filters?.post_type) params.append('post_type', filters.post_type);
    if (filters?.class_id) params.append('class_id', filters.class_id.toString());
    if (filters?.status) params.append('status', filters.status);

    const query = params.toString();
    return apiClient.get<Post[]>(`/posts${query ? `?${query}` : ''}`);
  },

  getById: async (id: number): Promise<Post> => {
    return apiClient.get<Post>(`/posts/${id}`);
  },

  getMy: async (): Promise<Post[]> => {
    return apiClient.get<Post[]>('/posts/my');
  },

  create: async (data: CreatePostRequest): Promise<Post> => {
    return apiClient.post<Post>('/posts', data);
  },

  updateStatus: async (id: number, status: PostStatus): Promise<Post> => {
    return apiClient.patch<Post>(`/posts/${id}/status`, { status });
  },

  delete: async (id: number): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/posts/${id}`);
  },
};
