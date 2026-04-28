import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { DJStackParamList } from '../../types';
import PageHeader from '../../components/layout/PageHeader';
import StatGrid, { StatItem } from '../../components/layout/StatGrid';
import Badge from '../../components/common/Badge';

type Nav = NativeStackNavigationProp<DJStackParamList, 'DJDashboard'>;

const STATS: StatItem[] = [
  { icon: 'cash', iconColor: '#10b981', value: '$2,840', label: 'Monthly Earnings', trend: 'up', trendValue: '+18%' },
  { icon: 'people', iconColor: '#3b82f6', value: '52,400', label: 'Followers', trend: 'up', trendValue: '+1.2k' },
  { icon: 'trophy', iconColor: '#f59e0b', value: '#3', label: 'Global Rank', trend: 'up', trendValue: '+2' },
  { icon: 'radio', iconColor: '#ef4444', value: '24', label: 'Live Streams', trend: 'up', trendValue: '+4' },
];

const MOCK_DEALS = [
  { id: '1', venue: 'Fabric London', amount: 800, date: '2026-06-15', status: 'accepted' },
  { id: '2', venue: 'Berghain', amount: 1200, date: '2026-07-02', status: 'pending' },
  { id: '3', venue: 'Egg London', amount: 600, date: '2026-06-28', status: 'pending' },
  { id: '4', venue: 'Club Nexus', amount: 450, date: '2026-06-20', status: 'accepted' },
];

const ANALYTICS_ITEMS = [
  { label: 'Avg. Viewers', value: '1,240', icon: 'eye', color: '#3b82f6' },
  { label: 'Gifts Received', value: '$480', icon: 'gift', color: '#a78bfa' },
  { label: 'Sets Sold', value: '68', icon: 'disc', color: '#10b981' },
  { label: 'Engagement', value: '8.4%', icon: 'trending-up', color: '#f59e0b' },
];

