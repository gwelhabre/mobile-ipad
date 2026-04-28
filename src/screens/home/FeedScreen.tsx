import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Image,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import { getFeedComments, FeedCommentActivity } from '../../api/feed';

// Mock data
const MOCK_LIVE_STREAMS = Array.from({ length: 6 }, (_, i) => ({
  id: `stream-${i}`,
  djName: ['DJ Pulse', 'Nova Sound', 'Electra', 'Bass Theory', 'Phantom', 'SonicWave'][i],
  title: ['Tech House Set', 'Deep Vibes', 'Trance Journey', 'Bass Drops', 'Underground', 'Melodic Beats'][i],
  genre: ['Tech House', 'Deep House', 'Trance', 'Drum & Bass', 'Techno', 'Melodic'][i],
  viewerCount: [1240, 892, 2103, 445, 789, 1580][i],
  avatarUrl: undefined,
}));

const MOCK_EVENTS = Array.from({ length: 8 }, (_, i) => ({
  id: `event-${i}`,
  title: [`Friday Night Fever`, 'Bass Cave Sessions', 'Trance Nation', 'House Party Vol.3', 'Rave Underground', 'Sunset Grooves', 'Night Frequency', 'Electric Dreams'][i],
  venue: ['Club Nexus', 'The Bunker', 'Fabric', 'Egg London', 'Printworks', 'Oval Space', 'Village Underground', 'XOYO'][i],
  date: `2026-0${(i % 9) + 1}-${(i + 10)}`,
  price: [20, 15, 25, 18, 30, 0, 22, 12][i],
  city: ['London', 'Berlin', 'NYC', 'Amsterdam', 'London', 'Ibiza', 'NYC', 'Paris'][i],
}));

const MOCK_ACTIVITY = Array.from({ length: 10 }, (_, i) => ({
  id: `act-${i}`,
  type: ['follow', 'gift', 'deal', 'competition', 'follow', 'gift', 'ranking', 'event', 'follow', 'deal'][i] as string,
  user: ['Alex', 'Maria', 'TechBeat', 'Club X', 'Jordan', 'Neon', 'Sam', 'Vibe', 'Kai', 'Arena'][i],
  action: [
    'started following DJ Pulse',
    'sent a Diamond Gift to Nova Sound',
    'accepted a booking from Club Nexus',
    'Trance Nation competition started',
    'started following Electra',
    'sent Fire Gift to Bass Theory',
    'DJ Pulse moved up to #3',
    'New event: Bass Cave Sessions',
    'started following Phantom',
    'completed deal with Fabric London',
  ][i],
  time: `${i + 1}m ago`,
}));

