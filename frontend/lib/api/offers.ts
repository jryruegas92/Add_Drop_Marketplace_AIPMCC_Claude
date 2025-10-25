import { apiClient } from './client';
import { Offer, CreateOfferRequest, OfferStatus } from '../types';

export const offersApi = {
  getForPost: async (post_id: number): Promise<Offer[]> => {
    return apiClient.get<Offer[]>(`/offers/post/${post_id}`);
  },

  getMy: async (): Promise<{ made: Offer[] }> => {
    return apiClient.get<{ made: Offer[] }>('/offers/my');
  },

  getReceived: async (): Promise<{ received: Offer[] }> => {
    return apiClient.get<{ received: Offer[] }>('/offers/received');
  },

  create: async (data: CreateOfferRequest): Promise<Offer> => {
    return apiClient.post<Offer>('/offers', data);
  },

  updateStatus: async (id: number, status: OfferStatus): Promise<Offer> => {
    return apiClient.patch<Offer>(`/offers/${id}/status`, { status });
  },
};
