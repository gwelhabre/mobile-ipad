import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { WalletStackParamList, Transaction } from '../../types';
import PageHeader from '../../components/layout/PageHeader';
import StatGrid, { StatItem } from '../../components/layout/StatGrid';
import TransactionRow from '../../components/wallet/TransactionRow';
import Button from '../../components/common/Button';

type Nav = NativeStackNavigationProp<WalletStackParamList, 'Wallet'>;

const MOCK_TRANSACTIONS: Transaction[] = Array.from({ length: 20 }, (_, i) => ({
  id: `tx-${i}`,
  userId: 'me',
  type: (['credit', 'gift_received', 'purchase', 'debit', 'payout', 'deal_payment', 'gift_sent', 'credit', 'purchase', 'debit', 'gift_received', 'credit', 'payout', 'deal_payment', 'credit', 'gift_received', 'purchase', 'debit', 'credit', 'gift_received'] as Transaction['type'][])[i],
  amount: [50, 25, 8.99, 15, 200, 150, 5, 75, 12.99, 30, 100, 40, 300, 250, 60, 35, 6.99, 20, 80, 45][i],
  currency: 'USD',
  description: [
    'Added funds via Stripe',
    'Diamond Gift from TechBeat',
    'Purchased: Deep Vibes Session',
    'Tip to Nova Sound',
    'Payout to Bank Account',
    'Fabric London booking payment',
    'Sent Fire Gift to DJ Pulse',
    'Added funds via Stripe',
    'Purchased: Tech House Massive',
    'Subscription fee',
    'Crown Gift from Leo',
    'Added funds via PayPal',
    'Payout to PayPal',
    'Club Nexus booking payment',
    'Added funds via Stripe',
    'Rocket Gift from Jordan',
    'Purchased: Trance Journey',
    'Platform fee',
    'Added funds via Stripe',
    'Fire Gift from Alex',
  ][i],
  status: (['completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'pending', 'completed', 'processing', 'completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'completed'] as Transaction['status'][])[i],
  createdAt: new Date(Date.now() - i * 3600000 * 12).toISOString(),
}));

const STATS: StatItem[] = [
  { icon: 'wallet', iconColor: '#7c3aed', value: '$1,284.50', label: 'Available Balance', trend: 'up', trendValue: '+$125' },
  { icon: 'time', iconColor: '#f59e0b', value: '$350.00', label: 'Pending', trend: 'neutral' },
  { icon: 'trending-up', iconColor: '#10b981', value: '$8,420.00', label: 'Total Earned', trend: 'up', trendValue: '+12%' },
  { icon: 'receipt', iconColor: '#3b82f6', value: '124', label: 'Transactions', trend: 'up', trendValue: '+8' },
];

export default function WalletScreen() {
  const navigation = useNavigation<Nav>();
  const [activeFilter, setActiveFilter] = useState<'all' | 'income' | 'expense'>('all');

  const filtered = MOCK_TRANSACTIONS.filter((tx) => {
    if (activeFilter === 'income') return ['credit', 'gift_received', 'deal_payment'].includes(tx.type);
    if (activeFilter === 'expense') return ['debit', 'purchase', 'gift_sent'].includes(tx.type);
    return true;
  });

  return (
    <View style={styles.container}>
      <PageHeader
        title="Wallet"
        subtitle="Your earnings and transactions"
        actions={[
          { element: <Button label="Add Funds" onPress={() => navigation.navigate('AddFunds')} variant="secondary" size="sm" icon="add-circle" /> },
          { element: <Button label="Payout" onPress={() => navigation.navigate('Payout')} variant="outline" size="sm" icon="arrow-up-circle" /> },
        ]}
      />

      {/* Stats */}
      <StatGrid stats={STATS} columns={4} />

      {/* Transaction list */}
      <View style={styles.tableSection}>
        {/* Filters */}
        <View style={styles.filterRow}>
          <Text style={styles.tableTitle}>Transaction History</Text>
          <View style={styles.filterBtns}>
            {(['all', 'income', 'expense'] as const).map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.filterBtn, activeFilter === f && styles.filterBtnActive]}
                onPress={() => setActiveFilter(f)}
              >
                <Text style={[styles.filterBtnText, activeFilter === f && styles.filterBtnTextActive]}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Table header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.th, { flex: 1 }]}>DESCRIPTION</Text>
          <Text style={[styles.th, { width: 100 }]}>STATUS</Text>
          <Text style={[styles.th, { width: 140 }]}>DATE</Text>
          <Text style={[styles.th, { width: 90, textAlign: 'right' }]}>AMOUNT</Text>
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TransactionRow transaction={item} />}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View style={{ height: 24 }} />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  tableSection: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: '#1e1e2e',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2e',
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f1f5f9',
  },
  filterBtns: {
    flexDirection: 'row',
    gap: 4,
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#13131a',
    borderWidth: 1,
    borderColor: '#1e1e2e',
  },
  filterBtnActive: {
    backgroundColor: 'rgba(124,58,237,0.15)',
    borderColor: '#7c3aed',
  },
  filterBtnText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  filterBtnTextActive: {
    color: '#a78bfa',
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2e',
    backgroundColor: '#0d0d16',
  },
  th: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.8,
  },
});
