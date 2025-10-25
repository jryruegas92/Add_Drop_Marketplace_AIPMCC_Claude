import { apiClient } from './client';
import { Class } from '../types';

export const classesApi = {
  getAll: async (): Promise<Class[]> => {
    return apiClient.get<Class[]>('/classes/all');
  },

  getEnrolled: async (): Promise<Class[]> => {
    return apiClient.get<Class[]>('/classes/enrolled');
  },

  enroll: async (class_id: number): Promise<Class> => {
    return apiClient.post<Class>('/classes/enroll', { class_id });
  },

  unenroll: async (class_id: number): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/classes/enroll/${class_id}`);
  },
};
