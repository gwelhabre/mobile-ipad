import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PageHeader from '../../components/layout/PageHeader';
import RankingRow from '../../components/dj/RankingRow';
import { RankingEntry } from '../../types';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { rankingsApi } from '../../api/rankings';

type Period = 'daily' | 'weekly' | 'monthly' | 'alltime';

const PERIODS: { value: Period; label: string }[] = [
  { value: 'daily', label: 'Today' },
  { value: 'weekly', label: 'This Week' },
  { value: 'monthly', label: 'This Month' },
  { value: 'alltime', label: 'All Time' },
];

const GENRES = ['All', 'Tech House', 'Techno', 'Trance', 'D&B', 'Melodic', 'Afro House'];

export default function RankingsScreen() {
  const [period, setPeriod] = useState<Period>('weekly');
  const [genre, setGenre] = useState('All');
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRankings = useCallback(async () => {
    try {
      const response = await rankingsApi.getRankings(period, genre === 'All' ? undefined : genre, 1, 100);
      setRankings(response.data.data.data);
    } catch {
      setRankings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period, genre]);

  useEffect(() => {
    setLoading(true);
    fetchRankings();
  }, [fetchRankings]);

  const filtered = rankings.filter((r) =>
    genre === 'All' || r.genre.toLowerCase().includes(genre.toLowerCase().replace('d&b', 'drum')),
  );

  return (
    <View style={styles.container}>
      <PageHeader
        title="DJ Rankings"
        subtitle={`${rankings.length} ranked DJs`}
        actions={[{
          element: (
            <TouchableOpacity style={styles.refreshBtn} onPress={() => { setRefreshing(true); fetchRankings(); }}>
              <Ionicons name="refresh-outline" size={18} color="#a78bfa" />
              <Text style={styles.refreshText}>Refresh</Text>
            </TouchableOpacity>
          ),
        }]}
      />

      {/* Controls */}
      <View style={styles.controls}>
        {/* Period selector */}
        <View style={styles.periodSelector}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p.value}
              style={[styles.periodBtn, period === p.value && styles.periodBtnActive]}
              onPress={() => setPeriod(p.value)}
            >
              <Text style={[styles.periodText, period === p.value && styles.periodTextActive]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Genre filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.genreFilter}>
            {GENRES.map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.genreChip, genre === g && styles.genreChipActive]}
                onPress={() => setGenre(g)}
              >
                <Text style={[styles.genreText, genre === g && styles.genreTextActive]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Table header */}
      <View style={styles.tableHeader}>
        <View style={styles.thRank}><Text style={styles.thText}>RANK</Text></View>
        <View style={styles.thChange}><Text style={styles.thText}>CHG</Text></View>
        <View style={styles.thDJ}><Text style={styles.thText}>DJ / ARTIST</Text></View>
        <View style={styles.thScore}><Text style={[styles.thText, styles.thRight]}>SCORE</Text></View>
        <View style={styles.thGenre}><Text style={styles.thText}>GENRE</Text></View>
        <View style={styles.thCity}><Text style={styles.thText}>CITY</Text></View>
        <View style={styles.thFollowers}><Text style={[styles.thText, styles.thRight]}>FOLLOWERS</Text></View>
      </View>

      {loading ? (
        <LoadingSpinner message="Loading rankings..." />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.djId}
          renderItem={({ item }) => <RankingRow entry={item} />}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRankings(); }} tintColor="#7c3aed" />}
          ListEmptyComponent={<EmptyState icon="trophy-outline" title="No rankings found" subtitle="Ranked DJs will appear here." />}
          ListFooterComponent={<View style={{ height: 24 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  controls: {
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2e',
    backgroundColor: '#0d0d16',
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 10,
    gap: 4,
  },
  periodBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#13131a',
    borderWidth: 1,
    borderColor: '#1e1e2e',
  },
  periodBtnActive: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  periodText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  periodTextActive: {
    color: '#fff',
  },
  genreFilter: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 12,
    gap: 6,
  },
  genreChip: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#13131a',
    borderWidth: 1,
    borderColor: '#1e1e2e',
  },
  genreChipActive: {
    backgroundColor: 'rgba(124,58,237,0.15)',
    borderColor: 'rgba(124,58,237,0.4)',
  },
  genreText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  genreTextActive: {
    color: '#a78bfa',
    fontWeight: '700',
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2e',
    backgroundColor: '#0d0d16',
  },
  thRank: { width: 56, alignItems: 'center' },
  thChange: { width: 52 },
  thDJ: { flex: 1 },
  thScore: { width: 90, alignItems: 'flex-end' },
  thGenre: { width: 100, paddingLeft: 16 },
  thCity: { width: 110, paddingLeft: 16 },
  thFollowers: { width: 80, alignItems: 'flex-end' },
  thText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.8,
  },
  thRight: {
    textAlign: 'right',
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(124,58,237,0.1)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.2)',
  },
  refreshText: {
    fontSize: 13,
    color: '#a78bfa',
    fontWeight: '600',
  },
});
