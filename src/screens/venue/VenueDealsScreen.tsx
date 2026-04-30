import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Alert, Modal, TextInput, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { venueDealApi } from '../../api/events';
import { createVenueDeal, getMyVenues } from '../../api/rankings';
import { getDJs, getDjDisplayName } from '../../api/dj';
import { DJProfile } from '../../types';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
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
  const [modalVisible, setModalVisible] = useState(false);
  const [venues, setVenues] = useState<Array<{ id: string; name: string; city?: string | null }>>([]);
  const [selectedVenueId, setSelectedVenueId] = useState('');
  const [djSearch, setDjSearch] = useState('');
  const [djs, setDjs] = useState<DJProfile[]>([]);
  const [selectedDj, setSelectedDj] = useState<DJProfile | null>(null);
  const [proposedFee, setProposedFee] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const loadVenues = async () => {
    try {
      const data = await getMyVenues();
      setVenues(data);
      if (data.length === 1) setSelectedVenueId(String(data[0].id));
    } catch {
      setVenues([]);
    }
  };

  const searchDjs = async (q: string) => {
    setDjSearch(q);
    if (q.trim().length < 2) { setDjs([]); return; }
    try {
      const data = await getDJs(q.trim());
      setDjs(data.slice(0, 10));
    } catch {
      setDjs([]);
    }
  };

  const submitDeal = async () => {
    if (saving) return; // re-entrancy guard
    if (!selectedDj) {
      Alert.alert('Pick a DJ', 'Search and select a DJ to propose to.');
      return;
    }
    if (!selectedVenueId) {
      Alert.alert('Pick a venue', 'Select one of your venues.');
      return;
    }
    setSaving(true);
    try {
      await createVenueDeal({
        djId: String(selectedDj.id),
        venueId: selectedVenueId,
        proposedFee: proposedFee.trim() ? Number(proposedFee) : undefined,
        eventDate: eventDate.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setSelectedDj(null); setDjSearch(''); setDjs([]); setProposedFee(''); setEventDate(''); setNotes('');
      setModalVisible(false);
      Alert.alert('Proposal sent', `${getDjDisplayName(selectedDj)} has been notified.`);
    } catch (err: any) {
      Alert.alert('Could not propose deal', err?.response?.data?.error ?? 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => { loadVenues(); }, []);

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
      <PageHeader
        title="Booking Deals"
        subtitle={`${deals.length} total`}
        actions={[
          { element: (
            <Button label="Propose Deal" onPress={() => setModalVisible(true)} variant="primary" size="sm" icon="add-circle" />
          ) },
        ]}
      />

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

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Propose Deal</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalBody}>
              {venues.length > 1 && (
                <>
                  <Text style={styles.modalLabel}>Venue</Text>
                  <View style={styles.modalChipRow}>
                    {venues.map((v) => (
                      <TouchableOpacity
                        key={v.id}
                        style={[styles.modalChip, String(v.id) === selectedVenueId && styles.modalChipActive]}
                        onPress={() => setSelectedVenueId(String(v.id))}
                      >
                        <Text style={[styles.modalChipText, String(v.id) === selectedVenueId && styles.modalChipTextActive]}>{v.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              <Text style={styles.modalLabel}>DJ</Text>
              {selectedDj ? (
                <View style={styles.selectedDj}>
                  <Avatar uri={selectedDj.avatarUrl} name={getDjDisplayName(selectedDj)} size={36} />
                  <Text style={styles.selectedDjName}>{getDjDisplayName(selectedDj)}</Text>
                  <TouchableOpacity onPress={() => setSelectedDj(null)}>
                    <Ionicons name="close-circle" size={20} color="#6b7280" />
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <TextInput
                    style={styles.modalInput}
                    value={djSearch}
                    onChangeText={searchDjs}
                    placeholder="Search DJs..."
                    placeholderTextColor="#4b5563"
                  />
                  {djs.map((dj) => (
                    <TouchableOpacity key={String(dj.id)} style={styles.djRow} onPress={() => { setSelectedDj(dj); setDjs([]); setDjSearch(''); }}>
                      <Avatar uri={dj.avatarUrl} name={getDjDisplayName(dj)} size={32} />
                      <Text style={styles.djRowName}>{getDjDisplayName(dj)}</Text>
                    </TouchableOpacity>
                  ))}
                </>
              )}

              <Text style={styles.modalLabel}>Proposed Fee</Text>
              <TextInput style={styles.modalInput} value={proposedFee} onChangeText={setProposedFee} placeholder="e.g. 800" placeholderTextColor="#4b5563" keyboardType="decimal-pad" />

              <Text style={styles.modalLabel}>Event Date</Text>
              <TextInput style={styles.modalInput} value={eventDate} onChangeText={setEventDate} placeholder="YYYY-MM-DD" placeholderTextColor="#4b5563" />

              <Text style={styles.modalLabel}>Notes</Text>
              <TextInput style={[styles.modalInput, { minHeight: 80 }]} value={notes} onChangeText={setNotes} placeholder="Set length, equipment..." placeholderTextColor="#4b5563" multiline textAlignVertical="top" />

              <Button label={saving ? 'Sending...' : 'Send Proposal'} onPress={submitDeal} loading={saving} />
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'center', padding: 32 },
  modalCard: { maxHeight: '88%', backgroundColor: '#12121a', borderRadius: 18, borderWidth: 1, borderColor: '#263241', padding: 22, maxWidth: 540, alignSelf: 'center', width: '100%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modalTitle: { color: '#f1f5f9', fontSize: 20, fontWeight: '900' },
  closeBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#1f1f2e', alignItems: 'center', justifyContent: 'center' },
  modalBody: { gap: 12 },
  modalLabel: { color: '#94a3b8', fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 },
  modalInput: { backgroundColor: '#0a0a0f', borderWidth: 1, borderColor: '#1e1e2e', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: '#f1f5f9', fontSize: 14 },
  modalChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  modalChip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: '#1e1e2e', backgroundColor: '#13131a' },
  modalChipActive: { borderColor: '#7c3aed', backgroundColor: 'rgba(124,58,237,0.12)' },
  modalChipText: { color: '#94a3b8', fontSize: 12, fontWeight: '700' },
  modalChipTextActive: { color: '#a78bfa' },
  selectedDj: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, backgroundColor: 'rgba(124,58,237,0.08)', borderWidth: 1, borderColor: '#7c3aed55', borderRadius: 12 },
  selectedDjName: { flex: 1, color: '#f1f5f9', fontSize: 14, fontWeight: '700' },
  djRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 8, borderRadius: 10, backgroundColor: '#13131a' },
  djRowName: { color: '#e5e7eb', fontSize: 13, fontWeight: '600' },
});
