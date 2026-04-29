// ─── User & Auth ────────────────────────────────────────────────────────────

export type UserRole = 'fan' | 'dj' | 'venue_manager' | 'event_planner' | 'admin';

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  bio?: string;
  city?: string;
  country?: string;
  followersCount: number;
  followingCount: number;
  createdAt: string;
  isVerified: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  email: string;
  password: string;
  username: string;
  displayName: string;
  role: UserRole;
}

// ─── DJ ─────────────────────────────────────────────────────────────────────

export interface DJProfile {
  id: string;
  userId: string;
  displayName: string;
  username: string;
  avatarUrl?: string;
  bannerUrl?: string;
  bio: string;
  genres: string[];
  city: string;
  country: string;
  rank: number;
  rankChange: number;
  score: number;
  followersCount: number;
  isFollowing?: boolean;
  isLive: boolean;
  totalSets: number;
  totalEarned: number;
  rating: number;
  isVerified: boolean;
  isBookableForPrivateEvents?: boolean;
  createdAt: string;
}

export interface DJSet {
  id: string;
  djId: string;
  title: string;
  description?: string;
  price: number;
  duration: number;
  genre: string;
  salesCount: number;
  status: 'active' | 'draft' | 'archived';
  coverUrl?: string;
  createdAt: string;
}

export interface DJDeal {
  id: string;
  djId: string;
  venueId?: string;
  venueName?: string;
  title: string;
  description: string;
  amount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  date: string;
  createdAt: string;
}

export interface DJAnalytics {
  totalEarnings: number;
  monthlyEarnings: number;
  totalFollowers: number;
  newFollowers: number;
  totalStreams: number;
  averageViewers: number;
  giftsReceived: number;
  rankPosition: number;
  engagementRate: number;
  rankHistory: { date: string; rank: number }[];
}

// ─── Venue ──────────────────────────────────────────────────────────────────

export interface Venue {
  id: string;
  managerId: string;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  coverUrl?: string;
  logoUrl?: string;
  capacity: number;
  genres: string[];
  rating: number;
  eventsCount: number;
  isVerified: boolean;
  followersCount?: number;
  isFollowing?: boolean;
  createdAt: string;
  upcomingEvents?: Event[];
  events?: Event[];
  venueType?: string;
  upcomingEventsCount?: number;
}

export interface Deal {
  id: string;
  djId: string;
  djName: string;
  djAvatarUrl?: string;
  venueId: string;
  venueName: string;
  venueCity: string;
  eventDate: string;
  amount: number;
  currency: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
}

export interface VenueDeal {
  id: string;
  venueId: string;
  djId?: string;
  djName?: string;
  title: string;
  description: string;
  amount: number;
  status: 'open' | 'pending' | 'accepted' | 'completed' | 'cancelled';
  eventDate: string;
  createdAt: string;
}

export interface VenueDashboardStats {
  totalDeals: number;
  activeDeals: number;
  totalSpent: number;
  upcomingEvents: number;
  avgDealAmount: number;
  completedDeals: number;
}

// ─── Events ─────────────────────────────────────────────────────────────────

export interface Event {
  id: string;
  venueId: string;
  venueName: string;
  djId?: string;
  djName?: string;
  title: string;
  description: string;
  coverUrl?: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  currency: string;
  capacity: number;
  ticketsSold: number;
  genres: string[];
  city: string;
  address: string;
  status: 'upcoming' | 'live' | 'past' | 'cancelled';
  isFeatured: boolean;
  createdAt: string;
}

export interface TableReservationInvite {
  id: string;
  userId?: string;
  displayName?: string;
  email?: string;
  inviteKind: 'free' | 'split';
  attendanceStatus: 'pending' | 'confirmed' | 'declined';
  paymentExpected: boolean;
  proposedToPay: boolean;
  paymentStatus: 'not_required' | 'accepted' | 'proposed' | 'paid' | 'unfunded' | 'declined';
  shareAmount?: number;
  respondedAt?: string;
  paidAt?: string;
}

