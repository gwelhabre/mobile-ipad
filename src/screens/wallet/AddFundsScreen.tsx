import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const QUICK_AMOUNTS = [10, 25, 50, 100, 250, 500];

const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit / Debit Card', icon: 'card-outline', description: 'Visa, Mastercard, Amex' },
  { id: 'paypal', label: 'PayPal', icon: 'logo-paypal', description: 'Pay with your PayPal balance' },
  { id: 'apple_pay', label: 'Apple Pay', icon: 'logo-apple', description: 'Touch ID or Face ID' },
];

export default function AddFundsScreen() {
  const navigation = useNavigation();
  const [amount, setAmount] = useState('50');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);

  const numericAmount = parseFloat(amount) || 0;
  const fee = numericAmount * 0.029 + 0.30;
  const total = numericAmount + fee;

  const handleAddFunds = async () => {
    if (numericAmount < 5) {
      Alert.alert('Minimum Amount', 'Minimum deposit is $5.00');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success!', `$${numericAmount.toFixed(2)} has been added to your wallet.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }, 1500);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#f1f5f9" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Funds</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Centered card layout */}
        <View style={styles.cardWrapper}>
          {/* Balance preview */}
          <LinearGradient
            colors={['rgba(124,58,237,0.3)', 'rgba(16,185,129,0.2)']}
            style={styles.balanceCard}
          >
            <Text style={styles.balanceLabel}>Current Balance</Text>
            <Text style={styles.balanceValue}>$1,284.50</Text>
          </LinearGradient>

          {/* Amount input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Enter Amount</Text>
            <View style={styles.amountInputWrapper}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor="#3d4460"
              />
            </View>

            {/* Quick amount buttons */}
            <View style={styles.quickAmounts}>
              {QUICK_AMOUNTS.map((a) => (
                <TouchableOpacity
                  key={a}
                  style={[styles.quickBtn, amount === String(a) && styles.quickBtnActive]}
                  onPress={() => setAmount(String(a))}
                >
                  <Text style={[styles.quickBtnText, amount === String(a) && styles.quickBtnTextActive]}>
                    ${a}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Payment method */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <View style={styles.methodList}>
              {PAYMENT_METHODS.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[styles.methodRow, paymentMethod === method.id && styles.methodRowActive]}
                  onPress={() => setPaymentMethod(method.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.methodIcon}>
                    <Ionicons name={method.icon as any} size={22} color={paymentMethod === method.id ? '#a78bfa' : '#64748b'} />
                  </View>
                  <View style={styles.methodInfo}>
                    <Text style={[styles.methodLabel, paymentMethod === method.id && styles.methodLabelActive]}>
                      {method.label}
                    </Text>
                    <Text style={styles.methodDesc}>{method.description}</Text>
                  </View>
                  <View style={[styles.radioOuter, paymentMethod === method.id && styles.radioOuterActive]}>
                    {paymentMethod === method.id && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Fee breakdown */}
          {numericAmount > 0 && (
            <View style={styles.feeBreakdown}>
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Amount</Text>
                <Text style={styles.feeValue}>${numericAmount.toFixed(2)}</Text>
              </View>
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Processing fee (2.9% + $0.30)</Text>
                <Text style={styles.feeValue}>${fee.toFixed(2)}</Text>
              </View>
              <View style={[styles.feeRow, styles.feeTotalRow]}>
                <Text style={styles.feeTotalLabel}>Total charge</Text>
                <Text style={styles.feeTotalValue}>${total.toFixed(2)}</Text>
              </View>
            </View>
          )}

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, (loading || numericAmount < 5) && styles.submitBtnDisabled]}
            onPress={handleAddFunds}
            disabled={loading || numericAmount < 5}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="add-circle" size={20} color="#fff" />
                <Text style={styles.submitBtnText}>
                  Add ${numericAmount.toFixed(2)} to Wallet
                </Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.secureNote}>
            <Ionicons name="lock-closed" size={12} color="#475569" /> Secured by 256-bit SSL encryption
          </Text>
        </View>
      </ScrollView>
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
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#13131a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f1f5f9',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 40,
  },
  cardWrapper: {
    width: '100%',
    maxWidth: 520,
    gap: 20,
  },
  balanceCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 13,
    color: 'rgba(241,245,249,0.6)',
    marginBottom: 6,
  },
  balanceValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#f1f5f9',
  },
  section: {
    backgroundColor: '#13131a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e1e2e',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0a0f',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#7c3aed',
    paddingHorizontal: 20,
    marginBottom: 16,
    height: 64,
    gap: 8,
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: '700',
    color: '#a78bfa',
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '800',
    color: '#f1f5f9',
    height: 64,
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickBtn: {
    flex: 1,
    minWidth: '14%',
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#1a1a2a',
    borderWidth: 1,
    borderColor: '#1e1e2e',
    alignItems: 'center',
  },
  quickBtnActive: {
    backgroundColor: 'rgba(124,58,237,0.2)',
    borderColor: '#7c3aed',
  },
  quickBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
  },
  quickBtnTextActive: {
    color: '#a78bfa',
  },
  methodList: { gap: 8 },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#0a0a0f',
    borderWidth: 1,
    borderColor: '#1e1e2e',
    gap: 14,
  },
  methodRowActive: {
    borderColor: '#7c3aed',
    backgroundColor: 'rgba(124,58,237,0.05)',
  },
  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#13131a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodInfo: { flex: 1 },
  methodLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 2,
  },
  methodLabelActive: { color: '#f1f5f9' },
  methodDesc: { fontSize: 12, color: '#475569' },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#3d4460',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: { borderColor: '#7c3aed' },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#7c3aed',
  },
  feeBreakdown: {
    backgroundColor: '#13131a',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1e1e2e',
    gap: 10,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  feeLabel: { fontSize: 13, color: '#64748b' },
  feeValue: { fontSize: 13, color: '#94a3b8', fontWeight: '600' },
  feeTotalRow: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1e1e2e',
  },
  feeTotalLabel: { fontSize: 15, fontWeight: '700', color: '#f1f5f9' },
  feeTotalValue: { fontSize: 17, fontWeight: '800', color: '#a78bfa' },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#7c3aed',
    borderRadius: 14,
    height: 56,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },
  secureNote: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
  },
});