export default function FeedScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [eventComments, setEventComments] = useState<FeedCommentActivity[]>([]);

  const loadEventComments = useCallback(async () => {
    try {
      setEventComments(await getFeedComments(8));
    } catch {
      setEventComments([]);
    }
  }, []);

  useEffect(() => {
    loadEventComments();
  }, [loadEventComments]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEventComments();
    setRefreshing(false);
  };

  const renderStreamCard = ({ item }: { item: typeof MOCK_LIVE_STREAMS[0] }) => (
    <TouchableOpacity style={styles.streamCard} activeOpacity={0.8}>
      <View style={styles.streamThumb}>
        <Avatar name={item.djName} size={44} />
        <View style={styles.streamOverlay}>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
          <View style={styles.viewersBadge}>
            <Ionicons name="eye" size={11} color="#fff" />
            <Text style={styles.viewersText}>{item.viewerCount.toLocaleString()}</Text>
          </View>
        </View>
      </View>
      <View style={styles.streamInfo}>
        <Text style={styles.streamTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.streamDj}>{item.djName}</Text>
        <Badge label={item.genre} variant="purple" size="sm" />
      </View>
    </TouchableOpacity>
  );

  const renderEventRow = (event: typeof MOCK_EVENTS[0]) => (
    <TouchableOpacity key={event.id} style={styles.eventRow} activeOpacity={0.7}>
      <View style={styles.eventDate}>
        <Text style={styles.eventDateMonth}>
          {new Date(event.date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
        </Text>
        <Text style={styles.eventDateDay}>
          {new Date(event.date).getDate()}
        </Text>
      </View>
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
        <View style={styles.eventMeta}>
          <Ionicons name="business-outline" size={12} color="#64748b" />
          <Text style={styles.eventMetaText}>{event.venue}</Text>
          <Ionicons name="location-outline" size={12} color="#64748b" />
          <Text style={styles.eventMetaText}>{event.city}</Text>
        </View>
      </View>
      <Text style={styles.eventPrice}>
        {event.price === 0 ? 'Free' : `$${event.price}`}
      </Text>
    </TouchableOpacity>
  );

  const renderActivityItem = (item: typeof MOCK_ACTIVITY[0]) => {
    const iconMap: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
      follow: { icon: 'person-add', color: '#3b82f6' },
      gift: { icon: 'gift', color: '#a78bfa' },
      deal: { icon: 'briefcase', color: '#10b981' },
      competition: { icon: 'trophy', color: '#f59e0b' },
      ranking: { icon: 'trending-up', color: '#10b981' },
      event: { icon: 'calendar', color: '#3b82f6' },
    };
    const cfg = iconMap[item.type] || { icon: 'notifications', color: '#64748b' };

    return (
      <View key={item.id} style={styles.activityItem}>
        <View style={[styles.activityIcon, { backgroundColor: `${cfg.color}18` }]}>
          <Ionicons name={cfg.icon} size={16} color={cfg.color} />
        </View>
        <View style={styles.activityInfo}>
          <Text style={styles.activityText} numberOfLines={2}>
            <Text style={styles.activityUser}>{item.user} </Text>
            {item.action}
          </Text>
          <Text style={styles.activityTime}>{item.time}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <PageHeader
        title="Home"
        subtitle="Welcome back to Disk Rider Live"
        actions={[{
          element: (
            <TouchableOpacity style={styles.notifBtn}>
              <Ionicons name="notifications-outline" size={22} color="#94a3b8" />
              <View style={styles.notifDot} />
            </TouchableOpacity>
          ),
        }]}
      />

      <View style={styles.content}>
        {/* Left Column: Live Streams */}
        <View style={styles.leftColumn}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" />}
          >
            {/* Section header */}
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.liveIndicator}>
                  <View style={styles.livePulse} />
                </View>
                <Text style={styles.sectionTitle}>Live Now</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={MOCK_LIVE_STREAMS}
              keyExtractor={(item) => item.id}
              renderItem={renderStreamCard}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.streamGrid}
            />

            {/* Activity Feed */}
            <View style={[styles.sectionHeader, { marginTop: 20 }]}>
              <Text style={styles.sectionTitle}>Activity</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.activityList}>
              {eventComments.map((comment) => (
                <View key={comment.id} style={styles.activityItem}>
                  <View style={[styles.activityIcon, { backgroundColor: 'rgba(124,58,237,0.12)' }]}>
                    <Ionicons name="chatbubble-outline" size={16} color="#7c3aed" />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityText} numberOfLines={2}>
                      <Text style={styles.activityUser}>{comment.displayName} </Text>
                      {comment.event?.title ? `said at ${comment.event.title}` : 'said something at an event'}
                    </Text>
                    <Text style={styles.commentText} numberOfLines={3}>{comment.content}</Text>
                  </View>
                </View>
              ))}
              {MOCK_ACTIVITY.map(renderActivityItem)}
            </View>
          </ScrollView>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Right Column: Upcoming Events */}
        <View style={styles.rightColumn}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Trending banner */}
            <LinearGradient
              colors={['rgba(124,58,237,0.3)', 'rgba(16,185,129,0.2)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.trendingBanner}
            >
              <Ionicons name="flame" size={28} color="#f59e0b" />
              <View>
                <Text style={styles.bannerTitle}>Trending This Week</Text>
                <Text style={styles.bannerSubtitle}>DJ Pulse moved to #1 globally</Text>
              </View>
            </LinearGradient>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Events</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.eventsList}>
              {MOCK_EVENTS.map(renderEventRow)}
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  leftColumn: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#1e1e2e',
  },
  divider: {
    width: 1,
    backgroundColor: '#1e1e2e',
  },
  rightColumn: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  livePulse: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#f1f5f9',
  },
  seeAll: {
    fontSize: 13,
    color: '#a78bfa',
    fontWeight: '600',
  },
  streamGrid: {
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
  streamCard: {
    flex: 1,
    margin: 6,
    backgroundColor: '#13131a',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e1e2e',
    overflow: 'hidden',
  },
  streamThumb: {
    height: 100,
    backgroundColor: 'rgba(124,58,237,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  streamOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
    gap: 4,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  liveText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#fff',
  },
  viewersBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
    gap: 3,
  },
  viewersText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  streamInfo: {
    padding: 10,
  },
  streamTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: 2,
  },
  streamDj: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 6,
  },
  activityList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2a',
    gap: 12,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  activityInfo: {
    flex: 1,
  },
  activityText: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
  },
  commentText: {
    fontSize: 12,
    color: '#cbd5e1',
    lineHeight: 17,
    marginTop: 4,
  },
  activityUser: {
    fontWeight: '700',
    color: '#f1f5f9',
  },
  activityTime: {
    fontSize: 11,
    color: '#475569',
    marginTop: 3,
  },
  trendingBanner: {
    margin: 20,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f1f5f9',
  },
  bannerSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  eventsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#13131a',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1e1e2e',
    gap: 14,
  },
  eventDate: {
    width: 44,
    alignItems: 'center',
    backgroundColor: 'rgba(124,58,237,0.15)',
    borderRadius: 8,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.2)',
  },
  eventDateMonth: {
    fontSize: 9,
    fontWeight: '700',
    color: '#a78bfa',
    letterSpacing: 0.5,
  },
  eventDateDay: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f1f5f9',
    lineHeight: 22,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: 4,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexWrap: 'wrap',
  },
  eventMetaText: {
    fontSize: 11,
    color: '#64748b',
  },
  eventPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#a78bfa',
  },
  notifBtn: {
    position: 'relative',
    padding: 4,
  },
  notifDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    borderWidth: 2,
    borderColor: '#0a0a0f',
  },
});