export interface TableReservation {
  id: string;
  eventId: string;
  venueId: string;
  partySize: number;
  tableFee: number;
  currency: string;
  status: 'pending_confirmations' | 'split_pending' | 'paid' | 'cancelled' | 'expired';
  freeInviteLink: string;
  splitInviteLink: string;
  expiresAt: string;
  splitAt?: string;
  paidAt?: string;
  event?: Event;
  venue?: Venue;
  invites: TableReservationInvite[];
  summary?: {
    confirmedCount: number;
    declinedCount: number;
    payingCount: number;
    paidInviteCount: number;
    unpaidInviteCount: number;
    expectedResponses: number;
  };
}

// ─── Live Streaming ─────────────────────────────────────────────────────────

export interface LiveStream {
  id: string;
  djId: string;
  djName: string;
  djAvatarUrl?: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  viewerCount: number;
  peakViewers: number;
  genre: string;
  tags: string[];
  streamKey: string;
  playbackUrl: string;
  status: 'live' | 'ended' | 'scheduled';
  startedAt: string;
  endedAt?: string;
  giftsTotal: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  message: string;
  timestamp: string;
  type: 'message' | 'gift' | 'follow' | 'system';
  giftName?: string;
  giftValue?: number;
}

// ─── Gifts ──────────────────────────────────────────────────────────────────

export interface Gift {
  id: string;
  name: string;
  emoji: string;
  price: number;
  animationUrl?: string;
  category: 'basic' | 'premium' | 'legendary';
}

export interface GiftTransaction {
  id: string;
  senderId: string;
  receiverId: string;
  giftId: string;
  giftName: string;
  giftEmoji: string;
  amount: number;
  streamId?: string;
  message?: string;
  createdAt: string;
}

// ─── Wallet ─────────────────────────────────────────────────────────────────

export interface WalletBalance {
  available: number;
  pending: number;
  totalEarned: number;
  currency: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'credit' | 'debit' | 'payout' | 'purchase' | 'gift_sent' | 'gift_received' | 'deal_payment';
  amount: number;
  currency: string;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  reference?: string;
  createdAt: string;
}

export interface PayoutRequest {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  method: 'bank_transfer' | 'paypal' | 'stripe';
  accountDetails: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  createdAt: string;
  processedAt?: string;
}

// ─── Marketplace ─────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  sellerId: string;
  sellerName: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: 'dj_set' | 'sample_pack' | 'preset' | 'tutorial' | 'merchandise' | 'ticket';
  coverUrl?: string;
  fileUrl?: string;
  salesCount: number;
  rating: number;
  reviewsCount: number;
  tags: string[];
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  username: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// ─── Rankings ────────────────────────────────────────────────────────────────

export interface RankingEntry {
  rank: number;
  previousRank?: number | null;
  change: number;
  djId: string;
  stageName: string;
  username?: string;
  avatar?: string;
  score: number;
  genre: string;
  city: string;
  followersCount: number;
  isVerified?: boolean;
}

export interface RankingPeriod {
  label: string;
  value: 'daily' | 'weekly' | 'monthly' | 'alltime';
}

// ─── Community ───────────────────────────────────────────────────────────────

export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  threadsCount: number;
  postsCount: number;
  lastActivity?: string;
}

export interface ForumThread {
  id: string;
  categoryId: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  title: string;
  body: string;
  repliesCount: number;
  viewsCount: number;
  isPinned: boolean;
  isLocked: boolean;
  tags: string[];
  lastReplyAt?: string;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  title: string;
  excerpt: string;
  body: string;
  coverUrl?: string;
  category: string;
  tags: string[];
  readTime: number;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  publishedAt: string;
  isFeatured: boolean;
}

// ─── Competitions ─────────────────────────────────────────────────────────────

export interface Competition {
  id: string;
  title: string;
  description: string;
  coverUrl?: string;
  prize: string;
  prizeAmount: number;
  currency: string;
  startDate: string;
  endDate: string;
  submissionDeadline: string;
  status: 'upcoming' | 'active' | 'voting' | 'completed';
  genre?: string;
  participantsCount: number;
  votesCount: number;
  rules: string;
  createdAt: string;
}

