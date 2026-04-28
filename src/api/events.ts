import client from './client';
import { ApiResponse, PaginatedResponse, Event, Venue, VenueDeal, VenueDashboardStats } from '../types';

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

const maxNumber = (...values: Array<number | undefined>) => {
  const numbers = values.filter((value): value is number => value !== undefined);
  return numbers.length > 0 ? Math.max(...numbers) : undefined;
};

const parseStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(asString).filter((item): item is string => Boolean(item));
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map(asString).filter((item): item is string => Boolean(item)) : [value];
    } catch {
      return [value];
    }
  }
  return [];
};

const normalizeStatus = (status?: string): Event['status'] => {
  if (status === 'live' || status === 'past' || status === 'cancelled') return status;
  if (status === 'ended') return 'past';
  if (status === 'canceled') return 'cancelled';
  return 'upcoming';
};

const timeLabel = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
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

const normalizeVenue = (value: unknown): Venue | undefined => {
  if (!isRecord(value)) return undefined;
  const upcomingEvents = unwrapList(value.upcomingEvents ?? value.events, 'events')
    .map(normalizeEvent)
    .filter((event): event is Event => Boolean(event));

  return {
    id: firstString(value.id) ?? '',
    managerId: firstString(value.managerId) ?? '',
    name: firstString(value.name) ?? 'Venue',
    description: firstString(value.description) ?? '',
    address: firstString(value.address) ?? '',
    city: firstString(value.city) ?? '',
    country: firstString(value.country) ?? '',
    coverUrl: firstString(value.coverUrl, value.coverImageUrl, value.imageUrl, value.avatar),
    logoUrl: firstString(value.logoUrl, value.avatar),
    capacity: firstNumber(value.capacity) ?? 0,
    genres: Array.isArray(value.genres) ? value.genres.map(asString).filter(Boolean) as string[] : [],
    rating: firstNumber(value.rating) ?? 0,
    eventsCount: firstNumber(value.eventsCount, value.upcomingEventsCount, value.totalEventsHosted) ?? 0,
    isVerified: Boolean(value.isVerified ?? value.verified),
    followersCount: firstNumber(value.followersCount, value.followers),
    isFollowing: Boolean(value.isFollowing ?? value.following),
    createdAt: firstString(value.createdAt) ?? '',
    upcomingEvents,
    events: upcomingEvents,
  };
};

const normalizeVenueFromEvent = (value: unknown): Venue | undefined => {
  if (!isRecord(value)) return undefined;

  const venue = isRecord(value.venue) ? value.venue : undefined;
  const id = firstString(venue?.id, value.venueId);
  const name = firstString(venue?.name, value.venueName);
  if (!id || !name) return undefined;
  const activity = maxNumber(
    firstNumber(value.totalCheckIns),
    firstNumber(value.checkInCount, value.checkIns),
    firstNumber(value.rsvpCount),
    firstNumber(value.attendeesCount),
    firstNumber(value.ticketsSold)
  ) ?? 0;
  const capacity = firstNumber(venue?.capacity, value.capacity, value.maxCapacity, value.ticketCount) ?? activity;

  return {
    id,
    managerId: firstString(venue?.managerId) ?? '',
    name,
    description: firstString(venue?.description) ?? '',
    address: firstString(venue?.address, value.address) ?? '',
    city: firstString(venue?.city, value.venueCity, value.city) ?? '',
    country: firstString(venue?.country, value.country) ?? '',
    coverUrl: firstString(venue?.coverUrl, venue?.coverImageUrl, venue?.imageUrl, venue?.avatar),
    logoUrl: firstString(venue?.logoUrl, venue?.avatar),
    capacity,
    genres: parseStringArray(value.genres),
    rating: firstNumber(venue?.rating) ?? 0,
    eventsCount: 1,
    isVerified: Boolean(venue?.isVerified ?? venue?.verified),
    followersCount: firstNumber(venue?.followersCount, venue?.followers),
    isFollowing: Boolean(venue?.isFollowing ?? venue?.following),
    createdAt: firstString(venue?.createdAt) ?? '',
  };
};

const mergeGenres = (first: string[], second: string[]) =>
  Array.from(new Set([...first, ...second]));

const mergeVenue = (existing: Venue, venue: Venue): Venue => ({
  ...existing,
  managerId: existing.managerId || venue.managerId,
  name: existing.name || venue.name,
  description: existing.description || venue.description,
  address: existing.address || venue.address,
  city: existing.city || venue.city,
  country: existing.country || venue.country,
  coverUrl: existing.coverUrl || venue.coverUrl,
  logoUrl: existing.logoUrl || venue.logoUrl,
  capacity: maxNumber(existing.capacity, venue.capacity) ?? 0,
  genres: mergeGenres(existing.genres, venue.genres),
  rating: maxNumber(existing.rating, venue.rating) ?? 0,
  eventsCount: existing.eventsCount + venue.eventsCount,
  isVerified: existing.isVerified || venue.isVerified,
  followersCount: maxNumber(existing.followersCount, venue.followersCount),
  isFollowing: Boolean(existing.isFollowing || venue.isFollowing),
  createdAt: existing.createdAt || venue.createdAt,
});

const uniqueVenues = (venues: Venue[]) => {
  const byId = new Map<string, Venue>();
  for (const venue of venues) {
    const existing = byId.get(venue.id);
    byId.set(venue.id, existing ? mergeVenue(existing, venue) : venue);
  }
  return Array.from(byId.values());
};

const filterVenues = (venues: Venue[], query?: string) => {
  const q = query?.trim().toLowerCase();
  if (!q) return venues;
  return venues.filter((venue) =>
    [venue.name, venue.city, venue.country, venue.address]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(q))
  );
};