export default function DJDashboardScreen() {
  const navigation = useNavigation<Nav>();

  const statusColor = (s: string) => ({ accepted: '#10b981', pending: '#f59e0b', rejected: '#ef4444' }[s] || '#64748b');

  return (
    <View style={styles.container}>
      <PageHeader
        title="DJ Dashboard"
        subtitle="Manage your DJ career and earnings"
        actions={[
          { element: (
            <TouchableOpacity style={styles.liveBtn}>
              <View style={styles.liveDot} />
              <Text style={styles.liveBtnText}>Go Live</Text>
            </TouchableOpacity>
          ) },
        ]}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero banner */}
        <LinearGradient
          colors={['rgba(124,58,237,0.2)', 'rgba(16,185,129,0.1)', 'transparent']}
          style={styles.heroBanner}
        >
          <View style={styles.heroContent}>
            <Text style={styles.heroGreeting}>Good evening, DJ Pulse</Text>
            <Text style={styles.heroSubtitle}>You have 2 pending deals and a stream scheduled for tonight.</Text>
          </View>
          <View style={styles.heroRank}>
            <Text style={styles.heroRankLabel}>GLOBAL RANK</Text>
            <Text style={styles.heroRankValue}>#3</Text>
          </View>
        </LinearGradient>

        {/* Stats */}
        <StatGrid stats={STATS} columns={4} />

        {/* Two-column layout */}
        <View style={styles.twoCol}>
          {/* Deals */}
          <View style={styles.col}>
            <View style={styles.colHeader}>
              <Text style={styles.colTitle}>Recent Deals</Text>
              <TouchableOpacity onPress={() => navigation.navigate('DJDeals')}>
                <Text style={styles.colSeeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            {MOCK_DEALS.map((deal) => (
              <View key={deal.id} style={styles.dealRow}>
                <View style={styles.dealIconWrapper}>
                  <Ionicons name="briefcase" size={18} color="#a78bfa" />
                </View>
                <View style={styles.dealInfo}>
                  <Text style={styles.dealVenue}>{deal.venue}</Text>
                  <Text style={styles.dealDate}>
                    {new Date(deal.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Text>
                </View>
                <View style={styles.dealRight}>
                  <Text style={styles.dealAmount}>${deal.amount}</Text>
                  <View style={[styles.dealStatus, { backgroundColor: `${statusColor(deal.status)}18` }]}>
                    <Text style={[styles.dealStatusText, { color: statusColor(deal.status) }]}>
                      {deal.status}
                    </Text>
                  </View>
                </View>
              </View>
            ))}

            {/* Quick actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('DJSets')}>
                <Ionicons name="musical-notes" size={20} color="#a78bfa" />
                <Text style={styles.quickActionText}>My Sets</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('DJAnalytics')}>
                <Ionicons name="analytics" size={20} color="#10b981" />
                <Text style={styles.quickActionText}>Analytics</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Analytics preview */}
          <View style={styles.col}>
            <View style={styles.colHeader}>
              <Text style={styles.colTitle}>Performance Overview</Text>
              <TouchableOpacity onPress={() => navigation.navigate('DJAnalytics')}>
                <Text style={styles.colSeeAll}>Full Analytics</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.analyticsGrid}>
              {ANALYTICS_ITEMS.map((item) => (
                <View key={item.label} style={styles.analyticsCard}>
                  <View style={[styles.analyticsIcon, { backgroundColor: `${item.color}18` }]}>
                    <Ionicons name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <Text style={styles.analyticsValue}>{item.value}</Text>
                  <Text style={styles.analyticsLabel}>{item.label}</Text>
                </View>
              ))}
            </View>

            {/* Rank chart placeholder */}
            <View style={styles.rankChart}>
              <View style={styles.rankChartHeader}>
                <Text style={styles.rankChartTitle}>Rank History (7 days)</Text>
              </View>
              <View style={styles.rankChartBody}>
                {[5, 4, 3, 4, 3, 3, 3].map((rank, idx) => (
                  <View key={idx} style={styles.rankBarCol}>
                    <View style={[styles.rankBar, { height: rank * 16 }]} />
                    <Text style={styles.rankBarLabel}>#{rank}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  heroBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 28,
    marginTop: 16,
    marginBottom: 4,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.2)',
  },
  heroContent: { flex: 1 },
  heroGreeting: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f1f5f9',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
  },
  heroRank: {
    alignItems: 'center',
    backgroundColor: 'rgba(245,158,11,0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.2)',
    marginLeft: 20,
  },
  heroRankLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#f59e0b',
    letterSpacing: 1,
  },
  heroRankValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#f59e0b',
  },
  twoCol: {
    flexDirection: 'row',
    paddingHorizontal: 28,
    paddingBottom: 28,
    gap: 20,
  },
  col: {
    flex: 1,
  },
  colHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  colTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f1f5f9',
  },
  colSeeAll: {
    fontSize: 13,
    color: '#a78bfa',
    fontWeight: '600',
  },
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
  dealIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(124,58,237,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dealInfo: { flex: 1 },
  dealVenue: { fontSize: 14, fontWeight: '700', color: '#f1f5f9', marginBottom: 2 },
  dealDate: { fontSize: 12, color: '#64748b' },
  dealRight: { alignItems: 'flex-end', gap: 4 },
  dealAmount: { fontSize: 15, fontWeight: '800', color: '#a78bfa' },
  dealStatus: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5 },
  dealStatusText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#13131a',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e1e2e',
  },
  quickActionText: { fontSize: 13, fontWeight: '600', color: '#94a3b8' },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  analyticsCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#13131a',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e1e2e',
  },
  analyticsIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  analyticsValue: { fontSize: 20, fontWeight: '800', color: '#f1f5f9', marginBottom: 2 },
  analyticsLabel: { fontSize: 11, color: '#64748b' },
  rankChart: {
    backgroundColor: '#13131a',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1e1e2e',
  },
  rankChartHeader: { marginBottom: 14 },
  rankChartTitle: { fontSize: 13, fontWeight: '700', color: '#94a3b8' },
  rankChartBody: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    height: 80,
  },
  rankBarCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  rankBar: {
    width: '80%',
    backgroundColor: '#7c3aed',
    borderRadius: 4,
    minHeight: 8,
  },
  rankBarLabel: { fontSize: 9, color: '#64748b', fontWeight: '600' },
  liveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  liveBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
});
