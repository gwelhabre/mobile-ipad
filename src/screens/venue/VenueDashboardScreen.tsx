import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { VenueStackParamList } from '../../types';
import PageHeader from '../../components/layout/PageHeader';
import StatGrid, { StatItem } from '../../components/layout/StatGrid';
import Badge from '../../components/common/Badge';

type Nav = NativeStackNavigationProp<VenueStackParamList, 'VenueDashboard'>;

const STATS: StatItem[] = [
  { icon: 'briefcase', iconColor: '#10b981', value: '24', label: 'Total Deals', trend: 'up', trendValue: '+3' },
  { icon: 'calendar', iconColor: '#3b82f6', value: '8', label: 'Active Deals', trend: 'neutral' },
  { icon: 'cash', iconColor: '#a78bfa', value: '$12,400', label: 'Total Spent', trend: 'up', trendValue: '+$2.1k' },
  { icon: 'musical-notes', iconColor: '#f59e0b', value: '6', label: 'Upcoming Events', trend: 'up', trendValue: '+2' },
];

const UPCOMING_EVENTS = [
  { id: '1', title: 'Friday Night Fever', dj: 'DJ Pulse', date: '2026-06-13', tickets: '1200/1500', revenue: 24000 },
  { id: '2', title: 'Techno Saturday', dj: 'Nova Sound', date: '2026-06-20', tickets: '800/1500', revenue: 14400 },
  { id: '3', title: 'Deep House Sunday', dj: 'Electra', date: '2026-06-27', tickets: '450/1500', revenue: 9000 },
];

const RECENT_DEALS = [
  { id: '1', dj: 'DJ Pulse', amount: 800, status: 'accepted', date: '2026-06-13' },
  { id: '2', dj: 'Nova Sound', amount: 650, status: 'pending', date: '2026-06-20' },
  { id: '3', dj: 'Electra', amount: 550, status: 'pending', date: '2026-06-27' },
  { id: '4', dj: 'Bass Theory', amount: 480, status: 'completed', date: '2026-05-30' },
];

