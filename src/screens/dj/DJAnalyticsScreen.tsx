import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PageHeader from '../../components/layout/PageHeader';
import StatGrid, { StatItem } from '../../components/layout/StatGrid';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { djApi } from '../../api/dj';

type Period = '7d' | '30d' | '90d' | '1y';

const PERIODS: { value: Period; label: string }[] = [
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: '90d', label: '90d' },
  { value: '1y', label: '1y' },
];

export default function DJAnalyticsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('30d');
  const [analytics, setAnalytics] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchAnalytics = async (period: string) => {
    try {
      const response = await djApi.getMyAnalytics(period);
      // response is an axios response; actual data is response.data
      setAnalytics(response.data ?? response);
    } catch {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchAnalytics(selectedPeriod);
  }, [selectedPeriod]);

  if (loading) return <LoadingSpinner fullScreen />;

  const ch = (analytics.changes as Record<string, string>) ?? {};

  const STATS: StatItem[] = [
    {
      icon: 'radio-outline',
      iconColor: '#ef4444',
      value: String(analytics.totalStreams ?? 0),
      label: 'Total Streams',
      trend: ch.totalStreams?.startsWith('+') ? 'up' : ch.totalStreams ? 'down' : undefined,
      trendValue: ch.totalStreams,
    },
    {
      icon: 'eye-outline',
      iconColor: '#3b82f6',
      value: Number(analytics.totalViews ?? 0).toLocaleString(),
      label: 'Total Views',
      trend: ch.totalViews?.startsWith('+') ? 'up' : ch.totalViews ? 'down' : undefined,
      trendValue: ch.totalViews,
    },
    {
      icon: 'gift-outline',
      iconColor: '#a855f7',
      value: `$${Number(analytics.giftRevenue ?? 0).toFixed(2)}`,
      label: 'Gift Revenue',
      trend: ch.giftRevenue?.startsWith('+') ? 'up' : ch.giftRevenue ? 'down' : undefined,
      trendValue: ch.giftRevenue,
    },
    {
      icon: 'people-outline',
      iconColor: '#10b981',
      value: String(analytics.newFollowers ?? 0),
      label: 'New Followers',
      trend: ch.newFollowers?.startsWith('+') ? 'up' : ch.newFollowers ? 'down' : undefined,
      trendValue: ch.newFollowers,
    },
    {
      icon: 'musical-notes-outline',
      iconColor: '#f59e0b',
      value: String(analytics.setsSold ?? 0),
      label: 'Set Sales',
      trend: ch.setsSold?.startsWith('+') ? 'up' : ch.setsSold ? 'down' : undefined,
      trendValue: ch.setsSold,
    },
    {
      icon: 'briefcase-outline',
      iconColor: '#06b6d4',
      value: String(analytics.bookingDeals ?? 0),
      label: 'Booking Deals',
      trend: ch.bookingDeals?.startsWith('+') ? 'up' : ch.bookingDeals ? 'down' : undefined,
      trendValue: ch.bookingDeals,
    },
  ];

  const topEvents: any[] = analytics.topEvents ?? [];

  return (
    <View style={styles.container}>
      <PageHeader title="Analytics" subtitle="Your performance and earnings breakdown" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchAnalytics(selectedPeriod); }}
            tintColor="#7c3aed"
          />
        }
      >
        {/* Period selector */}
        <View style={styles.periodRow}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p.value}
              style={[styles.periodBtn, selectedPeriod === p.value && styles.periodBtnActive]}
              onPress={() => setSelectedPeriod(p.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.periodText, selectedPeriod === p.value && styles.periodTextActive]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {error ? (
          <View style={styles.errorRow}>
            <Ionicons name="warning-outline" size={16} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* 2-column stats grid — 3 per row using StatGrid with 3 columns, rendered twice */}
        <StatGrid stats={STATS.slice(0, 3)} columns={3} />
        <StatGrid stats={STATS.slice(3, 6)} columns={3} style={styles.statGridSecond} />

        {/* Top events section */}
        <View style={styles.topEventsCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar-outline" size={18} color="#f59e0b" />
            <Text style={styles.cardTitle}>Top Performing Events</Text>
          </View>
          {topEvents.length > 0 ? (
            topEvents.map((e: any, i: number) => (
              <View key={i} style={styles.eventRow}>
                <View style={styles.eventRank}>
                  <Text style={styles.eventRankText}>#{i + 1}</Text>
                </View>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventName}>{e.name || `Event ${i + 1}`}</Text>
                  <Text style={styles.eventDate}>{e.date || 'Recent'}</Text>
                </View>
                <Text style={styles.eventRevenue}>
                  {e.revenue != null ? `$${e.revenue}` : `${e.checkIns ?? 0} check-ins`}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No event data for this period</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  periodRow: {
    flexDirection: 'row',
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 4,
    gap: 8,
  },
  periodBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#13131a',
    borderWidth: 1,
    borderColor: '#1e1e2e',
  },
  periodBtnActive: { backgroundColor: 'rgba(124,58,237,0.2)', borderColor: '#7c3aed' },
  periodText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  periodTextActive: { color: '#a78bfa' },
  statGridSecond: { paddingTop: 0 },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 28,
    paddingBottom: 8,
  },
  errorText: { fontSize: 13, color: '#ef4444' },
  topEventsCard: {
    marginHorizontal: 28,
    marginBottom: 28,
    backgroundColor: '#13131a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e1e2e',
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f1f5f9',
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2e',
  },
  eventRank: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(124,58,237,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventRankText: { fontSize: 12, fontWeight: '800', color: '#a78bfa' },
  eventInfo: { flex: 1 },
  eventName: { fontSize: 13, fontWeight: '600', color: '#f1f5f9', marginBottom: 2 },
  eventDate: { fontSize: 11, color: '#64748b' },
  eventRevenue: { fontSize: 13, fontWeight: '700', color: '#10b981' },
  noDataText: { color: '#475569', fontSize: 13, textAlign: 'center', paddingVertical: 16 },
});
