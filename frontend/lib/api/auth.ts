import { apiClient } from './client';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../types';

export const authApi = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/register', data);
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/login', data);
  },

  getProfile: async (): Promise<User> => {
    return apiClient.get<User>('/auth/profile');
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    return apiClient.put<User>('/auth/profile', data);
  },
};
