import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import PageHeader from '../../components/layout/PageHeader';
import SplitView from '../../components/layout/SplitView';
import Card from '../../components/common/Card';

type Category = { id: string; label: string; icon: string };

const CATEGORIES: Category[] = [
  { id: 'account', label: 'Account', icon: 'person-outline' },
  { id: 'notifications', label: 'Notifications', icon: 'notifications-outline' },
  { id: 'privacy', label: 'Privacy', icon: 'lock-closed-outline' },
  { id: 'appearance', label: 'Appearance', icon: 'color-palette-outline' },
  { id: 'about', label: 'About', icon: 'information-circle-outline' },
];

type SettingItem =
  | { type: 'toggle'; label: string; key: string; description?: string }
  | { type: 'nav'; label: string; description?: string }
  | { type: 'info'; label: string; value: string };

const SETTINGS: Record<string, SettingItem[]> = {
  account: [
    { type: 'nav', label: 'Edit Profile', description: 'Update your name, bio, and profile picture' },
    { type: 'nav', label: 'Change Password', description: 'Update your account password' },
    { type: 'nav', label: 'Connected Accounts', description: 'Manage social logins' },
    { type: 'nav', label: 'Delete Account', description: 'Permanently delete your account and data' },
  ],
  notifications: [
    { type: 'toggle', label: 'Push Notifications', key: 'push', description: 'Receive push notifications' },
    { type: 'toggle', label: 'Gift Notifications', key: 'gifts', description: 'When someone sends you a gift' },
    { type: 'toggle', label: 'Follow Notifications', key: 'follows', description: 'When someone follows you' },
    { type: 'toggle', label: 'Booking Notifications', key: 'bookings', description: 'Booking inquiries and updates' },
    { type: 'toggle', label: 'Wallet Notifications', key: 'wallet', description: 'Payments, payouts, top-ups' },
    { type: 'toggle', label: 'Event Reminders', key: 'events', description: 'Reminders for upcoming events' },
    { type: 'toggle', label: 'Marketing Emails', key: 'marketing', description: 'News, updates, and promotions' },
  ],
  privacy: [
    { type: 'toggle', label: 'Public Profile', key: 'public', description: 'Allow anyone to view your profile' },
    { type: 'toggle', label: 'Show Wallet Balance', key: 'showBalance', description: 'Display earnings on profile' },
    { type: 'toggle', label: 'Anonymous Gifts', key: 'anonGifts', description: 'Allow anonymous gift sending' },
    { type: 'nav', label: 'Blocked Users', description: 'Manage your blocked list' },
    { type: 'nav', label: 'Download My Data', description: 'Export all your data' },
  ],
  appearance: [
    { type: 'toggle', label: 'Dark Mode', key: 'dark', description: 'Use dark theme (always on)' },
    { type: 'toggle', label: 'Reduced Motion', key: 'reducedMotion', description: 'Reduce animations' },
    { type: 'toggle', label: 'Compact Layout', key: 'compact', description: 'Show more content per screen' },
  ],
  about: [
    { type: 'info', label: 'Version', value: '1.0.0' },
    { type: 'info', label: 'Build', value: '2026.03.20' },
    { type: 'info', label: 'Platform', value: 'iPad' },
    { type: 'nav', label: 'Terms of Service' },
    { type: 'nav', label: 'Privacy Policy' },
    { type: 'nav', label: 'Open Source Licenses' },
    { type: 'nav', label: 'Contact Support' },
  ],
};