export default function VenueDashboardScreen() {
  const navigation = useNavigation<Nav>();

  const statusColor = (s: string) => ({ accepted: '#10b981', pending: '#f59e0b', completed: '#3b82f6', rejected: '#ef4444' }[s] || '#64748b');

  return (
    <View style={styles.container}>
      <PageHeader
        title="Venue Dashboard"
        subtitle="Manage Fabric London"
        actions={[
          { element: (
            <TouchableOpacity style={styles.newDealBtn}>
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={styles.newDealText}>Post Deal</Text>
            </TouchableOpacity>
          ) },
        ]}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Venue header */}
        <LinearGradient
          colors={['rgba(16,185,129,0.15)', 'rgba(124,58,237,0.1)', 'transparent']}
          style={styles.venueBanner}
        >
          <View style={styles.venueIcon}>
            <Ionicons name="business" size={32} color="#10b981" />
          </View>
          <View style={styles.venueInfo}>
            <Text style={styles.venueName}>Fabric London</Text>
            <View style={styles.venueMetaRow}>
              <Ionicons name="location-outline" size={13} color="#64748b" />
              <Text style={styles.venueMeta}>77A Charterhouse St, London</Text>
              <Ionicons name="people-outline" size={13} color="#64748b" />
              <Text style={styles.venueMeta}>Cap: 1,500</Text>
            </View>
          </View>
          <View style={styles.venueRating}>
            <Ionicons name="star" size={16} color="#f59e0b" />
            <Text style={styles.venueRatingText}>4.9</Text>
          </View>
        </LinearGradient>

        <StatGrid stats={STATS} columns={4} />

        {/* Go Live */}
        <TouchableOpacity style={styles.goLiveBtn} onPress={() => navigation.navigate('VenueBroadcast')} activeOpacity={0.85}>
          <View style={styles.goLiveDot} />
          <View style={{ flex: 1 }}>
            <Text style={styles.goLiveText}>Go Live</Text>
            <Text style={styles.goLiveSubtext}>Stream your venue ambiance</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#fff" />
        </TouchableOpacity>

        {/* Quick actions */}
        <View style={styles.quickActions}>
          {([
            { label: 'Post Event', icon: 'calendar-outline' as const, color: '#3b82f6', onPress: () => navigation.navigate('VenuePostEvent') },
            { label: 'Find DJs', icon: 'headset-outline' as const, color: '#a855f7', onPress: () => navigation.navigate('VenueFindDJs') },
            { label: 'Analytics', icon: 'bar-chart-outline' as const, color: '#ec4899', onPress: () => navigation.navigate('VenueAnalytics') },
            { label: 'View Deals', icon: 'receipt-outline' as const, color: '#f59e0b', onPress: () => navigation.navigate('VenueDeals') },
          ] as Array<{ label: string; icon: any; color: string; onPress: () => void }>).map((a) => (
            <TouchableOpacity key={a.label} style={styles.quickBtn} onPress={a.onPress} activeOpacity={0.75}>
              <View style={[styles.quickIcon, { backgroundColor: `${a.color}20` }]}>
                <Ionicons name={a.icon} size={20} color={a.color} />
              </View>
              <Text style={styles.quickLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Two column layout */}
        <View style={styles.twoCol}>
          {/* Left: Recent deals */}
          <View style={styles.col}>
            <View style={styles.colHeader}>
              <Text style={styles.colTitle}>Recent Deals</Text>
              <TouchableOpacity onPress={() => navigation.navigate('VenueDeals')}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            {RECENT_DEALS.map((deal) => (
              <View key={deal.id} style={styles.dealRow}>
                <View style={styles.djAvatar}>
                  <Text style={styles.djAvatarText}>{deal.dj.charAt(0)}</Text>
                </View>
                <View style={styles.dealInfo}>
                  <Text style={styles.djName}>{deal.dj}</Text>
                  <Text style={styles.dealDate}>
                    {new Date(deal.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Text>
                </View>
                <View style={styles.dealRight}>
                  <Text style={styles.dealAmount}>${deal.amount}</Text>
                  <View style={[styles.dealStatusBadge, { backgroundColor: `${statusColor(deal.status)}18` }]}>
                    <Text style={[styles.dealStatusText, { color: statusColor(deal.status) }]}>
                      {deal.status}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Right: Upcoming events */}
          <View style={styles.col}>
            <View style={styles.colHeader}>
              <Text style={styles.colTitle}>Upcoming Events</Text>
            </View>
            {UPCOMING_EVENTS.map((event) => (
              <View key={event.id} style={styles.eventRow}>
                <View style={styles.eventDateBlock}>
                  <Text style={styles.eventMonth}>
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                  </Text>
                  <Text style={styles.eventDay}>{new Date(event.date).getDate()}</Text>
                </View>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDJ}>{event.dj}</Text>
                  <View style={styles.eventMeta}>
                    <Ionicons name="ticket-outline" size={12} color="#64748b" />
                    <Text style={styles.eventMetaText}>{event.tickets}</Text>
                  </View>
                </View>
                <View style={styles.eventRevenue}>
                  <Text style={styles.eventRevenueLabel}>Revenue</Text>
                  <Text style={styles.eventRevenueValue}>${(event.revenue / 1000).toFixed(0)}k</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  venueBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 28,
    marginTop: 16,
    marginBottom: 4,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.15)',
    gap: 16,
  },
  venueIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(16,185,129,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  venueInfo: { flex: 1 },
  venueName: { fontSize: 20, fontWeight: '800', color: '#f1f5f9', marginBottom: 6 },
  venueMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  venueMeta: { fontSize: 12, color: '#64748b' },
  venueRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(245,158,11,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  venueRatingText: { fontSize: 16, fontWeight: '800', color: '#f59e0b' },
  twoCol: {
    flexDirection: 'row',
    paddingHorizontal: 28,
    paddingBottom: 28,
    gap: 20,
  },
  col: { flex: 1 },
  colHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  colTitle: { fontSize: 16, fontWeight: '700', color: '#f1f5f9' },
  seeAll: { fontSize: 13, color: '#a78bfa', fontWeight: '600' },
  dealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#13131a',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1e1e2e',
    gap: 12,
  },
  djAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  djAvatarText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  dealInfo: { flex: 1 },
  djName: { fontSize: 14, fontWeight: '700', color: '#f1f5f9', marginBottom: 2 },
  dealDate: { fontSize: 12, color: '#64748b' },
  dealRight: { alignItems: 'flex-end', gap: 4 },
  dealAmount: { fontSize: 15, fontWeight: '800', color: '#a78bfa' },
  dealStatusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5 },
  dealStatusText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
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
  eventDateBlock: {
    width: 46,
    alignItems: 'center',
    backgroundColor: 'rgba(124,58,237,0.12)',
    borderRadius: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.2)',
  },
  eventMonth: { fontSize: 8, fontWeight: '700', color: '#a78bfa', letterSpacing: 0.5 },
  eventDay: { fontSize: 18, fontWeight: '800', color: '#f1f5f9' },
  eventInfo: { flex: 1 },
  eventTitle: { fontSize: 14, fontWeight: '700', color: '#f1f5f9', marginBottom: 2 },
  eventDJ: { fontSize: 12, color: '#a78bfa', fontWeight: '600', marginBottom: 4 },
  eventMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  eventMetaText: { fontSize: 11, color: '#64748b' },
  eventRevenue: { alignItems: 'flex-end' },
  eventRevenueLabel: { fontSize: 10, color: '#64748b', marginBottom: 2 },
  eventRevenueValue: { fontSize: 16, fontWeight: '800', color: '#10b981' },
  newDealBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#7c3aed',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  newDealText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  goLiveBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#2d0a0a', borderWidth: 1, borderColor: '#ef4444',
    borderRadius: 16, padding: 18, marginHorizontal: 28, marginBottom: 16,
  },
  goLiveDot: {
    width: 12, height: 12, borderRadius: 6, backgroundColor: '#ef4444',
  },
  goLiveText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  goLiveSubtext: { color: '#fca5a5', fontSize: 13, marginTop: 2 },
  quickActions: {
    flexDirection: 'row', gap: 12, paddingHorizontal: 28, paddingBottom: 16,
  },
  quickBtn: {
    flex: 1, alignItems: 'center', gap: 8, backgroundColor: '#13131a',
    borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#1e1e2e',
  },
  quickIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  quickLabel: { color: '#e5e7eb', fontSize: 12, fontWeight: '600', textAlign: 'center' },
});
