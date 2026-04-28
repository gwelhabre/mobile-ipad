import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/common/Badge';

const MOCK_DEALS = Array.from({ length: 12 }, (_, i) => ({
  id: `deal-${i}`,
  venue: ['Fabric London', 'Berghain', 'Egg London', 'Club Nexus', 'Printworks', 'Oval Space', 'Village Underground', 'XOYO', 'EartH', 'The Warehouse Project', 'Tobacco Dock', 'Junction 2'][i],
  city: ['London', 'Berlin', 'London', 'London', 'London', 'London', 'London', 'London', 'London', 'Manchester', 'London', 'London'][i],
  amount: [800, 1200, 600, 450, 950, 550, 700, 480, 620, 1500, 880, 720][i],
  date: new Date(Date.now() + (i - 4) * 7 * 24 * 3600000).toISOString(),
  status: (['accepted', 'pending', 'pending', 'accepted', 'completed', 'rejected', 'accepted', 'pending', 'accepted', 'completed', 'pending', 'completed'] as const)[i],
  description: 'Main floor DJ set, 3 hours, equipment provided',
}));

export default function DJDealsScreen() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'completed'>('all');

  const filtered = MOCK_DEALS.filter((d) => filter === 'all' || d.status === filter);

  const totalPending = MOCK_DEALS.filter((d) => d.status === 'pending').reduce((s, d) => s + d.amount, 0);
  const totalEarned = MOCK_DEALS.filter((d) => d.status === 'completed').reduce((s, d) => s + d.amount, 0);

  const statusVariant = (s: string) => ({
    accepted: 'emerald' as const,
    pending: 'amber' as const,
    rejected: 'red' as const,
    completed: 'blue' as const,
  }[s] || 'gray' as const);

  return (
    <View style={styles.container}>
      <PageHeader
        title="My Deals"
        subtitle="Venue bookings and performance agreements"
      />

      {/* Summary */}
      <View style={styles.summaryBar}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{MOCK_DEALS.length}</Text>
          <Text style={styles.summaryLabel}>Total Deals</Text>
        </View>
        <View style={styles.summaryDiv} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: '#f59e0b' }]}>${totalPending.toLocaleString()}</Text>
          <Text style={styles.summaryLabel}>Pending Value</Text>
        </View>
        <View style={styles.summaryDiv} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: '#10b981' }]}>${totalEarned.toLocaleString()}</Text>
          <Text style={styles.summaryLabel}>Earned (Completed)</Text>
        </View>
        <View style={styles.summaryDiv} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{MOCK_DEALS.filter((d) => d.status === 'accepted').length}</Text>
          <Text style={styles.summaryLabel}>Upcoming</Text>
        </View>
      </View>

      {/* Filter */}
      <View style={styles.filterRow}>
        {(['all', 'pending', 'accepted', 'completed'] as const).map((f) => (
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

      {/* Table */}
      <View style={styles.tableHeader}>
        <View style={styles.colVenue}><Text style={styles.th}>VENUE</Text></View>
        <View style={styles.colCity}><Text style={styles.th}>CITY</Text></View>
        <View style={styles.colDate}><Text style={styles.th}>DATE</Text></View>
        <View style={styles.colDesc}><Text style={styles.th}>DETAILS</Text></View>
        <View style={styles.colAmount}><Text style={[styles.th, styles.thRight]}>AMOUNT</Text></View>
        <View style={styles.colStatus}><Text style={styles.th}>STATUS</Text></View>
        <View style={styles.colActions}><Text style={styles.th}>ACTIONS</Text></View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.tableRow}>
            <View style={styles.colVenue}>
              <View style={styles.venueIcon}>
                <Ionicons name="business" size={14} color="#a78bfa" />
              </View>
              <Text style={styles.venueName} numberOfLines={1}>{item.venue}</Text>
            </View>
            <View style={styles.colCity}>
              <Text style={styles.cellText}>{item.city}</Text>
            </View>
            <View style={styles.colDate}>
              <Text style={styles.cellText}>
                {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
              </Text>
            </View>
            <View style={styles.colDesc}>
              <Text style={styles.descText} numberOfLines={1}>{item.description}</Text>
            </View>
            <View style={styles.colAmount}>
              <Text style={styles.amountText}>${item.amount.toLocaleString()}</Text>
            </View>
            <View style={styles.colStatus}>
              <Badge label={item.status} variant={statusVariant(item.status)} size="sm" />
            </View>
            <View style={[styles.colActions, styles.actionsRow]}>
              {item.status === 'pending' && (
                <>
                  <TouchableOpacity style={styles.acceptBtn}>
                    <Ionicons name="checkmark" size={14} color="#10b981" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.rejectBtn}>
                    <Ionicons name="close" size={14} color="#ef4444" />
                  </TouchableOpacity>
                </>
              )}
              <TouchableOpacity style={styles.viewBtn}>
                <Ionicons name="eye-outline" size={14} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={<View style={{ height: 24 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  summaryBar: {
    flexDirection: 'row',
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2e',
    alignItems: 'center',
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 20, fontWeight: '800', color: '#f1f5f9', marginBottom: 2 },
  summaryLabel: { fontSize: 11, color: '#64748b' },
  summaryDiv: { width: 1, height: 36, backgroundColor: '#1e1e2e' },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2e',
    gap: 6,
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#13131a',
    borderWidth: 1,
    borderColor: '#1e1e2e',
  },
  filterBtnActive: { backgroundColor: 'rgba(124,58,237,0.15)', borderColor: '#7c3aed' },
  filterText: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  filterTextActive: { color: '#a78bfa' },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2e',
    backgroundColor: '#0d0d16',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2a',
  },
  colVenue: { flex: 2, flexDirection: 'row', alignItems: 'center', gap: 10 },
  colCity: { width: 90 },
  colDate: { width: 100 },
  colDesc: { flex: 2 },
  colAmount: { width: 90, alignItems: 'flex-end' },
  colStatus: { width: 100, paddingLeft: 12 },
  colActions: { width: 100, paddingLeft: 12 },
  th: { fontSize: 10, fontWeight: '700', color: '#475569', letterSpacing: 0.8 },
  thRight: { textAlign: 'right' },
  venueIcon: {
    width: 30,
    height: 30,
    borderRadius: 7,
    backgroundColor: 'rgba(124,58,237,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  venueName: { fontSize: 13, fontWeight: '700', color: '#f1f5f9', flex: 1 },
  cellText: { fontSize: 13, color: '#94a3b8' },
  descText: { fontSize: 12, color: '#64748b' },
  amountText: { fontSize: 14, fontWeight: '800', color: '#a78bfa' },
  actionsRow: { flexDirection: 'row', gap: 5 },
  acceptBtn: {
    width: 28, height: 28, borderRadius: 6,
    backgroundColor: 'rgba(16,185,129,0.12)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)',
  },
  rejectBtn: {
    width: 28, height: 28, borderRadius: 6,
    backgroundColor: 'rgba(239,68,68,0.12)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)',
  },
  viewBtn: {
    width: 28, height: 28, borderRadius: 6,
    backgroundColor: '#13131a',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#1e1e2e',
  },
});