const getVenuesFromEvents = async (query?: string, limit = 50): Promise<Venue[]> => {
  const response = await client.get<unknown>('/events', { params: { limit } });
  const venues = unwrapList(response.data, 'events')
    .map(normalizeVenueFromEvent)
    .filter((venue): venue is Venue => Boolean(venue));
  return filterVenues(uniqueVenues(venues), query);
};

const normalizeEvent = (value: unknown): Event | undefined => {
  const source = isRecord(value) && isRecord(value.event) ? value.event : value;
  if (!isRecord(source)) return undefined;

  const id = firstString(source.id);
  if (!id) return undefined;

  const venue = isRecord(source.venue) ? source.venue : undefined;
  const dj = isRecord(source.dj) ? source.dj : undefined;
  const start = firstString(source.date, source.startDate, source.startTime, source.createdAt) ?? new Date().toISOString();
  const end = firstString(source.endTime, source.endDate);
  const rsvpCount = firstNumber(source.rsvpCount, source.attendeesCount, source.ticketsSold, source.totalCheckIns) ?? 0;
  const capacity = firstNumber(source.capacity, source.maxCapacity, source.ticketCount, source.totalCheckIns) ?? Math.max(rsvpCount, 1);

  return {
    id,
    venueId: firstString(source.venueId, venue?.id) ?? '',
    venueName: firstString(source.venueName, venue?.name) ?? 'Venue',
    djId: firstString(source.djId, dj?.id),
    djName: firstString(source.djName, dj?.stageName, dj?.displayName),
    title: firstString(source.title) ?? 'Untitled event',
    description: firstString(source.description) ?? '',
    coverUrl: firstString(source.coverUrl, source.coverImageUrl, source.imageUrl, source.coverImage),
    date: start,
    startTime: timeLabel(firstString(source.startTime, source.startDate, source.date)),
    endTime: timeLabel(end),
    price: firstNumber(source.price, source.ticketPrice) ?? 0,
    currency: firstString(source.currency) ?? 'USD',
    capacity,
    ticketsSold: firstNumber(source.ticketsSold, source.rsvpCount, source.attendeesCount, source.totalCheckIns) ?? 0,
    genres: parseStringArray(source.genres),
    city: firstString(source.city, source.venueCity, venue?.city) ?? '',
    address: firstString(source.address, venue?.address) ?? '',
    status: normalizeStatus(firstString(source.status)),
    isFeatured: Boolean(source.isFeatured),
    createdAt: firstString(source.createdAt) ?? '',
  };
};

export const eventsApi = {
  getEvents: async (page = 1, limit = 20, city?: string, genre?: string) => {
    const response = await client.get<unknown>('/events', {
      params: { page, limit, city, genre },
    });
    const data = unwrapList(response.data, 'events')
      .map(normalizeEvent)
      .filter((event): event is Event => Boolean(event));
    return { ...response, data: paginated(data, page, limit) };
  },

  getEventById: async (eventId: string) => {
    const response = await client.get<unknown>(`/events/${eventId}`);
    const data = normalizeEvent(response.data);
    if (!data) throw new Error('Invalid event response');
    return { ...response, data: { success: true, data } as ApiResponse<Event> };
  },

  buyTicket: (eventId: string) =>
    client.post<ApiResponse<void>>(`/events/${eventId}/tickets`),
};

export const venuesApi = {
  getVenues: async (page = 1, limit = 21, city?: string) => {
    try {
      const response = await client.get<unknown>('/venues', {
        params: { page, limit, city },
      });
      const data = unwrapList(response.data, 'venues')
        .map(normalizeVenue)
        .filter((venue): venue is Venue => Boolean(venue));
      return { ...response, data: paginated(data, page, limit) };
    } catch (error: any) {
      if (error?.response?.status !== 404) throw error;
      const data = await getVenuesFromEvents(city, limit);
      return { data: paginated(data, page, limit) };
    }
  },

  getVenueById: async (venueId: string) => {
    const response = await client.get<unknown>(`/venues/${venueId}`);
    const data = normalizeVenue(response.data) ?? {
      id: venueId,
      managerId: '',
      name: 'Venue',
      description: '',
      address: '',
      city: '',
      country: '',
      capacity: 0,
      genres: [],
      rating: 0,
      eventsCount: 0,
      isVerified: false,
      createdAt: '',
    };
    return { ...response, data: { success: true, data } as ApiResponse<Venue> };
  },

  // Venue manager dashboard
  getMyVenue: () =>
    client.get<ApiResponse<Venue>>('/venues/me'),

  getMyDashboardStats: () =>
    client.get<ApiResponse<VenueDashboardStats>>('/venues/me/stats'),

  getMyDeals: (page = 1, limit = 20) =>
    client.get<ApiResponse<PaginatedResponse<VenueDeal>>>('/venues/me/deals', {
      params: { page, limit },
    }),

  createDeal: (payload: Partial<VenueDeal>) =>
    client.post<ApiResponse<VenueDeal>>('/venues/me/deals', payload),

  updateDeal: (dealId: string, payload: Partial<VenueDeal>) =>
    client.put<ApiResponse<VenueDeal>>(`/venues/me/deals/${dealId}`, payload),

  cancelDeal: (dealId: string) =>
    client.delete<ApiResponse<void>>(`/venues/me/deals/${dealId}`),
};

export const createEvent = async (payload: {
  title: string; venueId: string; djId: string; startTime: string;
  endTime?: string; description?: string; entryInfo?: string; genres?: string[];
}) => {
  const { data } = await client.post('/events', payload);
  return data;
};
