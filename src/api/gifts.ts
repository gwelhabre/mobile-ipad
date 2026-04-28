import client from './client';
import { ApiResponse, PaginatedResponse, Gift, GiftTransaction } from '../types';

export const giftsApi = {
  getAvailableGifts: () =>
    client.get<ApiResponse<Gift[]>>('/gifts'),

  sendGift: (receiverId: string, giftId: string, streamId?: string, message?: string) =>
    client.post<ApiResponse<GiftTransaction>>('/gifts/send', {
      receiverId,
      giftId,
      streamId,
      message,
    }),

  getSentGifts: (page = 1, limit = 20) =>
    client.get<ApiResponse<PaginatedResponse<GiftTransaction>>>('/gifts/sent', {
      params: { page, limit },
    }),

  getReceivedGifts: (page = 1, limit = 20) =>
    client.get<ApiResponse<PaginatedResponse<GiftTransaction>>>('/gifts/received', {
      params: { page, limit },
    }),
};
