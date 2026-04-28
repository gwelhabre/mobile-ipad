import client from './client';
import { ApiResponse, PaginatedResponse, DJProfile, DJSet, DJDeal } from '../types';

export const djApi = {
  getDJs: (page = 1, limit = 21, genre?: string, search?: string) =>
    client.get<ApiResponse<PaginatedResponse<DJProfile>>>('/djs', {
      params: { page, limit, genre, search },
    }),

  getDJById: (djId: string) =>
    client.get<ApiResponse<DJProfile>>(`/djs/${djId}`),

  followDJ: (djId: string) =>
    client.post<ApiResponse<void> | { following: boolean }>('/follow', { djId }),

  unfollowDJ: (djId: string) =>
    client.post<ApiResponse<void> | { following: boolean }>('/follow', { djId }),

  // DJ dashboard
  getMyProfile: () =>
    client.get<ApiResponse<DJProfile>>('/djs/me'),

  updateMyProfile: (data: any) =>
    client.patch<ApiResponse<DJProfile>>('/djs/me', data),

  getMyAnalytics: (period = '30d') =>
    client.get('/djs/me/analytics', { params: { period } }),

  getMySets: (page = 1, limit = 20) =>
    client.get<ApiResponse<PaginatedResponse<DJSet>>>('/djs/me/sets', {
      params: { page, limit },
    }),

  createSet: (payload: Partial<DJSet>) =>
    client.post<ApiResponse<DJSet>>('/djs/me/sets', payload),

  updateSet: (setId: string, payload: Partial<DJSet>) =>
    client.put<ApiResponse<DJSet>>(`/djs/me/sets/${setId}`, payload),

  deleteSet: (setId: string) =>
    client.delete<ApiResponse<void>>(`/djs/me/sets/${setId}`),

  getMyDeals: (page = 1, limit = 20) =>
    client.get<ApiResponse<PaginatedResponse<DJDeal>>>('/djs/me/deals', {
      params: { page, limit },
    }),

  respondToDeal: (dealId: string, action: 'accept' | 'reject') =>
    client.post<ApiResponse<DJDeal>>(`/djs/me/deals/${dealId}/${action}`),
};