// Map nav-type setting labels to their screen names
const NAV_SCREEN_MAP: Record<string, string> = {
  'Edit Profile': 'EditProfile',
  'Change Password': 'ChangePassword',
  'Delete Account': 'DeleteAccount',
  'Blocked Users': 'BlockedUsers',
};

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const [selected, setSelected] = useState('account');
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    push: true, gifts: true, follows: true, bookings: true,
    wallet: true, events: true, marketing: false,
    public: true, showBalance: false, anonGifts: true,
    dark: true, reducedMotion: false, compact: false,
  });

  const items = SETTINGS[selected] ?? [];

  const leftContent = (
    <ScrollView style={styles.leftPane} contentContainerStyle={styles.leftContent}>
      <Text style={styles.leftTitle}>Settings</Text>
      {CATEGORIES.map(cat => (
        <TouchableOpacity
          key={cat.id}
          style={[styles.categoryItem, selected === cat.id && styles.categoryItemActive]}
          onPress={() => setSelected(cat.id)}
        >
          <View style={[styles.categoryIcon, selected === cat.id && styles.categoryIconActive]}>
            <Ionicons name={cat.icon as any} size={18} color={selected === cat.id ? '#a855f7' : '#6b7280'} />
          </View>
          <Text style={[styles.categoryLabel, selected === cat.id && styles.categoryLabelActive]}>
            {cat.label}
          </Text>
          {selected === cat.id && <Ionicons name="chevron-forward" size={14} color="#a855f7" />}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const rightContent = (
    <ScrollView style={styles.rightPane} contentContainerStyle={styles.rightContent}>
      <Text style={styles.rightTitle}>{CATEGORIES.find(c => c.id === selected)?.label}</Text>
      <Card style={styles.settingsCard}>
        {items.map((item, idx) => (
          <View key={idx} style={[styles.settingItem, idx < items.length - 1 && styles.settingBorder]}>
            {item.type === 'toggle' ? (
              <>
                <View style={styles.settingLeft}>
                  <Text style={styles.settingLabel}>{item.label}</Text>
                  {item.description && <Text style={styles.settingDesc}>{item.description}</Text>}
                </View>
                <Switch
                  value={toggles[item.key] ?? false}
                  onValueChange={v => setToggles(prev => ({ ...prev, [item.key]: v }))}
                  trackColor={{ false: '#374151', true: '#a855f7' }}
                  thumbColor="#ffffff"
                />
              </>
            ) : item.type === 'info' ? (
              <>
                <Text style={styles.settingLabel}>{item.label}</Text>
                <Text style={styles.infoValue}>{item.value}</Text>
              </>
            ) : (
              <TouchableOpacity
                style={styles.navRow}
                activeOpacity={0.7}
                onPress={() => {
                  const screen = NAV_SCREEN_MAP[item.label];
                  if (screen) navigation.navigate(screen);
                }}
              >
                <View style={styles.settingLeft}>
                  <Text style={styles.settingLabel}>{item.label}</Text>
                  {item.description && <Text style={styles.settingDesc}>{item.description}</Text>}
                </View>
                <Ionicons name="chevron-forward" size={16} color="#4b5563" />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </Card>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <PageHeader title="Settings" />
      <SplitView leftContent={leftContent} rightContent={rightContent} leftFlex={1} rightFlex={2} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  leftPane: { flex: 1 },
  leftContent: { padding: 20, gap: 4 },
  leftTitle: { color: '#6b7280', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  categoryItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12 },
  categoryItemActive: { backgroundColor: '#a855f715' },
  categoryIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#ffffff08', alignItems: 'center', justifyContent: 'center' },
  categoryIconActive: { backgroundColor: '#a855f720' },
  categoryLabel: { flex: 1, color: '#9ca3af', fontSize: 15, fontWeight: '500' },
  categoryLabelActive: { color: '#a855f7', fontWeight: '600' },
  rightPane: { flex: 1, borderLeftWidth: 1, borderLeftColor: '#ffffff10' },
  rightContent: { padding: 24, gap: 16 },
  rightTitle: { color: '#ffffff', fontSize: 20, fontWeight: '700', marginBottom: 4 },
  settingsCard: { padding: 0 },
  settingItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  settingBorder: { borderBottomWidth: 1, borderBottomColor: '#ffffff08' },
  settingLeft: { flex: 1 },
  settingLabel: { color: '#ffffff', fontSize: 15, fontWeight: '500' },
  settingDesc: { color: '#6b7280', fontSize: 12, marginTop: 2 },
  infoValue: { color: '#6b7280', fontSize: 14 },
  navRow: { flex: 1, flexDirection: 'row', alignItems: 'center' },
});
