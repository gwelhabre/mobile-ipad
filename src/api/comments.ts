import client from './client';

export interface EventComment {
  id: string;
  content: string;
  displayName: string;
  createdAt: string;
}

export const postEventComment = async (eventId: string, content: string): Promise<EventComment> => {
  const { data } = await client.post<{ comment: EventComment }>('/comments', { eventId, content });
  return data.comment;
};

export const getLiveComments = async (liveId: number | string): Promise<EventComment[]> => {
  const { data } = await client.get<{ comments: EventComment[] }>('/comments', { params: { liveId } });
  return data.comments ?? [];
};
