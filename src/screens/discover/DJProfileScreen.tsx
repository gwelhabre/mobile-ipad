import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { DiscoverStackParamList } from '../../types';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { djApi } from '../../api/dj';

type Route = RouteProp<DiscoverStackParamList, 'DJProfile'>;

const MOCK_SETS = [
  { id: '1', title: 'Tech House Massive Vol.1', duration: 62, price: 8.99, sales: 340 },
  { id: '2', title: 'Deep Vibes Session', duration: 78, price: 6.99, sales: 210 },
  { id: '3', title: 'Underground Techno Mix', duration: 90, price: 12.99, sales: 158 },
  { id: '4', title: 'Late Night Grooves', duration: 55, price: 5.99, sales: 422 },
];

const MOCK_ACTIVITY = [
  { id: '1', text: 'Went live with 1,240 viewers', time: '2h ago', icon: 'radio' },
  { id: '2', text: 'Uploaded "Tech House Massive Vol.2"', time: '1d ago', icon: 'musical-note' },
  { id: '3', text: 'Moved up to #3 in global rankings', time: '2d ago', icon: 'trending-up' },
  { id: '4', text: 'Booked for Fabric London - June 15', time: '3d ago', icon: 'calendar' },
  { id: '5', text: 'Reached 50,000 followers milestone', time: '1w ago', icon: 'people' },
];

