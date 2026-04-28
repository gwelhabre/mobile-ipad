import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Event, TableReservation } from '../../types';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { eventsApi } from '../../api/events';
import { createTableReservation, getTableReservations, splitAndPayTableReservation } from '../../api/tableReservations';

export default function EventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      const response = await eventsApi.getEvents(1, 50);
      const nextEvents = response.data.data.data;
      setEvents(nextEvents);
      setSelectedEvent((current) => current ?? nextEvents[0] ?? null);
    } catch {
      setEvents([]);
      setSelectedEvent(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  return (
    <View style={styles.container}>
      <PageHeader title="Events" subtitle={`${events.length} upcoming events and shows`} />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#7c3aed" size="large" />
        </View>
      ) : (
        <View style={styles.splitLayout}>
          <View style={styles.leftPane}>
            <FlatList
              data={events}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.listItem, selectedEvent?.id === item.id && styles.listItemActive]}
                  onPress={() => setSelectedEvent(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.listItemDate}>
                    <Text style={styles.listDateMonth}>
                      {new Date(item.date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                    </Text>
                    <Text style={styles.listDateDay}>{new Date(item.date).getDate()}</Text>
                  </View>
                  <View style={styles.listItemInfo}>
                    <Text style={styles.listTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.listVenue} numberOfLines={1}>{item.venueName} - {item.city || 'TBA'}</Text>
                    <View style={styles.listMeta}>
                      <Text style={styles.listPrice}>{item.price === 0 ? 'Free' : `$${item.price}`}</Text>
                      {item.status === 'live' && <Badge label="LIVE" variant="red" size="sm" />}
                    </View>
                  </View>
                  {selectedEvent?.id === item.id && <Ionicons name="chevron-forward" size={16} color="#7c3aed" />}
                </TouchableOpacity>
              )}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" />}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Ionicons name="calendar-outline" size={42} color="#475569" />
                  <Text style={styles.emptyText}>No events found</Text>
                </View>
              }
            />
          </View>

          <View style={styles.rightPane}>
            {selectedEvent ? <EventDetail event={selectedEvent} /> : null}
          </View>
        </View>
      )}
    </View>
  );
}

