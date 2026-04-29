import client from './client';

export interface VideoPost {
  id: string;
  djId: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  type?: string;
  tags?: string;
  eventId?: string | null;
  venueId?: string | null;
  visibility?: 'public' | 'private' | 'unlisted';
  createdAt: string;
  dj?: { id: string; stageName: string; profileImage?: string; slug?: string };
  event?: { id: string; title: string; slug?: string } | null;
}

export const getVideos = async (filters: { djId?: string; eventId?: string; type?: string } = {}): Promise<VideoPost[]> => {
  const { data } = await client.get<{ videos: VideoPost[] }>('/videos', { params: filters });
  return data?.videos ?? [];
};

export const createVideo = async (payload: {
  title: string;
  videoUrl: string;
  description?: string;
  thumbnailUrl?: string;
  type?: string;
  tags?: string[];
  eventId?: string;
  venueId?: string;
  visibility?: 'public' | 'private' | 'unlisted';
}): Promise<VideoPost> => {
  const { data } = await client.post<{ video: VideoPost }>('/videos', payload);
  return data.video;
};