export default function DJProfileScreen() {
  const route = useRoute<Route>();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'sets' | 'activity'>('sets');

  const dj = {
    id: route.params.djId,
    displayName: 'DJ Pulse',
    username: 'djpulse',
    bio: 'Global touring DJ and producer. Resident at Fabric London. Known for blending Tech House and Deep Techno into hypnotic, floor-filling sets. Featured in DJ Mag Top 100.',
    genres: ['Tech House', 'Deep Techno', 'Minimal'],
    city: 'London',
    country: 'UK',
    rank: 3,
    score: 9540,
    followersCount: 52400,
    isLive: true,
    totalSets: 24,
    totalEarned: 18900,
    rating: 4.8,
    isVerified: true,
    isBookableForPrivateEvents: true,
    rankChange: 2,
  };

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      const response = isFollowing
        ? await djApi.unfollowDJ(dj.id)
        : await djApi.followDJ(dj.id);
      const next = 'following' in response.data ? response.data.following : !isFollowing;
      setIsFollowing(next);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error || 'Could not update follow status.');
    } finally {
      setFollowLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.layout}>
        {/* Left Pane — Avatar & Actions */}
        <View style={styles.leftPane}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <LinearGradient colors={['#1a0a2e', '#13131a']} style={styles.avatarSection}>
              <View style={styles.avatarWrapper}>
                <Avatar name={dj.displayName} size={120} showOnline={dj.isLive} />
                {dj.isVerified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={22} color="#7c3aed" />
                  </View>
                )}
              </View>
              <Text style={styles.displayName}>{dj.displayName}</Text>
              <Text style={styles.username}>@{dj.username}</Text>
              {dj.isLive && (
                <View style={styles.livePill}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE NOW</Text>
                </View>
              )}
              {dj.isBookableForPrivateEvents && (
                <Badge label="Private events" variant="emerald" size="sm" />
              )}
            </LinearGradient>

            {/* Stats */}
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Ionicons name="trophy" size={18} color="#f59e0b" />
                <Text style={styles.statValue}>#{dj.rank}</Text>
                <Text style={styles.statLabel}>Rank</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="people" size={18} color="#3b82f6" />
                <Text style={styles.statValue}>{(dj.followersCount / 1000).toFixed(1)}k</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="star" size={18} color="#f59e0b" />
                <Text style={styles.statValue}>{dj.rating}</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <Button
                label={isFollowing ? 'Following' : 'Follow'}
                onPress={handleFollow}
                loading={followLoading}
                variant={isFollowing ? 'outline' : 'primary'}
                style={styles.actionBtn}
              />
              {dj.isLive && (
                <Button
                  label="Watch Live"
                  onPress={() => Alert.alert('Live now', 'Open the Live tab to watch this DJ stream.')}
                  variant="secondary"
                  icon="radio"
                  style={styles.actionBtn}
                />
              )}
              <Button
                label="Send Gift"
                onPress={() => Alert.alert('Send a gift', 'Open the DJ’s active live stream to send a gift or tip.')}
                variant="ghost"
                icon="gift"
                style={styles.actionBtn}
              />
              {dj.isBookableForPrivateEvents && (
                <Button
                  label="Book for Private Event"
                  onPress={() => Alert.alert('Book this DJ', 'To send a booking proposal, switch to the Venue Manager dashboard and use the "Propose Deal" action.')}
                  variant="outline"
                  icon="calendar"
                  style={styles.actionBtn}
                />
              )}
            </View>

            {/* Location & Score */}
            <View style={styles.metaInfo}>
              <View style={styles.metaRow}>
                <Ionicons name="location-outline" size={15} color="#64748b" />
                <Text style={styles.metaText}>{dj.city}, {dj.country}</Text>
              </View>
              <View style={styles.metaRow}>
                <Ionicons name="analytics-outline" size={15} color="#64748b" />
                <Text style={styles.metaText}>Score: {dj.score.toLocaleString()}</Text>
              </View>
              <View style={styles.metaRow}>
                <Ionicons name="musical-notes-outline" size={15} color="#64748b" />
                <Text style={styles.metaText}>{dj.totalSets} sets published</Text>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Right Pane — Details */}
        <View style={styles.rightPane}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.rightContent}>
            {/* Bio */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.bio}>{dj.bio}</Text>
            </View>

            {/* Genre tags */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Genres</Text>
              <View style={styles.genreRow}>
                {dj.genres.map((g) => (
                  <Badge key={g} label={g} variant="purple" size="md" style={styles.genreBadge} />
                ))}
              </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabRow}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'sets' && styles.tabActive]}
                onPress={() => setActiveTab('sets')}
              >
                <Ionicons name="musical-notes-outline" size={16} color={activeTab === 'sets' ? '#a78bfa' : '#64748b'} />
                <Text style={[styles.tabText, activeTab === 'sets' && styles.tabTextActive]}>Sets ({dj.totalSets})</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'activity' && styles.tabActive]}
                onPress={() => setActiveTab('activity')}
              >
                <Ionicons name="time-outline" size={16} color={activeTab === 'activity' ? '#a78bfa' : '#64748b'} />
                <Text style={[styles.tabText, activeTab === 'activity' && styles.tabTextActive]}>Activity</Text>
              </TouchableOpacity>
            </View>

            {activeTab === 'sets' && (
              <View style={styles.setsList}>
                {MOCK_SETS.map((set) => (
                  <TouchableOpacity key={set.id} style={styles.setRow} activeOpacity={0.7}>
                    <View style={styles.setIcon}>
                      <Ionicons name="musical-note" size={20} color="#7c3aed" />
                    </View>
                    <View style={styles.setInfo}>
                      <Text style={styles.setTitle}>{set.title}</Text>
                      <Text style={styles.setMeta}>{set.duration} min  •  {set.sales} sales</Text>
                    </View>
                    <View style={styles.setRight}>
                      <Text style={styles.setPrice}>${set.price}</Text>
                      <TouchableOpacity style={styles.buyBtn}>
                        <Text style={styles.buyBtnText}>Buy</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {activeTab === 'activity' && (
              <View style={styles.activityList}>
                {MOCK_ACTIVITY.map((item) => (
                  <View key={item.id} style={styles.activityItem}>
                    <View style={styles.activityIconWrapper}>
                      <Ionicons name={item.icon as any} size={16} color="#7c3aed" />
                    </View>
                    <View style={styles.activityInfo}>
                      <Text style={styles.activityText}>{item.text}</Text>
                      <Text style={styles.activityTime}>{item.time}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  layout: { flex: 1, flexDirection: 'row' },
  leftPane: {
    width: '35%',
    borderRightWidth: 1,
    borderRightColor: '#1e1e2e',
  },
  rightPane: {
    flex: 1,
  },
  rightContent: {
    padding: 28,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 14,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 4,
    right: -4,
    backgroundColor: '#0a0a0f',
    borderRadius: 12,
  },
  displayName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f1f5f9',
    textAlign: 'center',
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 12,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  liveText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2e',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#1e1e2e',
  },
  statValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#f1f5f9',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  actionButtons: {
    padding: 16,
    gap: 8,
  },
  actionBtn: {
    width: '100%',
  },
  metaInfo: {
    padding: 16,
    paddingTop: 0,
    gap: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 13,
    color: '#94a3b8',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: 10,
  },
  bio: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 22,
  },
  genreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genreBadge: {},
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2e',
    marginBottom: 20,
    gap: 4,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 12,
    paddingHorizontal: 4,
    marginRight: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#7c3aed',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#a78bfa',
  },
  setsList: {
    gap: 8,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#13131a',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e1e2e',
    gap: 14,
  },
  setIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(124,58,237,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  setInfo: {
    flex: 1,
  },
  setTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: 3,
  },
  setMeta: {
    fontSize: 12,
    color: '#64748b',
  },
  setRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  setPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#a78bfa',
  },
  buyBtn: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 7,
  },
  buyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  activityList: {
    gap: 10,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#13131a',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e1e2e',
  },
  activityIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(124,58,237,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityInfo: { flex: 1 },
  activityText: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
  },
  activityTime: {
    fontSize: 11,
    color: '#475569',
    marginTop: 3,
  },
});
