import client from './client';
import { ApiResponse, PaginatedResponse, RankingEntry, Competition, CompetitionEntry, Venue } from '../types';
import { BlogPost, ForumCategory, ForumThread } from '../types';

type AnyRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is AnyRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const asString = (value: unknown): string | undefined => {
  if (typeof value === 'string' && value.trim()) return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return undefined;
};

const asNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const firstString = (...values: unknown[]) => values.map(asString).find(Boolean);
const firstNumber = (...values: unknown[]) => {
  for (const value of values) {
    const parsed = asNumber(value);
    if (parsed !== undefined) return parsed;
  }
  return undefined;
};
const firstId = (...values: unknown[]) => {
  for (const value of values) {
    const parsedNumber = asNumber(value);
    if (parsedNumber !== undefined) return String(parsedNumber);
    const parsedString = asString(value);
    if (parsedString) return parsedString;
  }
  return undefined;
};
const firstGenre = (...values: unknown[]) => {
  for (const value of values) {
    if (Array.isArray(value)) {
      const genre = value.map(asString).find(Boolean);
      if (genre) return genre;
    }
    if (typeof value === 'string' && value.trim()) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          const genre = parsed.map(asString).find(Boolean);
          if (genre) return genre;
        }
      } catch {
        return value;
      }
      return value;
    }
  }
  return undefined;
};

const unwrapList = (data: unknown, key: string): unknown[] => {
  if (Array.isArray(data)) return data;
  if (!isRecord(data)) return [];
  if (Array.isArray(data[key])) return data[key] as unknown[];
  if (Array.isArray(data.data)) return data.data;
  if (isRecord(data.data)) {
    if (Array.isArray(data.data[key])) return data.data[key] as unknown[];
    if (Array.isArray(data.data.items)) return data.data.items;
    if (Array.isArray(data.data.results)) return data.data.results;
  }
  return [];
};

const paginated = <T>(data: T[], page: number, limit: number): ApiResponse<PaginatedResponse<T>> => ({
  success: true,
  data: {
    data,
    total: data.length,
    page,
    limit,
    hasMore: data.length >= limit,
  },
});

const normalizeRankingEntry = (value: unknown, index: number): RankingEntry | undefined => {
  if (!isRecord(value)) return undefined;

  const dj = isRecord(value.dj) ? value.dj : isRecord(value.djProfile) ? value.djProfile : undefined;
  const user = dj && isRecord(dj.user) ? dj.user : undefined;
  const rank = firstNumber(value.rank, value.globalRank, value.position, value.ranking, dj?.rank, dj?.globalRank, dj?.rankingPosition) ?? index + 1;

  return {
    rank,
    previousRank: firstNumber(value.previousRank, value.previousGlobalRank, value.lastRank),
    change: firstNumber(value.change, value.rankChange, value.delta) ?? 0,
    djId: firstId(value.djId, dj?.id, value.id) ?? String(rank),
    stageName: firstString(value.stageName, value.displayName, value.djName, value.name, dj?.stageName, dj?.displayName, dj?.name, user?.name) ?? `DJ #${rank}`,
    username: firstString(value.username, dj?.username, user?.username),
    avatar: firstString(value.avatar, value.profileImage, value.imageUrl, dj?.avatar, dj?.profileImage, dj?.avatarUrl, user?.avatarUrl),
    score: firstNumber(value.score, value.rankingScore, dj?.score, dj?.rankingScore) ?? 0,
    genre: firstGenre(value.genre, value.genres, dj?.genre, dj?.genres) ?? '',
    city: firstString(value.city, value.baseCity, dj?.city, dj?.baseCity) ?? '',
    followersCount: firstNumber(value.followersCount, value.totalFollowers, value.followers, dj?.followersCount, dj?.totalFollowers) ?? 0,
    isVerified: Boolean(value.isVerified ?? value.verified ?? dj?.isVerified ?? dj?.verified),
  };
};

const titleCase = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1).replace(/[-_]/g, ' ');

