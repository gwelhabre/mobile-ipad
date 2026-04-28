import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { DiscoverStackParamList, DJProfile } from '../../types';
import DJCard from '../../components/dj/DJCard';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/common/Badge';

type Nav = NativeStackNavigationProp<DiscoverStackParamList, 'DJs'>;

const GENRES = ['All', 'Tech House', 'Deep House', 'Techno', 'Trance', 'Drum & Bass', 'Melodic', 'Afro House', 'Progressive'];

const MOCK_DJS: DJProfile[] = Array.from({ length: 18 }, (_, i) => ({
  id: `dj-${i}`,
  userId: `user-${i}`,
  displayName: ['DJ Pulse', 'Nova Sound', 'Electra', 'Bass Theory', 'Phantom Wave', 'Sonic Drive', 'Aurora Beats', 'Neon Flux', 'Crystal Method', 'Dark Matter', 'Echo Storm', 'Voltage', 'Prism', 'Nebula', 'Orbit', 'Cascade', 'Vortex', 'Zenith'][i],
  username: ['djpulse', 'novasound', 'electra', 'basstheory', 'phantomwave', 'sonicdrive', 'aurorabeats', 'neonflux', 'crystalmethod', 'darkmatter', 'echostorm', 'voltage', 'prism', 'nebula', 'orbit', 'cascade', 'vortex', 'zenith'][i],
  avatarUrl: undefined,
  bannerUrl: undefined,
  bio: 'Electronic music artist and DJ',
  genres: [['Tech House', 'Deep House'], ['Techno', 'Minimal'], ['Trance', 'Progressive'], ['Drum & Bass', 'Jungle'], ['Melodic', 'Organic'], ['Afro House', 'Tribal'], ['Deep House', 'Soulful'], ['Techno', 'Industrial'], ['Electro', 'Breaks'], ['Dark Techno', 'Industrial'], ['Tech House', 'Techno'], ['Trance', 'Uplifting'], ['Progressive', 'Melodic'], ['Deep Tech', 'Minimal'], ['House', 'Disco'], ['Melodic', 'Afro'], ['Techno', 'Rave'], ['House', 'Deep']].slice(i, i + 1)[0] || ['House'],
  city: ['London', 'Berlin', 'NYC', 'Amsterdam', 'Ibiza', 'Paris', 'Tokyo', 'Sydney', 'LA', 'Chicago', 'Barcelona', 'Prague', 'Bucharest', 'Detroit', 'Chicago', 'Miami', 'Dublin', 'Vienna'][i],
  country: 'UK',
  rank: i + 1,
  rankChange: (i % 3 === 0 ? 2 : i % 3 === 1 ? -1 : 0),
  score: 10000 - i * 450,
  followersCount: (18 - i) * 5200,
  isLive: i % 4 === 0,
  totalSets: 20 + i * 3,
  totalEarned: (18 - i) * 1200,
  rating: 4.2 + (i % 8) * 0.1,
  isVerified: i < 6,
  createdAt: '2024-01-01',
}));

export default function DJsScreen() {
  const navigation = useNavigation<Nav>();
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');

  const filtered = MOCK_DJS.filter((dj) => {
    const matchesSearch = dj.displayName.toLowerCase().includes(search.toLowerCase()) ||
      dj.username.toLowerCase().includes(search.toLowerCase());
    const matchesGenre = selectedGenre === 'All' || dj.genres.some((g) => g.toLowerCase().includes(selectedGenre.toLowerCase()));
    return matchesSearch && matchesGenre;
  });

  return (
    <View style={styles.container}>
      <PageHeader title="Discover DJs" subtitle={`${MOCK_DJS.length} artists on the platform`} />

      {/* Search bar */}
      <View style={styles.searchArea}>
        <View style={styles.searchWrapper}>
          <Ionicons name="search-outline" size={18} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search DJs by name or username..."
            placeholderTextColor="#3d4460"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color="#64748b" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Genre filter */}
      <View style={styles.genreFilters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.genreScroll}>
          {GENRES.map((genre) => (
            <TouchableOpacity
              key={genre}
              style={[styles.genreChip, selectedGenre === genre && styles.genreChipActive]}
              onPress={() => setSelectedGenre(genre)}
              activeOpacity={0.7}
            >
              <Text style={[styles.genreChipText, selectedGenre === genre && styles.genreChipTextActive]}>
                {genre}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results count */}
      <View style={styles.resultsRow}>
        <Text style={styles.resultsText}>{filtered.length} DJs found</Text>
        <View style={styles.sortRow}>
          <Ionicons name="funnel-outline" size={14} color="#64748b" />
          <Text style={styles.sortText}>Sort: Top Ranked</Text>
        </View>
      </View>

      {/* DJ Grid — 3 columns */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <DJCard
              dj={item}
              onPress={() => navigation.navigate('DJProfile', { djId: item.id })}
            />
          </View>
        )}
        numColumns={3}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="musical-notes-outline" size={48} color="#3d4460" />
            <Text style={styles.emptyText}>No DJs found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  searchArea: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2e',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#13131a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e1e2e',
    paddingHorizontal: 16,
    height: 46,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#f1f5f9',
  },
  genreFilters: {
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2e',
  },
  genreScroll: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
  },
  genreChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#13131a',
    borderWidth: 1,
    borderColor: '#1e1e2e',
  },
  genreChipActive: {
    backgroundColor: 'rgba(124,58,237,0.2)',
    borderColor: '#7c3aed',
  },
  genreChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b',
  },
  genreChipTextActive: {
    color: '#a78bfa',
    fontWeight: '700',
  },
  resultsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  resultsText: {
    fontSize: 13,
    color: '#64748b',
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sortText: {
    fontSize: 13,
    color: '#64748b',
  },
  grid: {
    paddingHorizontal: 18,
    paddingBottom: 20,
  },
  cardWrapper: {
    flex: 1,
    maxWidth: '33.33%',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#3d4460',
  },
});