function EventDetail({ event }: { event: Event }) {
  const soldPct = event.capacity > 0 ? Math.round((event.ticketsSold / event.capacity) * 100) : 0;
  const [reservation, setReservation] = useState<TableReservation | null>(null);
  const [partySize, setPartySize] = useState('2');
  const [tableFee, setTableFee] = useState('0');
  const [reservationLoading, setReservationLoading] = useState(false);
  const [splitLoading, setSplitLoading] = useState(false);

  useEffect(() => {
    getTableReservations(event.id)
      .then((reservations) => setReservation(reservations[0] ?? null))
      .catch(() => setReservation(null));
  }, [event.id]);

  const createReservation = async () => {
    const parsedPartySize = Number(partySize);
    const parsedTableFee = Number(tableFee);
    if (!Number.isInteger(parsedPartySize) || parsedPartySize < 2) {
      Alert.alert('Minimum table size', 'A table reservation needs at least 2 people.');
      return;
    }
    if (!Number.isFinite(parsedTableFee) || parsedTableFee < 0) {
      Alert.alert('Invalid table fee', 'Enter a valid table fee.');
      return;
    }
    setReservationLoading(true);
    try {
      const nextReservation = await createTableReservation({ eventId: event.id, partySize: parsedPartySize, tableFee: parsedTableFee });
      setReservation(nextReservation);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error || 'Could not start the table reservation.');
    } finally {
      setReservationLoading(false);
    }
  };

  const shareLink = async (kind: 'free' | 'split') => {
    if (!reservation) return;
    const link = kind === 'free' ? reservation.freeInviteLink : reservation.splitInviteLink;
    await Share.share({ message: `${event.title} table invite: ${link}`, url: link });
  };

  const splitAndPay = async () => {
    if (!reservation) return;
    setSplitLoading(true);
    try {
      setReservation(await splitAndPayTableReservation(reservation.id));
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error || 'Could not split and pay this reservation.');
    } finally {
      setSplitLoading(false);
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailContent}>
      <View style={styles.heroArea}>
        <Ionicons name="musical-notes" size={60} color="#7c3aed" />
      </View>

      <View style={styles.detailBody}>
        <View style={styles.statusRow}>
          <Badge
            label={event.status.toUpperCase()}
            variant={event.status === 'live' ? 'red' : event.status === 'upcoming' ? 'emerald' : 'gray'}
            size="md"
          />
          {event.isFeatured && <Badge label="Featured" variant="amber" size="md" />}
        </View>

        <Text style={styles.detailTitle}>{event.title}</Text>

        <View style={styles.detailInfoGrid}>
          <InfoItem icon="business-outline" label="Venue" value={event.venueName} />
          <InfoItem icon="person-outline" label="Headliner" value={event.djName || 'TBA'} />
          <InfoItem
            icon="calendar-outline"
            label="Date"
            value={new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          />
          <InfoItem icon="time-outline" label="Time" value={[event.startTime, event.endTime].filter(Boolean).join(' - ')} />
          <InfoItem icon="location-outline" label="Location" value={event.city || event.address || 'TBA'} />
          <InfoItem icon="people-outline" label="Tickets Sold" value={`${event.ticketsSold} / ${event.capacity}`} />
        </View>

        {event.description ? <Text style={styles.descriptionText}>{event.description}</Text> : null}

        {event.genres.length > 0 ? (
          <View style={styles.genreRow}>
            {event.genres.map((genre) => <Badge key={genre} label={genre} variant="purple" size="md" />)}
          </View>
        ) : null}

        <View style={styles.ticketProgress}>
          <View style={styles.ticketProgressHeader}>
            <Text style={styles.ticketProgressLabel}>Ticket availability</Text>
            <Text style={styles.ticketProgressPct}>{soldPct}% sold</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${Math.min(soldPct, 100)}%` }]} />
          </View>
        </View>

        <View style={styles.ctaRow}>
          <View>
            <Text style={styles.priceLabel}>Ticket Price</Text>
            <Text style={styles.priceValue}>{event.price === 0 ? 'Free Entry' : `$${event.price}`}</Text>
          </View>
          <TouchableOpacity
            style={[styles.buyButton, event.ticketsSold >= event.capacity && styles.buyButtonSoldOut]}
            disabled={event.ticketsSold >= event.capacity}
          >
            <Text style={styles.buyButtonText}>{event.ticketsSold >= event.capacity ? 'Sold Out' : 'Get Tickets'}</Text>
            <Ionicons name="ticket-outline" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        {(event.status === 'upcoming' || event.status === 'live') && (
          <View style={styles.reservationBox}>
            <Text style={styles.reservationTitle}>Table Reservation</Text>
            {reservation ? (
              <>
                <View style={styles.reservationHeader}>
                  <Text style={styles.reservationName}>Table for {reservation.partySize}</Text>
                  <Badge label={reservation.status.replace(/_/g, ' ')} variant={reservation.status === 'paid' ? 'emerald' : 'purple'} size="sm" />
                </View>
                <Text style={styles.reservationMeta}>
                  ${reservation.tableFee.toFixed(2)} total - confirm by {new Date(reservation.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <View style={styles.linkRow}>
                  <Button label="Free Invite" onPress={() => shareLink('free')} variant="outline" size="sm" style={styles.linkButton} />
                  <Button label="Split Invite" onPress={() => shareLink('split')} variant="outline" size="sm" style={styles.linkButton} />
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryText}>{reservation.summary?.confirmedCount ?? 1} confirmed</Text>
                  <Text style={styles.summaryText}>{reservation.summary?.unpaidInviteCount ?? 0} unpaid</Text>
                  <Text style={styles.summaryText}>{reservation.summary?.declinedCount ?? 0} declined</Text>
                </View>
                {reservation.invites.map((invite) => (
                  <View key={invite.id} style={styles.inviteRow}>
                    <Text style={styles.inviteName}>{invite.displayName || invite.email || 'Invitee'}</Text>
                    <Text style={styles.inviteStatus}>
                      {invite.attendanceStatus}{invite.paymentExpected || invite.proposedToPay ? ` - ${invite.paymentStatus}` : ' - no split'}
                    </Text>
                  </View>
                ))}
                <Button label="Split and Pay" onPress={splitAndPay} loading={splitLoading} disabled={reservation.status === 'paid'} />
              </>
            ) : (
              <>
                <Text style={styles.reservationMeta}>Create a table, then share free and split-payment invite links. Invites expire after 6 hours.</Text>
                <View style={styles.inputRow}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>People</Text>
                    <TextInput value={partySize} onChangeText={setPartySize} keyboardType="number-pad" style={styles.input} placeholder="2" placeholderTextColor="#475569" />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Table fee</Text>
                    <TextInput value={tableFee} onChangeText={setTableFee} keyboardType="decimal-pad" style={styles.input} placeholder="0" placeholderTextColor="#475569" />
                  </View>
                </View>
                <Button label="Book Table" onPress={createReservation} loading={reservationLoading} />
              </>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function InfoItem({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.infoItem}>
      <Ionicons name={icon} size={16} color="#64748b" />
      <View>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || '-'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  splitLayout: { flex: 1, flexDirection: 'row' },
  leftPane: { width: '38%', borderRightWidth: 1, borderRightColor: '#1e1e2e' },
  rightPane: { flex: 1 },
  listContent: { paddingVertical: 8 },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2a',
    gap: 12,
  },
  listItemActive: { backgroundColor: 'rgba(124,58,237,0.08)' },
  listItemDate: {
    width: 42,
    alignItems: 'center',
    backgroundColor: 'rgba(124,58,237,0.12)',
    borderRadius: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.2)',
  },
  listDateMonth: { fontSize: 9, fontWeight: '700', color: '#a78bfa', letterSpacing: 0.5 },
  listDateDay: { fontSize: 17, fontWeight: '800', color: '#f1f5f9' },
  listItemInfo: { flex: 1 },
  listTitle: { fontSize: 14, fontWeight: '700', color: '#f1f5f9', marginBottom: 2 },
  listVenue: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  listMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  listPrice: { fontSize: 13, fontWeight: '700', color: '#a78bfa' },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 10 },
  emptyText: { color: '#64748b', fontSize: 14 },
  heroArea: {
    height: 200,
    backgroundColor: 'rgba(124,58,237,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2e',
  },
  detailContent: { paddingBottom: 40 },
  detailBody: { padding: 28 },
  statusRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  detailTitle: { fontSize: 26, fontWeight: '800', color: '#f1f5f9', marginBottom: 20 },
  detailInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
    backgroundColor: '#13131a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e1e2e',
  },
  infoItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, width: '45%' },
  infoLabel: { fontSize: 11, color: '#64748b', fontWeight: '600', marginBottom: 2 },
  infoValue: { fontSize: 13, color: '#f1f5f9', fontWeight: '600' },
  descriptionText: { fontSize: 14, color: '#94a3b8', lineHeight: 22, marginBottom: 16 },
  genreRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  ticketProgress: { marginBottom: 24 },
  ticketProgressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  ticketProgressLabel: { fontSize: 13, color: '#64748b' },
  ticketProgressPct: { fontSize: 13, color: '#a78bfa', fontWeight: '600' },
  progressBar: { height: 6, backgroundColor: '#1e1e2e', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#7c3aed', borderRadius: 3 },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#13131a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e1e2e',
  },
  priceLabel: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  priceValue: { fontSize: 22, fontWeight: '800', color: '#a78bfa' },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#7c3aed',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buyButtonSoldOut: { backgroundColor: '#374151' },
  buyButtonText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  reservationBox: {
    marginTop: 20,
    backgroundColor: '#13131a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e1e2e',
    gap: 12,
  },
  reservationTitle: { fontSize: 13, color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  reservationHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  reservationName: { color: '#f1f5f9', fontSize: 17, fontWeight: '800', flex: 1 },
  reservationMeta: { color: '#94a3b8', fontSize: 13, lineHeight: 19 },
  linkRow: { flexDirection: 'row', gap: 10 },
  linkButton: { flex: 1 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#0a0a0f', borderRadius: 10, padding: 10 },
  summaryText: { color: '#cbd5e1', fontSize: 12, fontWeight: '700' },
  inviteRow: { borderTopWidth: 1, borderTopColor: '#1e1e2e', paddingTop: 8 },
  inviteName: { color: '#f1f5f9', fontSize: 13, fontWeight: '700' },
  inviteStatus: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
  inputRow: { flexDirection: 'row', gap: 12 },
  inputGroup: { flex: 1, gap: 6 },
  inputLabel: { color: '#94a3b8', fontSize: 12, fontWeight: '700' },
  input: { color: '#f1f5f9', backgroundColor: '#0a0a0f', borderWidth: 1, borderColor: '#1e1e2e', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
});
