import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction } from '../../types';

interface TransactionRowProps {
  transaction: Transaction;
}

const TYPE_CONFIG: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string; label: string }> = {
  credit: { icon: 'add-circle', color: '#10b981', label: 'Credit' },
  debit: { icon: 'remove-circle', color: '#ef4444', label: 'Debit' },
  payout: { icon: 'arrow-up-circle', color: '#f59e0b', label: 'Payout' },
  purchase: { icon: 'cart', color: '#3b82f6', label: 'Purchase' },
  gift_sent: { icon: 'gift', color: '#a78bfa', label: 'Gift Sent' },
  gift_received: { icon: 'gift', color: '#10b981', label: 'Gift Received' },
  deal_payment: { icon: 'briefcase', color: '#f59e0b', label: 'Deal Payment' },
};

export default function TransactionRow({ transaction }: TransactionRowProps) {
  const config = TYPE_CONFIG[transaction.type] || TYPE_CONFIG.credit;
  const isPositive = ['credit', 'gift_received', 'deal_payment'].includes(transaction.type);
  const date = new Date(transaction.createdAt);
  const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={styles.row}>
      <View style={[styles.iconWrapper, { backgroundColor: `${config.color}18` }]}>
        <Ionicons name={config.icon} size={22} color={config.color} />
      </View>

      <View style={styles.mainInfo}>
        <Text style={styles.description} numberOfLines={1}>{transaction.description}</Text>
        <Text style={styles.type}>{config.label}</Text>
      </View>

      <View style={styles.statusArea}>
        <View style={[
          styles.statusBadge,
          transaction.status === 'completed' ? styles.statusCompleted :
          transaction.status === 'pending' ? styles.statusPending : styles.statusFailed,
        ]}>
          <Text style={[
            styles.statusText,
            transaction.status === 'completed' ? styles.statusTextCompleted :
            transaction.status === 'pending' ? styles.statusTextPending : styles.statusTextFailed,
          ]}>
            {transaction.status}
          </Text>
        </View>
      </View>

      <View style={styles.dateArea}>
        <Text style={styles.date}>{formattedDate}</Text>
        <Text style={styles.time}>{formattedTime}</Text>
      </View>

      <View style={styles.amountArea}>
        <Text style={[styles.amount, { color: isPositive ? '#10b981' : '#ef4444' }]}>
          {isPositive ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
        </Text>
        <Text style={styles.currency}>{transaction.currency}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2a',
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  mainInfo: {
    flex: 1,
    marginRight: 16,
  },
  description: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: 2,
  },
  type: {
    fontSize: 12,
    color: '#64748b',
  },
  statusArea: {
    width: 90,
    alignItems: 'flex-start',
    marginRight: 16,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusCompleted: {
    backgroundColor: 'rgba(16,185,129,0.12)',
  },
  statusPending: {
    backgroundColor: 'rgba(245,158,11,0.12)',
  },
  statusFailed: {
    backgroundColor: 'rgba(239,68,68,0.12)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statusTextCompleted: { color: '#10b981' },
  statusTextPending: { color: '#f59e0b' },
  statusTextFailed: { color: '#ef4444' },
  dateArea: {
    width: 130,
    marginRight: 16,
  },
  date: {
    fontSize: 12,
    color: '#64748b',
  },
  time: {
    fontSize: 11,
    color: '#475569',
    marginTop: 1,
  },
  amountArea: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  amount: {
    fontSize: 16,
    fontWeight: '800',
  },
  currency: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
});
