import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { competitionsApi } from '../../api/rankings';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Competition } from '../../types';

const FORMAT_COLORS: Record<string, string> = {
  battle: '#ef4444',
  elimination: '#f59e0b',
  fan_vote: '#a855f7',
  judge_panel: '#3b82f6',
};

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'error' | 'info' | 'purple' | 'default'> = {
  upcoming: 'info',
  active: 'success',
  voting: 'warning',
  completed: 'default',
};

const MOCK: Competition[] = [
  {
    id: '1', name: 'Summer Beatdown 2026', format: 'battle', status: 'active',
    prize: '$5,000', startDate: '2026-06-01', endDate: '2026-06-30',
    entryCount: 32, maxEntries: 64, description: 'The hottest summer DJ battle',
  },
  {
    id: '2', name: 'Global Spin Championship', format: 'judge_panel', status: 'upcoming',
    prize: '$20,000', startDate: '2026-07-15', endDate: '2026-08-15',
    entryCount: 8, maxEntries: 32, description: 'Worldwide DJ championship judged by industry legends',
  },
  {
    id: '3', name: 'Fan Favorite DJ 2026', format: 'fan_vote', status: 'voting',
    prize: '$2,500', startDate: '2026-05-01', endDate: '2026-06-15',
    entryCount: 64, maxEntries: 64, description: 'The fans decide who reigns supreme',
  },
  {
    id: '4', name: 'Underground Eliminator', format: 'elimination', status: 'upcoming',
    prize: '$3,000', startDate: '2026-07-01', endDate: '2026-07-20',
    entryCount: 12, maxEntries: 16, description: 'Survive or go home',
  },
  {
    id: '5', name: 'City Clash — London', format: 'battle', status: 'completed',
    prize: '$1,500', startDate: '2026-04-01', endDate: '2026-04-30',
    entryCount: 16, maxEntries: 16, description: 'London\'s finest compete',
  },
  {
    id: '6', name: 'Tech House Showdown', format: 'judge_panel', status: 'upcoming',
    prize: '$4,000', startDate: '2026-08-01', endDate: '2026-08-20',
    entryCount: 4, maxEntries: 20, description: 'Specialists in tech house only',
  },
];

export default function CompetitionsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming' | 'completed'>('all');

  const load = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      setCompetitions(MOCK);
    } catch {
      setCompetitions(MOCK);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === 'all' ? competitions : competitions.filter(c => c.status === filter);

  const renderItem = ({ item }: { item: Competition }) => (
    <TouchableOpacity onPress={() => navigation.navigate('CompetitionDetail', { id: item.id })}>
      <Card style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.cardLeft}>
            <View style={[styles.formatBadge, { backgroundColor: `${FORMAT_COLORS[item.format] ?? '#6b7280'}20` }]}>
              <Text style={[styles.formatText, { color: FORMAT_COLORS[item.format] ?? '#6b7280' }]}>
                {item.format.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
          </View>
          <View style={styles.cardRight}>
            <Badge label={item.status} variant={STATUS_COLORS[item.status] ?? 'default'} />
            <Text style={styles.prize}>{item.prize}</Text>
            <Text style={styles.prizeLabel}>prize pool</Text>
          </View>
        </View>
        <View style={styles.cardBottom}>
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={14} color="#6b7280" />
            <Text style={styles.metaText}>{item.entryCount} / {item.maxEntries} entries</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color="#6b7280" />
            <Text style={styles.metaText}>
              {new Date(item.startDate).toLocaleDateString()} – {new Date(item.endDate).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, {
              width: `${Math.min((item.entryCount / item.maxEntries) * 100, 100)}%`,
              backgroundColor: FORMAT_COLORS[item.format] ?? '#6b7280',
            }]} />
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <PageHeader title="Competitions" subtitle={`${competitions.length} competitions`} />

      <View style={styles.filters}>
        {(['all', 'active', 'upcoming', 'completed'] as const).map(f => (
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
        keyExtractor={i => i.id}
        renderItem={renderItem}
        numColumns={3}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor="#a855f7" />}
        ListEmptyComponent={<EmptyState icon="trophy-outline" message="No competitions found" />}
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
  card: { flex: 1 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 12 },
  cardLeft: { flex: 1 },
  cardRight: { alignItems: 'flex-end', gap: 4 },
  formatBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginBottom: 8 },
  formatText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  name: { color: '#ffffff', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  description: { color: '#ffffff60', fontSize: 13, lineHeight: 18 },
  prize: { color: '#10b981', fontSize: 20, fontWeight: '800', marginTop: 8 },
  prizeLabel: { color: '#6b7280', fontSize: 11 },
  cardBottom: { borderTopWidth: 1, borderTopColor: '#ffffff10', paddingTop: 12, gap: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { color: '#6b7280', fontSize: 12 },
  progressBar: { height: 4, backgroundColor: '#ffffff10', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
});
