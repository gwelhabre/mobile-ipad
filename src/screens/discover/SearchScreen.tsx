import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import { Venue } from '../../types';
import { venuesApi } from '../../api/events';

type SearchTab = 'all' | 'djs' | 'events' | 'venues' | 'sets';

const MOCK_RESULTS = {
  djs: [
    { id: '1', name: 'DJ Pulse', username: 'djpulse', genre: 'Tech House', followers: 52400, isLive: true },
    { id: '2', name: 'Nova Sound', username: 'novasound', genre: 'Techno', followers: 31200, isLive: false },
    { id: '3', name: 'Electra', username: 'electra', genre: 'Trance', followers: 48900, isLive: false },
    { id: '4', name: 'Bass Theory', username: 'basstheory', genre: 'D&B', followers: 22100, isLive: true },
  ],
  events: [
    { id: '1', title: 'Friday Night Fever', venue: 'Fabric', date: '2026-06-13', price: 20, city: 'London' },
    { id: '2', title: 'Techno in the Dark', venue: 'Berghain', date: '2026-06-20', price: 0, city: 'Berlin' },
    { id: '3', title: 'Deep House Sessions', venue: 'Output', date: '2026-07-01', price: 15, city: 'Brooklyn' },
  ],
  sets: [
    { id: '1', title: 'Tech House Massive Vol.1', dj: 'DJ Pulse', price: 8.99, duration: 62 },
    { id: '2', title: 'Deep Vibes Session', dj: 'Nova Sound', price: 6.99, duration: 78 },
    { id: '3', title: 'Trance Journey', dj: 'Electra', price: 12.99, duration: 90 },
  ],
};

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('all');
  const [venues, setVenues] = useState<Venue[]>([]);

  const TABS: { key: SearchTab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'all', label: 'All', icon: 'search' },
    { key: 'djs', label: 'DJs', icon: 'musical-notes' },
    { key: 'events', label: 'Events', icon: 'calendar' },
    { key: 'venues', label: 'Venues', icon: 'business' },
    { key: 'sets', label: 'Sets', icon: 'disc' },
  ];

  const renderDJResult = (dj: typeof MOCK_RESULTS.djs[0]) => (
    <TouchableOpacity key={dj.id} style={styles.resultRow} activeOpacity={0.7}>
      <Avatar name={dj.name} size={44} showOnline={dj.isLive} />
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle}>{dj.name}</Text>
        <Text style={styles.resultSub}>@{dj.username} • {(dj.followers / 1000).toFixed(1)}k followers</Text>
      </View>
      <Badge label={dj.genre} variant="purple" size="sm" />
      {dj.isLive && <Badge label="LIVE" variant="red" size="sm" />}
    </TouchableOpacity>
  );

  const renderEventResult = (ev: typeof MOCK_RESULTS.events[0]) => (
    <TouchableOpacity key={ev.id} style={styles.resultRow} activeOpacity={0.7}>
      <View style={styles.resultIcon}>
        <Ionicons name="calendar" size={20} color="#7c3aed" />
      </View>
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle}>{ev.title}</Text>
        <Text style={styles.resultSub}>{ev.venue} • {ev.city}</Text>
      </View>
      <Text style={styles.resultPrice}>{ev.price === 0 ? 'Free' : `$${ev.price}`}</Text>
    </TouchableOpacity>
  );

  const handleSearch = async (text: string) => {
    setQuery(text);

    if (text.trim().length < 2) {
      setVenues([]);
      return;
    }

    try {
      const response = await venuesApi.getVenues(1, 20);
      const q = text.toLowerCase();
      setVenues(
        response.data.data.data.filter((venue) =>
          venue.name.toLowerCase().includes(q) ||
          venue.city.toLowerCase().includes(q) ||
          venue.country.toLowerCase().includes(q)
        )
      );
    } catch {
      setVenues([]);
    }
  };

  const renderVenueResult = (venue: Venue) => (
    <TouchableOpacity key={venue.id} style={styles.resultRow} activeOpacity={0.7}>
      <View style={styles.resultIcon}>
        <Ionicons name="business" size={20} color="#10b981" />
      </View>
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle}>{venue.name}</Text>
        <Text style={styles.resultSub}>{venue.city} • Cap: {venue.capacity.toLocaleString()}</Text>
      </View>
      <View style={styles.ratingRow}>
        <Ionicons name="star" size={13} color="#f59e0b" />
        <Text style={styles.ratingText}>{venue.rating}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderSetResult = (set: typeof MOCK_RESULTS.sets[0]) => (
    <TouchableOpacity key={set.id} style={styles.resultRow} activeOpacity={0.7}>
      <View style={styles.resultIcon}>
        <Ionicons name="disc" size={20} color="#3b82f6" />
      </View>
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle}>{set.title}</Text>
        <Text style={styles.resultSub}>By {set.dj} • {set.duration} min</Text>
      </View>
      <Text style={styles.resultPrice}>${set.price}</Text>
    </TouchableOpacity>
  );

  const renderSectionHeader = (label: string, icon: keyof typeof Ionicons.glyphMap) => (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={16} color="#64748b" />
      <Text style={styles.sectionHeaderText}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchWrapper}>
          <Ionicons name="search" size={20} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={handleSearch}
            placeholder="Search DJs, events, venues, sets..."
            placeholderTextColor="#3d4460"
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color="#64748b" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons name={tab.icon} size={14} color={activeTab === tab.key ? '#a78bfa' : '#64748b'} />
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results */}
      <View style={styles.resultsLayout}>
        <ScrollView showsVerticalScrollIndicator={false} style={styles.resultsScroll}>
          {(activeTab === 'all' || activeTab === 'djs') && (
            <View style={styles.resultsSection}>
              {renderSectionHeader('DJs', 'musical-notes')}
              {MOCK_RESULTS.djs.map(renderDJResult)}
            </View>
          )}
          {(activeTab === 'all' || activeTab === 'events') && (
            <View style={styles.resultsSection}>
              {renderSectionHeader('Events', 'calendar')}
              {MOCK_RESULTS.events.map(renderEventResult)}
            </View>
          )}
          {(activeTab === 'all' || activeTab === 'venues') && (
            <View style={styles.resultsSection}>
              {renderSectionHeader('Venues', 'business')}
              {venues.map(renderVenueResult)}
            </View>
          )}
          {(activeTab === 'all' || activeTab === 'sets') && (
            <View style={styles.resultsSection}>
              {renderSectionHeader('Sets', 'disc')}
              {MOCK_RESULTS.sets.map(renderSetResult)}
            </View>
          )}
        </ScrollView>

        {/* Quick filters panel */}
        <View style={styles.filtersPanel}>
          <Text style={styles.filtersPanelTitle}>Quick Filters</Text>
          {['Currently Live', 'Free Events', 'This Weekend', 'Top 100 DJs', 'New Releases', 'Near Me'].map((filter) => (
            <TouchableOpacity key={filter} style={styles.filterChip}>
              <Text style={styles.filterChipText}>{filter}</Text>
              <Ionicons name="chevron-forward" size={12} color="#64748b" />
            </TouchableOpacity>
          ))}
          <Text style={[styles.filtersPanelTitle, { marginTop: 20 }]}>Popular Genres</Text>
          <View style={styles.genreGrid}>
            {['Techno', 'House', 'D&B', 'Trance', 'Afro', 'Melodic'].map((genre) => (
              <TouchableOpacity key={genre} style={styles.genreChip}>
                <Text style={styles.genreChipText}>{genre}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  searchHeader: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2e',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#13131a',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e1e2e',
    paddingHorizontal: 18,
    height: 52,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#f1f5f9',
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2e',
    maxHeight: 52,
  },
  tabsContent: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    gap: 8,
    alignItems: 'center',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#13131a',
    borderWidth: 1,
    borderColor: '#1e1e2e',
  },
  tabActive: {
    backgroundColor: 'rgba(124,58,237,0.15)',
    borderColor: '#7c3aed',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#a78bfa',
    fontWeight: '700',
  },
  resultsLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  resultsScroll: {
    flex: 1,
  },
  resultsSection: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2e',
    backgroundColor: '#0d0d16',
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2a',
    gap: 14,
  },
  resultIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(124,58,237,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultInfo: { flex: 1 },
  resultTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: 2,
  },
  resultSub: {
    fontSize: 12,
    color: '#64748b',
  },
  resultPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#a78bfa',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f1f5f9',
  },
  filtersPanel: {
    width: 220,
    borderLeftWidth: 1,
    borderLeftColor: '#1e1e2e',
    padding: 16,
  },
  filtersPanelTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: '#13131a',
    borderWidth: 1,
    borderColor: '#1e1e2e',
  },
  filterChipText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  genreChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: 'rgba(124,58,237,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.2)',
  },
  genreChipText: {
    fontSize: 12,
    color: '#a78bfa',
    fontWeight: '600',
  },
});
