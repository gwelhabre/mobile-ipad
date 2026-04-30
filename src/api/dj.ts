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

export const createDJSet = async (payload: {
  title: string;
  description?: string;
  coverImage?: string;
  previewUrl?: string;
  price?: number;
  accessType?: 'free' | 'paid' | 'subscription';
  visibility?: 'public' | 'unlisted' | 'private';
}) => {
  const mappedAccessType = payload.accessType === 'paid' ? 'purchase'
    : payload.accessType === 'subscription' ? 'stream'
    : 'purchase';
  const mappedVisibility = payload.visibility === 'private' || payload.visibility === 'unlisted'
    ? 'members_only'
    : 'public';
  const { data } = await client.post('/djs/me/sets', {
    ...payload,
    accessType: mappedAccessType,
    visibility: mappedVisibility,
  });
  return data;
};

export interface DJDashboardEvent {
  id: string;
  title: string;
  startTime: string;
  status: string;
  venue: { id: string; name: string; city?: string };
  liveStream?: { id: string; status: string; streamKey: string | null } | null;
}

export const getDJDashboardEvents = async (status?: string): Promise<DJDashboardEvent[]> => {
  const { data } = await client.get<{ events: DJDashboardEvent[] }>('/dj/dashboard/events', {
    params: status ? { status } : undefined,
  });
  return data.events ?? [];
};

export const djStreamAction = async (action: 'start' | 'stop', eventId: string) => {
  const { data } = await client.post('/live', { action, eventId });
  return data;
};

/** Cross-platform helper — DJ display name regardless of which schema field the platform uses. */
export const getDjDisplayName = (dj: any): string => {
  if (!dj) return 'DJ';
  return dj.stageName ?? dj.displayName ?? dj.username ?? 'DJ';
};

/** Cross-platform top-level helper that takes a single search string (matches android/iOS signature). */
export const getDJs = async (search?: string): Promise<DJProfile[]> => {
  const { data } = await client.get<any>('/djs', {
    params: { page: 1, limit: 20, search },
  });
  // Normalize: backend may return ApiResponse<PaginatedResponse<DJProfile>> or a flat array.
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.data)) return data.data.data;
  return [];
};
