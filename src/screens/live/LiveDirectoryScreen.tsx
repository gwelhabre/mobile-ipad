import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LiveStackParamList } from '../../types';
import PageHeader from '../../components/layout/PageHeader';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';

type Nav = NativeStackNavigationProp<LiveStackParamList, 'LiveDirectory'>;

const MOCK_STREAMS = Array.from({ length: 16 }, (_, i) => ({
  id: `stream-${i}`,
  djName: ['DJ Pulse', 'Nova Sound', 'Electra', 'Bass Theory', 'Phantom Wave', 'Sonic Drive', 'Aurora Beats', 'Neon Flux', 'Crystal Method', 'Dark Matter', 'Echo Storm', 'Voltage', 'Prism', 'Nebula', 'Orbit', 'Cascade'][i],
  title: ['Tech House Massive', 'Deep Night Vibes', 'Trance Journey', 'Bass & Breaks', 'Midnight Techno', 'Sunset Session', 'Morning Groove', 'Underground Special', 'Peak Time Set', 'Dark Hours', 'Friday Rush', 'Weekend Warmup', 'Late Night Drive', 'Dawn Mix', 'Club Essentials', 'Warehouse Set'][i],
  genre: ['Tech House', 'Deep House', 'Trance', 'Drum & Bass', 'Techno', 'Melodic', 'Afro House', 'Minimal', 'Peak Time', 'Dark Techno', 'Tech House', 'Progressive', 'Techno', 'Ambient', 'House', 'Techno'][i],
  viewerCount: [2840, 1392, 4103, 845, 1789, 2580, 1240, 680, 3200, 560, 1100, 2200, 940, 430, 1850, 720][i],
  isHD: i % 3 !== 2,
  tags: [['house', 'groove'], ['deep', 'night'], ['trance', 'uplifting']][i % 3],
}));

const GENRES = ['All', 'Tech House', 'Techno', 'Trance', 'D&B', 'Melodic', 'Deep House'];

export default function LiveDirectoryScreen() {
  const navigation = useNavigation<Nav>();
  const [selectedGenre, setSelectedGenre] = useState('All');

  const totalViewers = MOCK_STREAMS.reduce((sum, s) => sum + s.viewerCount, 0);

  const filtered = MOCK_STREAMS.filter(
    (s) => selectedGenre === 'All' || s.genre.toLowerCase().includes(selectedGenre.toLowerCase()),
  );

  const renderStreamCard = ({ item }: { item: typeof MOCK_STREAMS[0] }) => (
    <TouchableOpacity
      style={styles.streamCard}
      onPress={() => navigation.navigate('LiveStream', { streamId: item.id, djName: item.djName })}
      activeOpacity={0.8}
    >
      {/* Thumbnail */}
      <View style={styles.thumbnail}>
        <Avatar name={item.djName} size={52} />
        {/* Live badge */}
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
        {item.isHD && (
          <View style={styles.hdBadge}>
            <Text style={styles.hdText}>HD</Text>
          </View>
        )}
        {/* Viewer count */}
        <View style={styles.viewersBadge}>
          <Ionicons name="eye" size={12} color="#fff" />
          <Text style={styles.viewersText}>
            {item.viewerCount >= 1000
              ? `${(item.viewerCount / 1000).toFixed(1)}k`
              : item.viewerCount}
          </Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.cardInfo}>
        <Text style={styles.djName}>{item.djName}</Text>
        <Text style={styles.streamTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.cardMeta}>
          <Badge label={item.genre} variant="purple" size="sm" />
        </View>
        <View style={styles.tagsRow}>
          {item.tags.map((tag) => (
            <Text key={tag} style={styles.tag}>#{tag}</Text>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <PageHeader
        title="Live Now"
        subtitle={`${MOCK_STREAMS.length} streams • ${totalViewers.toLocaleString()} watching`}
        actions={[{
          element: (
            <View style={styles.liveCountBadge}>
              <View style={styles.livePulse} />
              <Text style={styles.liveCountText}>{MOCK_STREAMS.length} LIVE</Text>
            </View>
          ),
        }]}
      />

      {/* Genre filter */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
          {GENRES.map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.filterChip, selectedGenre === g && styles.filterChipActive]}
              onPress={() => setSelectedGenre(g)}
            >
              <Text style={[styles.filterChipText, selectedGenre === g && styles.filterChipTextActive]}>
                {g}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 4-column grid */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderStreamCard}
        numColumns={4}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  filterBar: {
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2e',
  },
  filterContent: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#13131a',
    borderWidth: 1,
    borderColor: '#1e1e2e',
  },
  filterChipActive: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderColor: '#ef4444',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b',
  },
  filterChipTextActive: {
    color: '#f87171',
    fontWeight: '700',
  },
  grid: {
    padding: 16,
    paddingBottom: 24,
  },
  streamCard: {
    flex: 1,
    margin: 6,
    backgroundColor: '#13131a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e1e2e',
    overflow: 'hidden',
  },
  thumbnail: {
    height: 150,
    backgroundColor: '#0d0d1a',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  liveBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  hdBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(16,185,129,0.25)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.4)',
  },
  hdText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#34d399',
  },
  viewersBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  viewersText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  cardInfo: {
    padding: 14,
  },
  djName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#a78bfa',
    marginBottom: 2,
  },
  streamTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: 8,
    lineHeight: 19,
  },
  cardMeta: {
    marginBottom: 6,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    fontSize: 11,
    color: '#475569',
  },
  liveCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    gap: 7,
  },
  livePulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  liveCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#f87171',
    letterSpacing: 0.5,
  },
});