export interface CompetitionEntry {
  id: string;
  competitionId: string;
  djId: string;
  djName: string;
  djAvatarUrl?: string;
  trackTitle: string;
  trackUrl: string;
  votesCount: number;
  rank?: number;
  submittedAt: string;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  userId: string;
  type: 'follow' | 'gift' | 'deal' | 'competition' | 'booking' | 'system' | 'live_started' | 'payout';
  title: string;
  body: string;
  data?: Record<string, string>;
  isRead: boolean;
  createdAt: string;
  actorName?: string;
  actorAvatarUrl?: string;
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ─── Navigation ───────────────────────────────────────────────────────────────

export interface EventPlanningComponents {
  djSet: string[];
  lighting: string[];
  band: string[];
  [key: string]: string[];
}

export interface EventPlanningPack {
  id: number | string;
  title: string;
  subtitle?: string;
  description?: string;
  basePrice?: number | null;
  components: EventPlanningComponents;
  addons: string[];
  status: 'draft' | 'published' | 'archived';
  planner?: {
    id: number | string;
    displayName: string;
    companyName?: string;
    isVerified?: boolean;
    email?: string;
    contactName?: string;
  } | null;
}

export interface EventQuotation {
  id: number | string;
  requestId?: number | string;
  title: string;
  lineItems: Array<{ name: string; amount: number }>;
  notes?: string;
  total: number;
  currency: string;
  status: 'proposed' | 'selected' | 'paid_cash' | 'paid_wallet' | 'declined';
  createdAt: string;
}

export interface EventPlannerRevenueLog {
  id: number | string;
  requestId?: number | string;
  quotationId?: number | string;
  amount: number;
  currency: string;
  status: 'locked' | 'made';
  paymentMethod?: 'cash' | 'wallet';
  description?: string;
  createdAt: string;
  quotation?: {
    id: number | string;
    title: string;
    total: number;
  } | null;
}

export interface EventQuoteRequest {
  id: number | string;
  eventDate: string;
  startTime: string;
  endTime: string;
  location: string;
  selections: Record<string, string>;
  addons: string[];
  note?: string;
  quoteFee: number;
  quoteFeePaid: boolean;
  status: 'submitted' | 'quoted' | 'selected' | 'canceled';
  selectedQuotationId?: number | string;
  paymentMethod?: 'cash' | 'wallet';
  createdAt: string;
  pack?: EventPlanningPack | null;
  planner?: EventPlanningPack['planner'];
  requester?: {
    id: number | string;
    name?: string;
    email: string;
  } | null;
  quotations?: EventQuotation[];
}

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type DrawerParamList = {
  HomeStack: undefined;
  LiveStack: undefined;
  RankingsStack: undefined;
  DiscoverStack: undefined;
  WalletStack: undefined;
  MarketplaceStack: undefined;
  CommunityStack: undefined;
  DJStack: undefined;
  VenueStack: undefined;
  CompetitionsStack: undefined;
  NotificationsStack: undefined;
  ProfileStack: undefined;
};

export type HomeStackParamList = {
  Feed: undefined;
};

export type DiscoverStackParamList = {
  DJs: undefined;
  DJProfile: { djId: string };
  Venues: undefined;
  VenueDetail: { venueId: string };
  Events: undefined;
  EventDetail: { eventId: string };
  Search: undefined;
  VenueBroadcast: { eventId?: string } | undefined;
  PlanYourEvent: undefined;
};

export type LiveStackParamList = {
  LiveDirectory: undefined;
  LiveStream: { streamId: string; djId?: string; djName?: string };
};

export type WalletStackParamList = {
  Wallet: undefined;
  AddFunds: undefined;
  Payout: undefined;
};

export type MarketplaceStackParamList = {
  Marketplace: undefined;
  ProductDetail: { productId: string };
  Orders: undefined;
  MyListings: undefined;
};

export type CommunityStackParamList = {
  Forum: undefined;
  Blog: undefined;
};

export type DJStackParamList = {
  DJDashboard: undefined;
  DJAnalytics: undefined;
  DJSets: undefined;
  DJDeals: undefined;
  DJVideos: undefined;
  DJBroadcast: undefined;
};

export type VenueStackParamList = {
  VenueDashboard: undefined;
  VenueDeals: undefined;
  VenuePostEvent: undefined;
  VenueAnalytics: undefined;
  VenueFindDJs: undefined;
  VenueBroadcast: { eventId?: string } | undefined;
};

export type CompetitionsStackParamList = {
  Competitions: undefined;
  CompetitionDetail: { competitionId: string };
};

export type ProfileStackParamList = {
  Profile: undefined;
  Settings: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  DeleteAccount: undefined;
  BlockedUsers: undefined;
  EventPlannerDashboard: undefined;
  Info: { topic: string };
  Admin: undefined;
};