const categoryIconName = (id: string, iconName?: string) => {
  if (id === 'city' || iconName?.includes('map')) return 'location-outline';
  if (id === 'genre' || iconName?.includes('music')) return 'musical-notes-outline';
  if (id === 'venue' || iconName?.includes('office')) return 'business-outline';
  if (id === 'dj' || iconName?.includes('account')) return 'headset-outline';
  return 'chatbubbles-outline';
};

const normalizeForumCategory = (value: unknown): ForumCategory | undefined => {
  if (typeof value === 'string') {
    return {
      id: value,
      name: titleCase(value),
      description: '',
      icon: categoryIconName(value),
      threadsCount: 0,
      postsCount: 0,
    };
  }
  if (!isRecord(value)) return undefined;

  const id = firstString(value.id, value.slug, value.category, value.name);
  if (!id) return undefined;

  const count = firstNumber(value.threadsCount, value.threadCount, value.postsCount, value.count) ?? 0;
  const iconName = firstString(value.iconName, value.icon);

  return {
    id,
    name: firstString(value.name, value.label, value.title) ?? titleCase(id),
    description: firstString(value.description) ?? '',
    icon: categoryIconName(id, iconName),
    threadsCount: count,
    postsCount: firstNumber(value.postsCount) ?? count,
    lastActivity: firstString(value.lastActivity, value.lastActivityAt),
  };
};

const normalizeForumReply = (value: unknown) => {
  if (!isRecord(value)) return undefined;

  const id = firstId(value.id);
  if (!id) return undefined;
  const author = isRecord(value.author) ? value.author : undefined;

  return {
    id,
    threadId: firstId(value.threadId) ?? '',
    authorId: firstId(value.authorId, author?.id) ?? '',
    authorName: firstString(value.authorName, value.authorUsername, value.username, author?.name, author?.username) ?? 'User',
    authorAvatarUrl: firstString(value.authorAvatarUrl, value.avatarUrl, author?.avatarUrl, author?.image),
    body: firstString(value.body, value.content, value.text) ?? '',
    likeCount: firstNumber(value.likeCount, value.likesCount) ?? 0,
    createdAt: firstString(value.createdAt) ?? new Date().toISOString(),
  };
};

const normalizeForumThread = (value: unknown): ForumThread | undefined => {
  if (!isRecord(value)) return undefined;

  const id = firstId(value.id);
  if (!id) return undefined;
  const author = isRecord(value.author) ? value.author : undefined;
  const replies = unwrapList(value.replies, 'replies').map(normalizeForumReply).filter(Boolean);

  return {
    id,
    categoryId: firstId(value.categoryId, value.category) ?? '',
    authorId: firstId(value.authorId, author?.id) ?? '',
    authorName: firstString(value.authorName, value.authorUsername, value.username, author?.name, author?.username) ?? 'User',
    authorAvatarUrl: firstString(value.authorAvatarUrl, value.avatarUrl, author?.avatarUrl, author?.image),
    title: firstString(value.title) ?? 'Untitled thread',
    body: firstString(value.body, value.content, value.excerpt) ?? '',
    repliesCount: firstNumber(value.repliesCount, value.replyCount) ?? replies.length,
    viewsCount: firstNumber(value.viewsCount, value.viewCount) ?? 0,
    isPinned: Boolean(value.isPinned),
    isLocked: Boolean(value.isLocked),
    tags: Array.isArray(value.tags) ? value.tags.map(asString).filter((tag): tag is string => Boolean(tag)) : [],
    lastReplyAt: firstString(value.lastReplyAt, value.lastActivityAt),
    createdAt: firstString(value.createdAt) ?? new Date().toISOString(),
    replies,
  } as ForumThread & { replies: NonNullable<ReturnType<typeof normalizeForumReply>>[] };
};

export const rankingsApi = {
  getRankings: async (period: 'daily' | 'weekly' | 'monthly' | 'alltime' = 'weekly', genre?: string, page = 1, limit = 50) => {
    const response = await client.get<unknown>('/rankings', {
      params: { period, genre, page, limit },
    });
    const data = unwrapList(response.data, 'rankings')
      .map(normalizeRankingEntry)
      .filter((entry): entry is RankingEntry => Boolean(entry));
    return { ...response, data: paginated(data, page, limit) };
  },

  getMyRank: () =>
    client.get<ApiResponse<RankingEntry>>('/rankings/me'),
};

