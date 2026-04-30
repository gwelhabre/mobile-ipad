import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { createDJSet } from '../../api/dj';

const MOCK_SETS = Array.from({ length: 12 }, (_, i) => ({
  id: `set-${i}`,
  title: ['Tech House Massive Vol.1', 'Deep Vibes Session', 'Underground Techno Mix', 'Late Night Grooves', 'Fabric Live Recording', 'Festival Set 2026', 'Morning Ritual', 'Club Mix Vol.2', 'Ibiza Sessions', 'Warehouse Special', 'Peak Time Anthems', 'Closing Set'][i],
  price: [8.99, 6.99, 12.99, 5.99, 14.99, 19.99, 4.99, 9.99, 11.99, 16.99, 13.99, 7.99][i],
  duration: [62, 78, 90, 55, 120, 135, 44, 71, 85, 98, 108, 67][i],
  genre: ['Tech House', 'Deep House', 'Techno', 'Tech House', 'Tech House', 'Techno', 'Ambient', 'Tech House', 'Afro House', 'Techno', 'Peak Time', 'Deep House'][i],
  salesCount: [340, 210, 158, 422, 89, 45, 123, 267, 98, 156, 201, 334][i],
  status: (['active', 'active', 'active', 'active', 'active', 'draft', 'active', 'active', 'draft', 'active', 'active', 'archived'] as const)[i],
  createdAt: new Date(Date.now() - i * 7 * 24 * 3600000).toISOString(),
}));

