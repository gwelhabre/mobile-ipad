import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import { Event, Venue } from '../../types';
import { venuesApi } from '../../api/events';
import { followVenue } from '../../api/follow';
import { useNavigation } from '@react-navigation/native';

export default function VenuesScreen() {
  const navigation = useNavigation<any>();
  const [search, setSearch] = useState('');
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [followLoading, setFollowLoading] = useState(false);

  const fetchVenues = useCallback(async () => {
    try {
      const response = await venuesApi.getVenues(1, 100);
      setVenues(response.data.data.data);
      setSelectedVenue((current) => current ?? response.data.data.data[0] ?? null);
      setError('');
    } catch (err: any) {
      setVenues([]);
      setSelectedVenue(null);
      setError(err?.response?.status === 404
        ? 'The venues API is not available on this backend. Check EXPO_PUBLIC_API_URL or redeploy the web app.'
        : 'Could not reach the venues API. Make sure the backend is running.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  const filtered = venues.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.city.toLowerCase().includes(search.toLowerCase()),
  );

  const selectVenue = async (venue: Venue) => {
    setSelectedVenue(venue);
    try {
      const response = await venuesApi.getVenueById(venue.id);
      setSelectedVenue(response.data.data);
    } catch {
      setSelectedVenue(venue);
    }
  };

  const handleFollowVenue = async () => {
    if (!selectedVenue) return;
    setFollowLoading(true);
    try {
      const response = await followVenue(selectedVenue.id);
      const updated = {
        ...selectedVenue,
        isFollowing: response.data.following,
        followersCount: response.data.count ?? selectedVenue.followersCount,
      };
      setSelectedVenue(updated);
      setVenues((items) => items.map((venue) => (venue.id === updated.id ? { ...venue, ...updated } : venue)));
      setError('');
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Could not update venue follow status.';
      setError(message);
      Alert.alert('Error', message);
    } finally {
      setFollowLoading(false);
    }
  };

  const renderVenueCard = ({ item }: { item: Venue }) => (
    <TouchableOpacity
      style={[styles.card, selectedVenue?.id === item.id && styles.cardSelected]}
      activeOpacity={0.8}
      onPress={() => selectVenue(item)}
    >
      {/* Cover placeholder */}
      <View style={styles.cardCover}>
        <Ionicons name="business" size={32} color="#7c3aed" />
        {item.isVerified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={18} color="#7c3aed" />
          </View>
        )}
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.venueName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={13} color="#64748b" />
          <Text style={styles.locationText}>{item.city}</Text>
        </View>

        <View style={styles.genreRow}>
          {item.genres.slice(0, 2).map((g) => (
            <Badge key={g} label={g} variant="purple" size="sm" />
          ))}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="people-outline" size={12} color="#64748b" />
            <Text style={styles.statText}>{item.capacity.toLocaleString()}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="calendar-outline" size={12} color="#64748b" />
            <Text style={styles.statText}>{item.eventsCount} events</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="star" size={12} color="#f59e0b" />
            <Text style={styles.statText}>{item.rating > 0 ? item.rating.toFixed(1) : 'N/A'}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <PageHeader title="Venues" subtitle={`${venues.length} venues worldwide`} />

      {/* Search */}
      <View style={styles.searchArea}>
        <View style={styles.searchWrapper}>
          <Ionicons name="search-outline" size={18} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search venues by name or city..."
            placeholderTextColor="#3d4460"
          />
        </View>
      </View>

      {/* Grid */}
      {loading ? (
        <LoadingSpinner message="Loading venues..." />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderVenueCard}
          numColumns={3}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchVenues(); }} tintColor="#7c3aed" />}
          ListHeaderComponent={
            <>
              <Text style={styles.countText}>{filtered.length} venues</Text>
              {selectedVenue && (
                <VenueDetail
                  venue={selectedVenue}
                  onEventPress={(event) => navigation.navigate('EventDetail', { eventId: event.id })}
                  onFollow={handleFollowVenue}
                  followLoading={followLoading}
                />
              )}
            </>
          }
          ListEmptyComponent={
            <EmptyState
              icon="business-outline"
              title={error ? 'Venues API unreachable' : 'No venues found'}
              subtitle={error || 'No venues match this view.'}
            />
          }
        />
      )}
    </View>
  );
}

