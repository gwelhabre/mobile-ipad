import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { DiscoverStackParamList, Event, TableReservation } from '../../types';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { eventsApi } from '../../api/events';
import { createTableReservation, getTableReservations, splitAndPayTableReservation } from '../../api/tableReservations';
import { postEventComment } from '../../api/comments';

type Route = RouteProp<DiscoverStackParamList, 'EventDetail'>;

export default function EventDetailScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [reservation, setReservation] = useState<TableReservation | null>(null);
  const [partySize, setPartySize] = useState('2');
  const [tableFee, setTableFee] = useState('0');
  const [reservationLoading, setReservationLoading] = useState(false);
  const [splitLoading, setSplitLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      eventsApi.getEventById(route.params.eventId),
      getTableReservations(route.params.eventId).catch(() => []),
    ])
      .then(([response, reservations]) => {
        setEvent(response.data.data);
        setReservation(reservations[0] ?? null);
      })
      .catch(() => setEvent(null))
      .finally(() => setLoading(false));
  }, [route.params.eventId]);

  const createReservation = async () => {
    if (!event) return;
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
      setReservation(await createTableReservation({ eventId: event.id, partySize: parsedPartySize, tableFee: parsedTableFee }));
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error || 'Could not start the table reservation.');
    } finally {
      setReservationLoading(false);
    }
  };

  const postComment = async () => {
    if (!event || !commentText.trim()) return;
    setCommentLoading(true);
    try {
      const comment = await postEventComment(event.id, commentText.trim());
      setCommentText('');
      Alert.alert('Posted to feed', `${comment.displayName} said something at ${event.title}.`);
    } catch {
      Alert.alert('Error', 'Could not post to the feed.');
    } finally {
      setCommentLoading(false);
    }
  };

  const shareLink = async (kind: 'free' | 'split') => {
    if (!reservation || !event) return;
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

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#7c3aed" size="large" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>Event not found</Text>
        <Text style={styles.emptyText}>This event is unavailable or was removed.</Text>
      </View>
    );
  }

  const ticketsLeft = Math.max(event.capacity - event.ticketsSold, 0);
  const soldPct = event.capacity > 0 ? Math.round((event.ticketsSold / event.capacity) * 100) : 0;
  const statusVariant = event.status === 'live' ? 'red' : event.status === 'upcoming' ? 'emerald' : 'gray';
  const eventDate = new Date(event.date);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={20} color="#f1f5f9" />
        <Text style={styles.backText}>Events</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Ionicons name="musical-notes" size={72} color="#7c3aed" />
        </View>

        <View style={styles.contentLayout}>
          <View style={styles.leftCol}>
            <Badge label={event.status.toUpperCase()} variant={statusVariant} size="md" style={styles.statusBadge} />
            <Text style={styles.title}>{event.title}</Text>

            <View style={styles.infoBlock}>
              <InfoRow icon="business-outline" label="Venue" value={event.venueName} />
              <InfoRow icon="location-outline" label="Address" value={event.address || event.city} />
              <InfoRow
                icon="calendar-outline"
                label="Date"
                value={Number.isNaN(eventDate.getTime())
                  ? event.date
                  : eventDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              />
              <InfoRow icon="time-outline" label="Hours" value={[event.startTime, event.endTime].filter(Boolean).join(' until ')} />
              <InfoRow icon="person-outline" label="Headliner" value={event.djName || 'TBA'} />
            </View>

            {user?.role === 'venue_manager' && (event.status === 'upcoming' || event.status === 'live') && (
              <TouchableOpacity
                style={styles.goLiveBtn}
                onPress={() => navigation.navigate('VenueBroadcast', { eventId: String(event.id) })}
                activeOpacity={0.85}
              >
                <View style={styles.goLiveDot} />
                <Text style={styles.goLiveBtnText}>Go Live</Text>
              </TouchableOpacity>
            )}

            {event.description ? (
              <>
                <Text style={styles.sectionTitle}>About this event</Text>
                <Text style={styles.description}>{event.description}</Text>
              </>
            ) : null}

            {event.genres.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>Genres</Text>
                <View style={styles.genreRow}>
                  {event.genres.map((genre) => (
                    <Badge key={genre} label={genre} variant="purple" size="md" />
                  ))}
                </View>
              </>
            ) : null}

            <Text style={styles.sectionTitle}>Say Something</Text>
            <View style={styles.sayCard}>
              <TextInput
                value={commentText}
                onChangeText={setCommentText}
                style={styles.sayInput}
                placeholder="Say something from this event..."
                placeholderTextColor="#475569"
                multiline
                maxLength={280}
              />
              <Button
                label="Post to Feed"
                onPress={postComment}
                loading={commentLoading}
                disabled={!commentText.trim()}
              />
            </View>
          </View>

          <View style={styles.rightCol}>
            <View style={styles.ticketCard}>
              <Text style={styles.ticketCardTitle}>Tickets</Text>
              <View style={styles.priceRow}>
                <Text style={styles.price}>{event.price === 0 ? 'Free' : `$${event.price}`}</Text>
                <Text style={styles.priceLabel}>per person</Text>
              </View>
              <View style={styles.availabilityRow}>
                <Text style={styles.availabilityText}>{ticketsLeft} tickets remaining</Text>
                <Text style={styles.availabilityPct}>{soldPct}% sold</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${Math.min(soldPct, 100)}%` }]} />
              </View>
              <TouchableOpacity style={[styles.buyBtn, ticketsLeft <= 0 && styles.buyBtnSoldOut]} disabled={ticketsLeft <= 0}>
                <Text style={styles.buyBtnText}>{ticketsLeft <= 0 ? 'Sold Out' : 'Buy Tickets'}</Text>
                <Ionicons name="ticket-outline" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
            {(event.status === 'upcoming' || event.status === 'live') && (
              <View style={styles.reservationCard}>
                <Text style={styles.ticketCardTitle}>Table Reservation</Text>
                {reservation ? (
                  <>
                    <Text style={styles.reservationName}>Table for {reservation.partySize}</Text>
                    <Text style={styles.reservationMeta}>
                      ${reservation.tableFee.toFixed(2)} total - {reservation.summary?.unpaidInviteCount ?? 0} unpaid
                    </Text>
                    <View style={styles.linkRow}>
                      <Button label="Free Invite" onPress={() => shareLink('free')} variant="outline" size="sm" style={styles.linkButton} />
                      <Button label="Split Invite" onPress={() => shareLink('split')} variant="outline" size="sm" style={styles.linkButton} />
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
                    <Text style={styles.reservationMeta}>Generate one free invite link and one split-payment invite link.</Text>
                    <View style={styles.inputRow}>
                      <TextInput value={partySize} onChangeText={setPartySize} keyboardType="number-pad" style={styles.input} placeholder="People" placeholderTextColor="#475569" />
                      <TextInput value={tableFee} onChangeText={setTableFee} keyboardType="decimal-pad" style={styles.input} placeholder="Fee" placeholderTextColor="#475569" />
                    </View>
                    <Button label="Book Table" onPress={createReservation} loading={reservationLoading} />
                  </>
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function InfoRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={16} color="#64748b" />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '-'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  centered: { flex: 1, backgroundColor: '#0a0a0f', alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyTitle: { color: '#f1f5f9', fontSize: 18, fontWeight: '700', marginBottom: 6 },
  emptyText: { color: '#64748b', fontSize: 14, textAlign: 'center' },
  goLiveBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#2d0a0a', borderWidth: 1, borderColor: '#ef4444',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 16,
  },
  goLiveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#ef4444' },
  goLiveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2e',
  },
  backText: { fontSize: 15, color: '#94a3b8', fontWeight: '600' },
  hero: {
    height: 220,
    backgroundColor: 'rgba(124,58,237,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2e',
  },
  contentLayout: { flexDirection: 'row', padding: 28, gap: 28 },
  leftCol: { flex: 3 },
  rightCol: { width: 320, gap: 16 },
  statusBadge: { marginBottom: 12 },
  title: { fontSize: 28, fontWeight: '800', color: '#f1f5f9', marginBottom: 20 },
  infoBlock: {
    backgroundColor: '#13131a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e1e2e',
    marginBottom: 24,
    gap: 12,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoLabel: { fontSize: 13, color: '#64748b', width: 70, fontWeight: '600' },
  infoValue: { fontSize: 13, color: '#f1f5f9', flex: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#f1f5f9', marginBottom: 10 },
  description: { fontSize: 14, color: '#94a3b8', lineHeight: 22, marginBottom: 20 },
  genreRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sayCard: { backgroundColor: '#13131a', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1e1e2e', gap: 12, marginBottom: 20 },
  sayInput: {
    minHeight: 92,
    color: '#f1f5f9',
    backgroundColor: '#0a0a0f',
    borderWidth: 1,
    borderColor: '#1e1e2e',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlignVertical: 'top',
  },
  ticketCard: { backgroundColor: '#13131a', borderRadius: 16, padding: 22, borderWidth: 1, borderColor: '#1e1e2e' },
  ticketCardTitle: { fontSize: 16, fontWeight: '700', color: '#f1f5f9', marginBottom: 14 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 14 },
  price: { fontSize: 32, fontWeight: '800', color: '#a78bfa' },
  priceLabel: { fontSize: 13, color: '#64748b' },
  availabilityRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  availabilityText: { fontSize: 13, color: '#94a3b8' },
  availabilityPct: { fontSize: 13, color: '#a78bfa', fontWeight: '600' },
  progressBar: { height: 6, backgroundColor: '#1e1e2e', borderRadius: 3, overflow: 'hidden', marginBottom: 18 },
  progressFill: { height: '100%', backgroundColor: '#7c3aed', borderRadius: 3 },
  buyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    height: 50,
  },
  buyBtnSoldOut: { backgroundColor: '#374151' },
  buyBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  reservationCard: { backgroundColor: '#13131a', borderRadius: 16, padding: 22, borderWidth: 1, borderColor: '#1e1e2e', gap: 12 },
  reservationName: { color: '#f1f5f9', fontSize: 17, fontWeight: '800' },
  reservationMeta: { color: '#94a3b8', fontSize: 13, lineHeight: 19 },
  linkRow: { flexDirection: 'row', gap: 10 },
  linkButton: { flex: 1 },
  inviteRow: { borderTopWidth: 1, borderTopColor: '#1e1e2e', paddingTop: 8 },
  inviteName: { color: '#f1f5f9', fontSize: 13, fontWeight: '700' },
  inviteStatus: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
  inputRow: { flexDirection: 'row', gap: 10 },
  input: { flex: 1, color: '#f1f5f9', backgroundColor: '#0a0a0f', borderWidth: 1, borderColor: '#1e1e2e', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
});
