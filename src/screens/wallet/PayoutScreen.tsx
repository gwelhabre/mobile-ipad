import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const PAYOUT_METHODS = [
  { id: 'bank', label: 'Bank Transfer', icon: 'business-outline', description: '1–3 business days' },
  { id: 'paypal', label: 'PayPal', icon: 'logo-paypal', description: 'Instant to PayPal' },
  { id: 'stripe', label: 'Stripe', icon: 'card-outline', description: 'Next business day' },
];

const MOCK_PAYOUTS = Array.from({ length: 8 }, (_, i) => ({
  id: `payout-${i}`,
  amount: [200, 150, 300, 500, 175, 420, 250, 100][i],
  method: ['bank', 'paypal', 'stripe', 'bank', 'paypal', 'bank', 'stripe', 'paypal'][i],
  status: ['completed', 'completed', 'processing', 'completed', 'completed', 'pending', 'completed', 'completed'][i] as string,
  createdAt: new Date(Date.now() - i * 7 * 24 * 3600000).toISOString(),
}));

export default function PayoutScreen() {
  const navigation = useNavigation();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('bank');
  const [accountDetails, setAccountDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const available = 1284.50;
  const numericAmount = parseFloat(amount) || 0;

  const handlePayout = async () => {
    if (numericAmount < 20) {
      Alert.alert('Minimum Payout', 'Minimum payout amount is $20.00');
      return;
    }
    if (numericAmount > available) {
      Alert.alert('Insufficient Balance', `You only have $${available.toFixed(2)} available.`);
      return;
    }
    if (!accountDetails.trim()) {
      Alert.alert('Missing Details', 'Please enter your account details.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Payout Requested', `Your payout of $${numericAmount.toFixed(2)} has been submitted.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }, 1500);
  };

  const statusColor = (s: string) => ({ completed: '#10b981', processing: '#f59e0b', pending: '#64748b', rejected: '#ef4444' }[s] || '#64748b');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#f1f5f9" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Withdraw Funds</Text>
      </View>

      <View style={styles.splitLayout}>
        {/* Left: Payout form */}
        <ScrollView style={styles.leftPane} contentContainerStyle={styles.leftContent} keyboardShouldPersistTaps="handled">
          {/* Available balance */}
          <View style={styles.balanceCard}>
            <Ionicons name="wallet" size={24} color="#a78bfa" />
            <View>
              <Text style={styles.balanceLabel}>Available to Withdraw</Text>
              <Text style={styles.balanceValue}>${available.toFixed(2)}</Text>
            </View>
          </View>

          {/* Amount */}
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
              />
              <TouchableOpacity style={styles.maxBtn} onPress={() => setAmount(String(available))}>
                <Text style={styles.maxBtnText}>MAX</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Method */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Payout Method</Text>
            {PAYOUT_METHODS.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={[styles.methodRow, method === m.id && styles.methodRowActive]}
                onPress={() => setMethod(m.id)}
              >
                <Ionicons name={m.icon as any} size={20} color={method === m.id ? '#a78bfa' : '#64748b'} />
                <View style={styles.methodInfo}>
                  <Text style={[styles.methodLabel, method === m.id && styles.methodLabelActive]}>{m.label}</Text>
                  <Text style={styles.methodDesc}>{m.description}</Text>
                </View>
                {method === m.id && <Ionicons name="checkmark-circle" size={20} color="#7c3aed" />}
              </TouchableOpacity>
            ))}
          </View>

          {/* Account details */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              {method === 'bank' ? 'Account Number / IBAN' : method === 'paypal' ? 'PayPal Email' : 'Stripe Account ID'}
            </Text>
            <TextInput
              style={styles.textInput}
              value={accountDetails}
              onChangeText={setAccountDetails}
              placeholder={method === 'bank' ? 'e.g. GB29NWBK60161331926819' : method === 'paypal' ? 'your@paypal.email' : 'acct_XXXXXXXXXX'}
              placeholderTextColor="#3d4460"
              autoCapitalize="none"
            />
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, (loading || numericAmount < 20) && styles.submitBtnDisabled]}
            onPress={handlePayout}
            disabled={loading || numericAmount < 20}
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

          <Text style={styles.note}>Minimum payout: $20.00 • Processing fee: 1%</Text>
        </ScrollView>

        {/* Right: History */}
        <View style={styles.rightPane}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Payout History</Text>
          </View>

          <FlatList
            data={MOCK_PAYOUTS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.historyRow}>
                <View style={styles.historyIcon}>
                  <Ionicons name="arrow-up-circle" size={20} color="#a78bfa" />
                </View>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyMethod}>{PAYOUT_METHODS.find((m) => m.id === item.method)?.label}</Text>
                  <Text style={styles.historyDate}>
                    {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2e',
    gap: 14,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#13131a', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#f1f5f9' },
  splitLayout: { flex: 1, flexDirection: 'row' },
  leftPane: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#1e1e2e',
  },
  leftContent: {
    padding: 28,
    maxWidth: 560,
    gap: 20,
  },
  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(124,58,237,0.1)',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.2)',
  },
  balanceLabel: { fontSize: 12, color: '#64748b', marginBottom: 2 },
  balanceValue: { fontSize: 24, fontWeight: '800', color: '#f1f5f9' },
  fieldGroup: { gap: 8 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: '#94a3b8', letterSpacing: 0.3 },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#13131a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e1e2e',
    paddingHorizontal: 16,
    height: 54,
    gap: 8,
  },
  dollarSign: { fontSize: 22, fontWeight: '700', color: '#a78bfa' },
  amountInput: { flex: 1, fontSize: 26, fontWeight: '800', color: '#f1f5f9' },
  maxBtn: {
    backgroundColor: 'rgba(124,58,237,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.2)',
  },
  maxBtnText: { fontSize: 11, fontWeight: '700', color: '#a78bfa' },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#13131a',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e1e2e',
    marginBottom: 4,
  },
  methodRowActive: { borderColor: '#7c3aed', backgroundColor: 'rgba(124,58,237,0.05)' },
  methodInfo: { flex: 1 },
  methodLabel: { fontSize: 14, fontWeight: '600', color: '#94a3b8' },
  methodLabelActive: { color: '#f1f5f9' },
  methodDesc: { fontSize: 11, color: '#475569', marginTop: 1 },
  textInput: {
    backgroundColor: '#13131a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e1e2e',
    paddingHorizontal: 16,
    height: 48,
    fontSize: 14,
    color: '#f1f5f9',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#7c3aed',
    borderRadius: 14,
    height: 52,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  note: { fontSize: 12, color: '#475569', textAlign: 'center' },
  rightPane: { flex: 1 },
  historyHeader: {
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2e',
  },
  historyTitle: { fontSize: 16, fontWeight: '700', color: '#f1f5f9' },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2a',
    gap: 14,
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
