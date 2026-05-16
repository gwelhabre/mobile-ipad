import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { walletApi } from '../../api/wallet';
import type { PayoutRequest, WhishStatus, WalletStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<WalletStackParamList, 'Payout'>;

const statusColor = (s: string) =>
  ({
    completed: '#10b981',
    paid: '#10b981',
    processing: '#f59e0b',
    approved: '#3b82f6',
    pending: '#64748b',
    rejected: '#ef4444',
  }[s] || '#64748b');

function maskPhone(phone: string): string {
  if (phone.length <= 5) return phone;
  return phone.slice(0, 3) + '••••' + phone.slice(-3);
}

export default function PayoutScreen() {
  const navigation = useNavigation<Nav>();
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [available, setAvailable] = useState(0);
  const [whish, setWhish] = useState<WhishStatus | null>(null);
  const [history, setHistory] = useState<PayoutRequest[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const [w, h] = await Promise.all([walletApi.getWallet(), walletApi.getPayoutHistory()]);
      setAvailable(w.data.wallet?.availableBalance ?? 0);
      setWhish(w.data.whish);
      setHistory(h.data.requests ?? []);
    } catch {
      // leave zeros
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  const verified = Boolean(whish?.whishPhoneVerifiedAt);
  const maskedPhone = whish?.whishPhone ? maskPhone(whish.whishPhone) : null;
  const numericAmount = parseFloat(amount) || 0;

  const handlePayout = async () => {
    if (numericAmount < 20) { Alert.alert('Minimum Payout', 'Minimum payout amount is $20.00'); return; }
    if (numericAmount > available) { Alert.alert('Insufficient Balance', `You only have $${available.toFixed(2)} available.`); return; }
    setLoading(true);
    try {
      const res = await walletApi.requestPayout(numericAmount, notes || undefined);
      setHistory((prev) => [res.data.payoutRequest, ...prev]);
      setAmount('');
      setNotes('');
      Alert.alert('Payout Requested', `Your payout of $${numericAmount.toFixed(2)} has been submitted.`);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error ?? 'Payout request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#f1f5f9" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Withdraw Funds</Text>
      </View>

      <View style={styles.splitLayout}>
        <ScrollView style={styles.leftPane} contentContainerStyle={styles.leftContent} keyboardShouldPersistTaps="handled">
          <View style={styles.balanceCard}>
            <Ionicons name="wallet" size={24} color="#a78bfa" />
            <View>
              <Text style={styles.balanceLabel}>Available to Withdraw</Text>
              <Text style={styles.balanceValue}>${available.toFixed(2)}</Text>
            </View>
          </View>

          {!verified && (
            <TouchableOpacity style={styles.setupCard} onPress={() => navigation.navigate('WhishSetup')}>
              <Ionicons name="phone-portrait-outline" size={22} color="#fbbf24" />
              <View style={{ flex: 1 }}>
                <Text style={styles.setupTitle}>Connect your Whish account</Text>
                <Text style={styles.setupSub}>Verify a Whish number to receive payouts.</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#fbbf24" />
            </TouchableOpacity>
          )}

          {verified && maskedPhone && (
            <TouchableOpacity style={styles.verifiedCard} onPress={() => navigation.navigate('WhishSetup')}>
              <Ionicons name="shield-checkmark" size={22} color="#10b981" />
              <View style={{ flex: 1 }}>
                <Text style={styles.verifiedTitle}>Whish verified</Text>
                <Text style={styles.verifiedSub}>
                  Payouts go to {maskedPhone}{whish?.whishDisplayName ? ` · ${whish.whishDisplayName}` : ''}
                </Text>
              </View>
              <Text style={styles.changeLink}>Change</Text>
            </TouchableOpacity>
          )}

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Amount</Text>
            <View style={styles.amountRow}>
              <Text style={styles.dollarSign}>$</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor="#3d4460"
                editable={verified}
              />
              <TouchableOpacity style={styles.maxBtn} onPress={() => setAmount(String(available))} disabled={!verified}>
                <Text style={styles.maxBtnText}>MAX</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Notes (optional)</Text>
            <TextInput
              style={styles.textInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any context for our team..."
              placeholderTextColor="#3d4460"
              editable={verified}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, (loading || !verified || numericAmount < 20) && styles.submitBtnDisabled]}
            onPress={handlePayout}
            disabled={loading || !verified || numericAmount < 20}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="arrow-up-circle" size={20} color="#fff" />
                <Text style={styles.submitBtnText}>Request Payout</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.note}>Minimum payout: $20.00 · paid via Whish</Text>
        </ScrollView>

        <View style={styles.rightPane}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Payout History</Text>
          </View>

          {history.length === 0 ? (
            <View style={styles.emptyHistory}>
              <Text style={styles.emptyText}>No payouts yet.</Text>
            </View>
          ) : (
            <FlatList
              data={history}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.historyRow}>
                  <View style={styles.historyIcon}>
                    <Ionicons name="arrow-up-circle" size={20} color="#a78bfa" />
                  </View>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyMethod}>{item.method.toUpperCase()}</Text>
                    <Text style={styles.historyDate}>
                      {new Date(item.requestedAt ?? item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Text>
                  </View>
                  <View style={styles.historyRight}>
                    <Text style={styles.historyAmount}>-${item.amount.toFixed(2)}</Text>
                    <View style={[styles.historyStatus, { backgroundColor: `${statusColor(item.status)}18` }]}>
                      <Text style={[styles.historyStatusText, { color: statusColor(item.status) }]}>
                        {item.status}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#1e1e2e', gap: 14,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#13131a', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#f1f5f9' },
  splitLayout: { flex: 1, flexDirection: 'row' },
  leftPane: { flex: 1, borderRightWidth: 1, borderRightColor: '#1e1e2e' },
  leftContent: { padding: 28, maxWidth: 560, gap: 20 },
  balanceCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: 'rgba(124,58,237,0.1)', borderRadius: 14, padding: 18,
    borderWidth: 1, borderColor: 'rgba(124,58,237,0.2)',
  },
  balanceLabel: { fontSize: 12, color: '#64748b', marginBottom: 2 },
  balanceValue: { fontSize: 24, fontWeight: '800', color: '#f1f5f9' },
  setupCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(251,191,36,0.08)', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: 'rgba(251,191,36,0.3)',
  },
  setupTitle: { color: '#fde68a', fontSize: 14, fontWeight: '700' },
  setupSub: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
  verifiedCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(16,185,129,0.08)', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)',
  },
  verifiedTitle: { color: '#bbf7d0', fontSize: 14, fontWeight: '700' },
  verifiedSub: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
  changeLink: { color: '#94a3b8', fontSize: 12 },
  fieldGroup: { gap: 8 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: '#94a3b8', letterSpacing: 0.3 },
  amountRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#13131a', borderRadius: 12,
    borderWidth: 1, borderColor: '#1e1e2e',
    paddingHorizontal: 16, height: 54, gap: 8,
  },
  dollarSign: { fontSize: 22, fontWeight: '700', color: '#a78bfa' },
  amountInput: { flex: 1, fontSize: 26, fontWeight: '800', color: '#f1f5f9' },
  maxBtn: {
    backgroundColor: 'rgba(124,58,237,0.15)',
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 6, borderWidth: 1, borderColor: 'rgba(124,58,237,0.2)',
  },
  maxBtnText: { fontSize: 11, fontWeight: '700', color: '#a78bfa' },
  textInput: {
    backgroundColor: '#13131a', borderRadius: 12, borderWidth: 1, borderColor: '#1e1e2e',
    paddingHorizontal: 16, height: 48, fontSize: 14, color: '#f1f5f9',
  },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#7c3aed', borderRadius: 14, height: 52,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  note: { fontSize: 12, color: '#475569', textAlign: 'center' },
  rightPane: { flex: 1 },
  historyHeader: {
    paddingHorizontal: 24, paddingVertical: 18,
    borderBottomWidth: 1, borderBottomColor: '#1e1e2e',
  },
  historyTitle: { fontSize: 16, fontWeight: '700', color: '#f1f5f9' },
  emptyHistory: { padding: 28, alignItems: 'center' },
  emptyText: { color: '#64748b', fontSize: 13 },
  historyRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#1a1a2a', gap: 14,
  },
  historyIcon: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: 'rgba(124,58,237,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  historyInfo: { flex: 1 },
  historyMethod: { fontSize: 14, fontWeight: '600', color: '#f1f5f9', marginBottom: 2 },
  historyDate: { fontSize: 12, color: '#64748b' },
  historyRight: { alignItems: 'flex-end', gap: 4 },
  historyAmount: { fontSize: 16, fontWeight: '700', color: '#ef4444' },
  historyStatus: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  historyStatusText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
});
