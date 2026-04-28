import client from './client';

export interface FollowResponse {
  following: boolean;
  followed?: boolean;
  count?: number;
}

export const followVenue = (venueId: string) =>
  client.post<FollowResponse>('/follow', { venueId });

export const followDJ = (djId: string) =>
  client.post<FollowResponse>('/follow', { djId });
