import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { venueDealApi } from '../../api/events';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Avatar from '../../components/common/Avatar';

const STATUS_VARIANTS: Record<string, 'success' | 'warning' | 'error' | 'info' | 'purple' | 'default'> = {
  proposed: 'info',
  negotiating: 'warning',
  agreed: 'success',
  paid_deposit: 'purple',
  completed: 'default',
  cancelled: 'error',
};

const MOCK_DEALS = [
  { id: '1', djName: 'DJ Pulse', djStage: 'DJ Pulse', venue: 'Fabric London', amount: 800, date: '2026-06-15', status: 'agreed', eventName: 'Summer Rave 2026' },
  { id: '2', djName: 'VoltMaster', djStage: 'VoltMaster', venue: 'Fabric London', amount: 1200, date: '2026-07-02', status: 'negotiating', eventName: 'Voltage Nights' },
  { id: '3', djName: 'Neon Rider', djStage: 'Neon Rider', venue: 'Fabric London', amount: 600, date: '2026-06-28', status: 'proposed', eventName: 'Neon Festival' },
  { id: '4', djName: 'BeatCraft', djStage: 'BeatCraft', venue: 'Fabric London', amount: 950, date: '2026-05-20', status: 'completed', eventName: 'House Night' },
  { id: '5', djName: 'SubZero', djStage: 'SubZero', venue: 'Fabric London', amount: 750, date: '2026-05-10', status: 'completed', eventName: 'Deep Session' },
];

export default function VenueDealsScreen() {
  const [deals, setDeals] = useState(MOCK_DEALS);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const load = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      setDeals(MOCK_DEALS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAction = (dealId: string, action: 'accept' | 'reject' | 'counter') => {
    Alert.alert(
      action === 'accept' ? 'Accept Deal' : action === 'reject' ? 'Reject Deal' : 'Counter Offer',
      `${action === 'accept' ? 'Accept' : action === 'reject' ? 'Reject' : 'Counter'} this booking deal?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          style: action === 'reject' ? 'destructive' : 'default',
          onPress: () => {
            if (action === 'accept') {
              setDeals(prev => prev.map(d => d.id === dealId ? { ...d, status: 'agreed' } : d));
            }
          },
        },
      ],
    );
  };

  const filtered = deals.filter(d => {
    if (filter === 'active') return ['proposed', 'negotiating', 'agreed', 'paid_deposit'].includes(d.status);
    if (filter === 'completed') return ['completed', 'cancelled'].includes(d.status);
    return true;
  });

  const renderDeal = ({ item }: { item: typeof MOCK_DEALS[0] }) => (
    <Card style={styles.dealCard}>
      <View style={styles.dealHeader}>
        <Avatar name={item.djName} size={44} />
        <View style={styles.dealInfo}>
          <Text style={styles.djName}>{item.djStage}</Text>
          <Text style={styles.eventName}>{item.eventName}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={13} color="#6b7280" />
            <Text style={styles.metaText}>{new Date(item.date).toLocaleDateString()}</Text>
          </View>
        </View>
        <View style={styles.dealRight}>
          <Text style={styles.amount}>${item.amount.toLocaleString()}</Text>
          <Badge label={item.status.replace('_', ' ')} variant={STATUS_VARIANTS[item.status] ?? 'default'} />
        </View>
      </View>

      {['proposed', 'negotiating'].includes(item.status) && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAction(item.id, 'accept')}>
            <Ionicons name="checkmark-outline" size={16} color="#10b981" />
            <Text style={styles.acceptText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.counterBtn} onPress={() => handleAction(item.id, 'counter')}>
            <Ionicons name="swap-horizontal-outline" size={16} color="#f59e0b" />
            <Text style={styles.counterText}>Counter</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rejectBtn} onPress={() => handleAction(item.id, 'reject')}>
            <Ionicons name="close-outline" size={16} color="#ef4444" />
            <Text style={styles.rejectText}>Decline</Text>
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <PageHeader title="Booking Deals" subtitle={`${deals.length} total`} />

      <View style={styles.filters}>
        {(['all', 'active', 'completed'] as const).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={d => d.id}
        renderItem={renderDeal}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor="#a855f7" />}
        ListEmptyComponent={<EmptyState icon="briefcase-outline" message="No deals yet" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  filters: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingBottom: 16 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#ffffff20' },
  filterBtnActive: { backgroundColor: '#a855f720', borderColor: '#a855f7' },
  filterText: { color: '#ffffff60', fontSize: 13, fontWeight: '500' },
  filterTextActive: { color: '#a855f7' },
  list: { padding: 16 },
  row: { gap: 16, marginBottom: 16 },
  dealCard: { flex: 1, gap: 12 },
  dealHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  dealInfo: { flex: 1, gap: 4 },
  djName: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  eventName: { color: '#a855f7', fontSize: 13 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: '#6b7280', fontSize: 12 },
  dealRight: { alignItems: 'flex-end', gap: 6 },
  amount: { color: '#10b981', fontSize: 18, fontWeight: '800' },
  actions: { flexDirection: 'row', gap: 8, borderTopWidth: 1, borderTopColor: '#ffffff10', paddingTop: 12 },
  acceptBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 8, borderRadius: 10, backgroundColor: '#10b98115', borderWidth: 1, borderColor: '#10b98130' },
  acceptText: { color: '#10b981', fontSize: 13, fontWeight: '600' },
  counterBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 8, borderRadius: 10, backgroundColor: '#f59e0b15', borderWidth: 1, borderColor: '#f59e0b30' },
  counterText: { color: '#f59e0b', fontSize: 13, fontWeight: '600' },
  rejectBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 8, borderRadius: 10, backgroundColor: '#ef444415', borderWidth: 1, borderColor: '#ef444430' },
  rejectText: { color: '#ef4444', fontSize: 13, fontWeight: '600' },
});
