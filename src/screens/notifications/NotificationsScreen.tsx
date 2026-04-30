import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { notificationsApi } from '../../api/notifications';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Notification } from '../../types';

const TYPE_ICONS: Record<string, { icon: string; color: string }> = {
  gift:     { icon: 'gift-outline',        color: '#a855f7' },
  follow:   { icon: 'person-add-outline',  color: '#3b82f6' },
  booking:  { icon: 'calendar-outline',    color: '#10b981' },
  wallet:   { icon: 'card-outline',        color: '#f59e0b' },
  comment:  { icon: 'chatbubble-outline',  color: '#06b6d4' },
  like:     { icon: 'heart-outline',       color: '#ef4444' },
  event:    { icon: 'musical-notes-outline', color: '#10b981' },
  deal:     { icon: 'briefcase-outline',   color: '#8b5cf6' },
  system:   { icon: 'information-circle-outline', color: '#6b7280' },
};

const MOCK: Notification[] = [
  { id: '1', type: 'gift', title: 'You received a gift!', message: 'SoundFan sent you a Diamond Star worth $50', createdAt: new Date(Date.now() - 5 * 60000).toISOString(), read: false },
  { id: '2', type: 'follow', title: 'New follower', message: 'BeatLover started following you', createdAt: new Date(Date.now() - 30 * 60000).toISOString(), read: false },
  { id: '3', type: 'booking', title: 'Booking inquiry', message: 'Fabric London sent you a booking inquiry for July 15', createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), read: true },
  { id: '4', type: 'wallet', title: 'Payout processed', message: 'Your payout of $480 has been sent via bank transfer', createdAt: new Date(Date.now() - 5 * 3600000).toISOString(), read: true },
  { id: '5', type: 'like', title: 'Set liked', message: '24 people liked your set "Deep House Sessions Vol. 3"', createdAt: new Date(Date.now() - 24 * 3600000).toISOString(), read: true },
  { id: '6', type: 'deal', title: 'Deal accepted', message: 'Berghain accepted your deal proposal for August 2', createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), read: true },
  { id: '7', type: 'event', title: 'Event reminder', message: 'Your event "Neon Nights" is tomorrow at 9 PM', createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), read: true },
  { id: '8', type: 'system', title: 'Profile verified', message: 'Your DJ profile has been verified. You now have a verified badge!', createdAt: new Date(Date.now() - 7 * 86400000).toISOString(), read: true },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      setNotifications(MOCK);
    } catch {
      setNotifications(MOCK);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const markAllRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotifPress = (item: Notification) => {
    // Mark-as-read could be wired here when the API is available; for now, no-op nav.
    if (!item.read) setNotifications((prev) => prev.map((n) => n.id === item.id ? { ...n, read: true } : n));
  };

  const renderItem = ({ item }: { item: Notification }) => {
    const typeInfo = TYPE_ICONS[item.type] ?? TYPE_ICONS.system;
    return (
      <TouchableOpacity onPress={() => handleNotifPress(item)} activeOpacity={0.7}>
        <Card style={[styles.notifCard, !item.read && styles.unreadCard]}>
          {!item.read && <View style={styles.unreadDot} />}
          <View style={[styles.iconWrap, { backgroundColor: `${typeInfo.color}15` }]}>
            <Ionicons name={typeInfo.icon as any} size={22} color={typeInfo.color} />
          </View>
          <View style={styles.notifBody}>
            <Text style={[styles.notifTitle, !item.read && styles.unreadTitle]}>{item.title}</Text>
            <Text style={styles.notifMessage} numberOfLines={2}>{item.message}</Text>
            <Text style={styles.notifTime}>{timeAgo(item.createdAt)}</Text>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <PageHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
        rightAction={unreadCount > 0 ? { icon: 'checkmark-done-outline', onPress: markAllRead } : undefined}
      />
      <FlatList
        data={notifications}
        keyExtractor={n => n.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor="#a855f7" />
        }
        ListEmptyComponent={<EmptyState icon="notifications-off-outline" message="No notifications yet" />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  list: { padding: 20, gap: 2 },
  notifCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, position: 'relative' },
  unreadCard: { borderColor: '#a855f730', backgroundColor: '#a855f708' },
  unreadDot: { position: 'absolute', top: 16, left: 8, width: 7, height: 7, borderRadius: 4, backgroundColor: '#a855f7' },
  iconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  notifBody: { flex: 1 },
  notifTitle: { color: '#ffffff90', fontSize: 15, fontWeight: '500', marginBottom: 3 },
  unreadTitle: { color: '#ffffff', fontWeight: '700' },
  notifMessage: { color: '#6b7280', fontSize: 13, lineHeight: 18 },
  notifTime: { color: '#4b5563', fontSize: 12, marginTop: 4 },
  separator: { height: 8 },
});
