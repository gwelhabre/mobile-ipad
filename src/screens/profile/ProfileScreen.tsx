import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import { ProfileStackParamList } from '../../types';

const ROLE_COLORS: Record<string, string> = {
  dj: '#a855f7',
  venue_manager: '#10b981',
  admin: '#ef4444',
  fan: '#3b82f6',
  promoter: '#f59e0b',
  seller: '#06b6d4',
  event_planner: '#06b6d4',
};

type QuickAction = {
  icon: string;
  label: string;
  screen: string;
  nestedScreen?: string;
  nestedParams?: Record<string, unknown>;
  color: string;
  roles?: string[];
};

const QUICK_ACTIONS: QuickAction[] = [
  { icon: 'analytics-outline', label: 'DJ Dashboard', screen: 'DJStack', nestedScreen: 'DJDashboard', color: '#a855f7', roles: ['dj'] },
  { icon: 'videocam-outline', label: 'Videos', screen: 'DJStack', nestedScreen: 'DJVideos', color: '#a855f7', roles: ['dj'] },
  { icon: 'radio-outline', label: 'Go Live', screen: 'DJStack', nestedScreen: 'DJBroadcast', color: '#ef4444', roles: ['dj'] },
  { icon: 'trending-up-outline', label: 'Analytics', screen: 'DJStack', nestedScreen: 'DJAnalytics', color: '#3b82f6', roles: ['dj'] },
  { icon: 'disc-outline', label: 'My Sets', screen: 'DJStack', nestedScreen: 'DJSets', color: '#10b981', roles: ['dj'] },
  { icon: 'briefcase-outline', label: 'Deals', screen: 'DJStack', nestedScreen: 'DJDeals', color: '#f59e0b', roles: ['dj', 'venue_manager'] },
  { icon: 'business-outline', label: 'Venue Dashboard', screen: 'VenueStack', nestedScreen: 'VenueDashboard', color: '#10b981', roles: ['venue_manager'] },
  { icon: 'shield-outline', label: 'Admin', screen: 'ProfileStack', nestedScreen: 'Admin', color: '#ef4444', roles: ['admin'] },
  { icon: 'card-outline', label: 'Wallet', screen: 'WalletStack', color: '#f59e0b', roles: ['dj', 'venue_manager', 'fan', 'seller'] },
  { icon: 'bag-handle-outline', label: 'My Orders', screen: 'MarketplaceStack', nestedScreen: 'Orders', color: '#a78bfa', roles: ['fan', 'dj', 'venue_manager', 'seller'] },
  { icon: 'storefront-outline', label: 'My Listings', screen: 'MarketplaceStack', nestedScreen: 'MyListings', color: '#06b6d4', roles: ['seller', 'dj'] },
  { icon: 'sparkles-outline', label: 'Event Planner', screen: 'EventPlannerDashboard', color: '#06b6d4', roles: ['event_planner'] },
  { icon: 'information-circle-outline', label: 'About', screen: 'ProfileStack', nestedScreen: 'Info', nestedParams: { topic: 'about' }, color: '#94a3b8' },
  { icon: 'help-circle-outline', label: 'Help', screen: 'ProfileStack', nestedScreen: 'Info', nestedParams: { topic: 'help' }, color: '#94a3b8' },
];

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ],
    );
  };

  const role = user?.role ?? 'fan';
  const roleColor = ROLE_COLORS[role] ?? '#6b7280';
  const visibleActions = QUICK_ACTIONS.filter(a => !a.roles || a.roles.includes(role));

  const STATS = [
    { label: 'Following', value: '128', icon: 'person-outline' },
    { label: 'Followers', value: user?.role === 'dj' ? '52.4k' : '—', icon: 'people-outline' },
    { label: 'Events', value: '24', icon: 'calendar-outline' },
    { label: 'Gifts Sent', value: '16', icon: 'gift-outline' },
  ];

  return (
    <View style={styles.container}>
      <PageHeader title="My Profile" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileHeader}>
          <View style={styles.profileLeft}>
            <Avatar name={user?.displayName ?? user?.username ?? 'User'} size={80} />
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{user?.displayName ?? user?.username ?? 'User'}</Text>
              <Text style={styles.email}>{user?.email ?? ''}</Text>
              <View style={[styles.roleBadge, { backgroundColor: `${roleColor}20`, borderColor: `${roleColor}40` }]}>
                <Text style={[styles.roleText, { color: roleColor }]}>{role.replace('_', ' ').toUpperCase()}</Text>
              </View>
            </View>
          </View>
          <View style={styles.statsRow}>
            {STATS.map(stat => (
              <View key={stat.label} style={styles.statItem}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {visibleActions.length > 0 && (
          <Card style={styles.actionsCard}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              {visibleActions.map(action => (
                <TouchableOpacity
                  key={action.label}
                  style={[styles.actionBtn, { borderColor: `${action.color}30` }]}
                  onPress={() => {
                    if (action.nestedScreen) {
                      navigation.navigate(action.screen, { screen: action.nestedScreen, params: action.nestedParams });
                    } else {
                      navigation.navigate(action.screen);
                    }
                  }}
                >
                  <View style={[styles.actionIcon, { backgroundColor: `${action.color}20` }]}>
                    <Ionicons name={action.icon as any} size={24} color={action.color} />
                  </View>
                  <Text style={styles.actionLabel}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        )}

        <Card style={styles.menuCard}>
          <Text style={styles.sectionTitle}>Account</Text>
          {[
            { icon: 'person-outline', label: 'Edit Profile', screen: 'EditProfile' },
            { icon: 'settings-outline', label: 'Settings', screen: 'Settings' },
            { icon: 'notifications-outline', label: 'Notification Settings', screen: null },
            { icon: 'lock-closed-outline', label: 'Privacy & Security', screen: null },
            { icon: 'help-circle-outline', label: 'Help & Support', screen: null },
            { icon: 'document-text-outline', label: 'Terms & Privacy', screen: null },
            { icon: 'information-circle-outline', label: 'About Disk Rider Live', screen: null },
          ].map(item => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuItem}
              onPress={() => { if (item.screen) navigation.navigate(item.screen); }}
            >
              <Ionicons name={item.icon as any} size={20} color="#6b7280" />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color="#4b5563" />
            </TouchableOpacity>
          ))}
        </Card>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Disk Rider Live v1.0.0 · iPad</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  content: { padding: 24, gap: 20 },
  profileHeader: { backgroundColor: '#ffffff08', borderRadius: 20, borderWidth: 1, borderColor: '#ffffff10', padding: 24, gap: 20 },
  profileLeft: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  profileInfo: { flex: 1, gap: 6 },
  name: { color: '#ffffff', fontSize: 24, fontWeight: '800' },
  email: { color: '#6b7280', fontSize: 14 },
  roleBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  roleText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  statsRow: { flexDirection: 'row', gap: 0 },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRightWidth: 1, borderRightColor: '#ffffff10' },
  statValue: { color: '#ffffff', fontSize: 20, fontWeight: '800' },
  statLabel: { color: '#6b7280', fontSize: 12, marginTop: 2 },
  sectionTitle: { color: '#ffffff60', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16 },
  actionsCard: { gap: 0 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionBtn: { width: '22%', alignItems: 'center', gap: 8, padding: 14, borderRadius: 14, borderWidth: 1, backgroundColor: '#ffffff04' },
  actionIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { color: '#ffffff80', fontSize: 12, fontWeight: '500', textAlign: 'center' },
  menuCard: { gap: 0, padding: 0 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#ffffff08' },
  menuLabel: { flex: 1, color: '#ffffff', fontSize: 15 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#ef444430', backgroundColor: '#ef444410' },
  logoutText: { color: '#ef4444', fontSize: 16, fontWeight: '600' },
  version: { color: '#4b5563', fontSize: 12, textAlign: 'center' },
});
