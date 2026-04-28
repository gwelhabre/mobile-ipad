import client from './client';
import { ApiResponse, PaginatedResponse, Notification } from '../types';

export const notificationsApi = {
  getNotifications: (page = 1, limit = 30) =>
    client.get<ApiResponse<PaginatedResponse<Notification>>>('/notifications', {
      params: { page, limit },
    }),

  markAsRead: (notificationId: string) =>
    client.put<ApiResponse<void>>(`/notifications/${notificationId}/read`),

  markAllAsRead: () =>
    client.put<ApiResponse<void>>('/notifications/read-all'),

  getUnreadCount: () =>
    client.get<ApiResponse<{ count: number }>>('/notifications/unread-count'),

  deleteNotification: (notificationId: string) =>
    client.delete<ApiResponse<void>>(`/notifications/${notificationId}`),
};