export default function DJSetsScreen() {
  const [sets, setSets] = useState(MOCK_SETS);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [price, setPrice] = useState('0');
  const [accessType, setAccessType] = useState<'free' | 'paid' | 'subscription'>('free');
  const [saving, setSaving] = useState(false);

  const submitSet = async () => {
    if (saving) return; // re-entrancy guard
    if (!title.trim()) {
      Alert.alert('Missing title', 'Set title is required.');
      return;
    }
    setSaving(true);
    try {
      await createDJSet({
        title: title.trim(),
        description: description.trim() || undefined,
        previewUrl: previewUrl.trim() || undefined,
        coverImage: coverImage.trim() || undefined,
        price: accessType === 'paid' ? Number(price) || 0 : 0,
        accessType,
        visibility: 'public',
      });
      setTitle(''); setDescription(''); setPreviewUrl(''); setCoverImage(''); setPrice('0'); setAccessType('free');
      setModalVisible(false);
      Alert.alert('Set published', 'Your set is now visible.');
    } catch (err: any) {
      Alert.alert('Could not publish', err?.response?.data?.error ?? 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const totalSales = sets.reduce((sum, s) => sum + s.salesCount, 0);
  const totalRevenue = sets.reduce((sum, s) => sum + s.price * s.salesCount, 0);

  const statusVariant = (status: string): 'emerald' | 'amber' | 'gray' => ({
    active: 'emerald',
    draft: 'amber',
    archived: 'gray',
  }[status] as any) || 'gray';

  const TABLE_HEADER = ['TITLE', 'GENRE', 'DURATION', 'PRICE', 'SALES', 'REVENUE', 'STATUS', 'ACTIONS'];

  return (
    <View style={styles.container}>
      <PageHeader
        title="My Sets"
        subtitle={`${sets.length} sets • ${totalSales.toLocaleString()} total sales`}
        actions={[
          { element: (
            <Button label="Upload Set" onPress={() => setModalVisible(true)} variant="primary" size="sm" icon="add-circle" />
          ) },
        ]}
      />

      {/* Summary row */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{sets.length}</Text>
          <Text style={styles.summaryLabel}>Total Sets</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{totalSales.toLocaleString()}</Text>
          <Text style={styles.summaryLabel}>Total Sales</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>${totalRevenue.toFixed(0)}</Text>
          <Text style={styles.summaryLabel}>Total Revenue</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{sets.filter((s) => s.status === 'active').length}</Text>
          <Text style={styles.summaryLabel}>Active</Text>
        </View>
      </View>

      {/* Table header */}
      <View style={styles.tableHeader}>
        <View style={styles.thTitle}><Text style={styles.thText}>TITLE</Text></View>
        <View style={styles.thGenre}><Text style={styles.thText}>GENRE</Text></View>
        <View style={styles.thDuration}><Text style={styles.thText}>DURATION</Text></View>
        <View style={styles.thPrice}><Text style={[styles.thText, styles.thRight]}>PRICE</Text></View>
        <View style={styles.thSales}><Text style={[styles.thText, styles.thRight]}>SALES</Text></View>
        <View style={styles.thRevenue}><Text style={[styles.thText, styles.thRight]}>REVENUE</Text></View>
        <View style={styles.thStatus}><Text style={styles.thText}>STATUS</Text></View>
        <View style={styles.thActions}><Text style={styles.thText}>ACTIONS</Text></View>
      </View>

      <FlatList
        data={sets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.tableRow}>
            <View style={styles.thTitle}>
              <View style={styles.setIconWrapper}>
                <Ionicons name="musical-note" size={14} color="#7c3aed" />
              </View>
              <View style={styles.setTitleInfo}>
                <Text style={styles.setTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.setDate}>
                  {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
              </View>
            </View>
            <View style={styles.thGenre}>
              <Text style={styles.rowText}>{item.genre}</Text>
            </View>
            <View style={styles.thDuration}>
              <Text style={styles.rowText}>{item.duration} min</Text>
            </View>
            <View style={styles.thPrice}>
              <Text style={[styles.rowText, styles.priceText]}>${item.price}</Text>
            </View>
            <View style={styles.thSales}>
              <Text style={[styles.rowText, styles.salesText]}>{item.salesCount}</Text>
            </View>
            <View style={styles.thRevenue}>
              <Text style={[styles.rowText, styles.revenueText]}>
                ${(item.price * item.salesCount).toFixed(0)}
              </Text>
            </View>
            <View style={styles.thStatus}>
              <Badge label={item.status} variant={statusVariant(item.status)} size="sm" />
            </View>
            <View style={[styles.thActions, styles.actionsRow]}>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="pencil" size={15} color="#94a3b8" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="stats-chart" size={15} color="#94a3b8" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]}>
                <Ionicons name="trash" size={15} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={<View style={{ height: 24 }} />}
      />

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Set</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalBody}>
              <TextInput style={styles.modalInput} value={title} onChangeText={setTitle} placeholder="Set title" placeholderTextColor="#4b5563" />
              <TextInput style={[styles.modalInput, { minHeight: 80 }]} value={description} onChangeText={setDescription} placeholder="Description" placeholderTextColor="#4b5563" multiline textAlignVertical="top" />
              <TextInput style={styles.modalInput} value={previewUrl} onChangeText={setPreviewUrl} placeholder="Preview URL (audio)" placeholderTextColor="#4b5563" autoCapitalize="none" />
              <TextInput style={styles.modalInput} value={coverImage} onChangeText={setCoverImage} placeholder="Cover image URL" placeholderTextColor="#4b5563" autoCapitalize="none" />
              <Text style={styles.modalLabel}>Access</Text>
              <View style={styles.chipRow}>
                {(['free', 'paid', 'subscription'] as const).map((t) => (
                  <TouchableOpacity key={t} style={[styles.chip, accessType === t && styles.chipActive]} onPress={() => setAccessType(t)}>
                    <Text style={[styles.chipText, accessType === t && styles.chipTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {accessType === 'paid' && (
                <TextInput style={styles.modalInput} value={price} onChangeText={setPrice} placeholder="Price" placeholderTextColor="#4b5563" keyboardType="decimal-pad" />
              )}
              <Button label={saving ? 'Publishing...' : 'Publish Set'} onPress={submitSet} loading={saving} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2e',
    alignItems: 'center',
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 22, fontWeight: '800', color: '#f1f5f9', marginBottom: 2 },
  summaryLabel: { fontSize: 12, color: '#64748b' },
  summaryDivider: { width: 1, height: 40, backgroundColor: '#1e1e2e' },
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
  thTitle: { flex: 2, flexDirection: 'row', alignItems: 'center', gap: 10 },
  thGenre: { flex: 1 },
  thDuration: { width: 90 },
  thPrice: { width: 70, alignItems: 'flex-end' },
  thSales: { width: 70, alignItems: 'flex-end' },
  thRevenue: { width: 90, alignItems: 'flex-end' },
  thStatus: { width: 90, paddingLeft: 12 },
  thActions: { width: 100, paddingLeft: 12 },
  thText: { fontSize: 10, fontWeight: '700', color: '#475569', letterSpacing: 0.8 },
  thRight: { textAlign: 'right' },
  setIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(124,58,237,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  setTitleInfo: { flex: 1 },
  setTitle: { fontSize: 13, fontWeight: '700', color: '#f1f5f9', marginBottom: 1 },
  setDate: { fontSize: 11, color: '#475569' },
  rowText: { fontSize: 13, color: '#94a3b8' },
  priceText: { color: '#a78bfa', fontWeight: '700' },
  salesText: { color: '#f1f5f9', fontWeight: '600' },
  revenueText: { color: '#10b981', fontWeight: '700' },
  actionsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionBtn: {
    width: 30,
    height: 30,
    borderRadius: 7,
    backgroundColor: '#13131a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1e1e2e',
  },
  deleteBtn: { borderColor: 'rgba(239,68,68,0.2)' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'center', padding: 32 },
  modalCard: { maxHeight: '88%', backgroundColor: '#12121a', borderRadius: 18, borderWidth: 1, borderColor: '#263241', padding: 22, maxWidth: 520, alignSelf: 'center', width: '100%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modalTitle: { color: '#f1f5f9', fontSize: 20, fontWeight: '900' },
  closeBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#1f1f2e', alignItems: 'center', justifyContent: 'center' },
  modalBody: { gap: 12 },
  modalInput: { backgroundColor: '#0a0a0f', borderWidth: 1, borderColor: '#1e1e2e', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: '#f1f5f9', fontSize: 14 },
  modalLabel: { color: '#94a3b8', fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 },
  chipRow: { flexDirection: 'row', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: '#1e1e2e', backgroundColor: '#13131a' },
  chipActive: { borderColor: '#7c3aed', backgroundColor: 'rgba(124,58,237,0.12)' },
  chipText: { color: '#94a3b8', fontSize: 12, fontWeight: '700' },
  chipTextActive: { color: '#a78bfa' },
});