export const competitionsApi = {
  getCompetitions: (page = 1, limit = 9) =>
    client.get<ApiResponse<PaginatedResponse<Competition>>>('/competitions', {
      params: { page, limit },
    }),

  getCompetitionById: (competitionId: string) =>
    client.get<ApiResponse<Competition>>(`/competitions/${competitionId}`),

  getCompetitionEntries: (competitionId: string, page = 1) =>
    client.get<ApiResponse<PaginatedResponse<CompetitionEntry>>>(
      `/competitions/${competitionId}/entries`,
      { params: { page } },
    ),

  submitEntry: (competitionId: string, trackTitle: string, trackUrl: string) =>
    client.post<ApiResponse<CompetitionEntry>>(`/competitions/${competitionId}/entries`, {
      trackTitle,
      trackUrl,
    }),

  voteForEntry: (competitionId: string, entryId: string) =>
    client.post<ApiResponse<void>>(`/competitions/${competitionId}/entries/${entryId}/vote`),
};

export const communityApi = {
  getBlogPosts: (page = 1, limit = 9, category?: string) =>
    client.get<ApiResponse<PaginatedResponse<BlogPost>>>('/blog/posts', {
      params: { page, limit, category },
    }),

  getBlogPostById: (postId: string) =>
    client.get<ApiResponse<BlogPost>>(`/blog/posts/${postId}`),
};

// Forum API functions using correct backend endpoints
export const getForumCategories = async (): Promise<ForumCategory[]> => {
  const { data } = await client.get<unknown>('/forum/categories');
  return unwrapList(data, 'categories')
    .map(normalizeForumCategory)
    .filter((category): category is ForumCategory => Boolean(category));
};

export const getForumThreads = async (category?: string): Promise<ForumThread[]> => {
  const { data } = await client.get<unknown>('/forum/threads', { params: category ? { category } : {} });
  return unwrapList(data, 'threads')
    .map(normalizeForumThread)
    .filter((thread): thread is ForumThread => Boolean(thread));
};

export const getThreadById = async (id: string): Promise<ForumThread> => {
  const { data } = await client.get<unknown>(`/forum/threads/${id}`);
  const payload = isRecord(data) && isRecord(data.thread) ? data.thread : data;
  const thread = normalizeForumThread(payload);
  if (!thread) throw new Error('Invalid thread response');
  return thread;
};

export const replyToThread = async (id: string, body: string): Promise<any> => {
  const { data } = await client.post(`/forum/threads/${id}/replies`, { body });
  return data;
};

export interface VenueEvent {
  id: string; title: string; status: string; startTime: string;
  venueId: string; venueName: string; djName: string;
}

export const getVenueEvents = async (): Promise<VenueEvent[]> => {
  const { data } = await client.get<{ events: VenueEvent[] }>('/venue/events');
  return data.events ?? [];
};

export const venueStreamAction = async (action: 'start' | 'stop', eventId: string) => {
  const { data } = await client.post('/venue/stream', { action, eventId });
  return data;
};

export const getVenueStreamStatus = async (eventId: string) => {
  const { data } = await client.get('/venue/stream', { params: { eventId } });
  return data.stream as { id: string; status: string; streamKey: string | null; viewerCount: number; startedAt: string | null; endedAt: string | null } | null;
};

export const getMyVenues = async (): Promise<Array<{ id: string; name: string; city: string | null; slug: string | null }>> => {
  const { data } = await client.get<{ venues: any[] }>('/venue/my-venues');
  return data.venues ?? [];
};

export const getVenueAnalytics = async (period = '30d') => {
  const { data } = await client.get('/venue/analytics', { params: { period } });
  return data;
};

export const getVenueDetail = async (id: string | number): Promise<Venue> => {
  const { data } = await client.get<Venue>(`/venues/${id}`);
  return data;
};