function VenueDetail({
  venue,
  onEventPress,
  onFollow,
  followLoading,
}: {
  venue: Venue;
  onEventPress: (event: Event) => void;
  onFollow: () => void;
  followLoading: boolean;
}) {
  const upcomingEvents = (venue.upcomingEvents ?? venue.events ?? []) as Event[];

  return (
    <View style={styles.detailPanel}>
      <View style={styles.detailHeader}>
        <View>
          <Text style={styles.detailTitle}>{venue.name}</Text>
          <Text style={styles.detailMeta}>{[venue.address, venue.city, venue.country].filter(Boolean).join(', ') || 'Location unavailable'}</Text>
        </View>
        {venue.isVerified && <Badge label="Verified" variant="emerald" size="sm" />}
      </View>
      <View style={styles.detailActions}>
        <Button
          label={venue.isFollowing ? 'Following' : 'Follow Venue'}
          onPress={onFollow}
          loading={followLoading}
          variant={venue.isFollowing ? 'outline' : 'primary'}
          size="sm"
          icon={venue.isFollowing ? 'checkmark-circle' : 'heart-outline'}
        />
        {typeof venue.followersCount === 'number' ? (
          <Text style={styles.followersText}>{venue.followersCount.toLocaleString()} followers</Text>
        ) : null}
      </View>
      {venue.description ? <Text style={styles.detailDescription}>{venue.description}</Text> : null}
      <Text style={styles.detailSectionTitle}>Upcoming Events</Text>
      {upcomingEvents.length > 0 ? (
        upcomingEvents.map((event) => (
          <TouchableOpacity key={event.id} style={styles.eventRow} onPress={() => onEventPress(event)} activeOpacity={0.75}>
            <View>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventMeta}>
                {new Date(event.date).toLocaleDateString()} - {event.djName || 'DJ TBA'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#64748b" />
          </TouchableOpacity>
        ))
      ) : (
        <Text style={styles.emptyEvents}>No upcoming events listed yet.</Text>
      )}
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
  countText: {
    fontSize: 13,
    color: '#64748b',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  grid: {
    paddingHorizontal: 18,
    paddingBottom: 20,
  },
  card: {
    flex: 1,
    margin: 6,
    backgroundColor: '#13131a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e1e2e',
    overflow: 'hidden',
  },
  cardSelected: {
    borderColor: '#7c3aed',
  },
  cardCover: {
    height: 120,
    backgroundColor: 'rgba(124,58,237,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2e',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
  },
  cardBody: {
    padding: 14,
    gap: 6,
  },
  venueName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f1f5f9',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#64748b',
  },
  genreRow: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    marginTop: 4,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  detailPanel: {
    marginHorizontal: 6,
    marginBottom: 14,
    backgroundColor: '#13131a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e1e2e',
    padding: 18,
    gap: 12,
  },
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 },
  detailTitle: { color: '#f1f5f9', fontSize: 20, fontWeight: '800' },
  detailMeta: { color: '#94a3b8', fontSize: 13, marginTop: 4 },
  detailActions: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  followersText: { color: '#64748b', fontSize: 12 },
  detailDescription: { color: '#94a3b8', fontSize: 14, lineHeight: 20 },
  detailSectionTitle: { color: '#64748b', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  eventRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#1e1e2e', paddingTop: 10 },
  eventTitle: { color: '#f1f5f9', fontSize: 14, fontWeight: '700' },
  eventMeta: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
  emptyEvents: { color: '#64748b', fontSize: 13 },
});
