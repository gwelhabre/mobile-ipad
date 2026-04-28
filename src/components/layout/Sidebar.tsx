import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { DrawerContentComponentProps, DrawerContentScrollView } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const PURPLE = '#7c3aed';
const PURPLE_LIGHT = '#a78bfa';
const EMERALD = '#10b981';
const BG = '#0a0a0f';
const SURFACE = '#13131a';
const BORDER = '#1e1e2e';
const TEXT = '#f1f5f9';
const MUTED = '#64748b';

interface NavItem {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  route: string;
}

const MAIN_ITEMS: NavItem[] = [
  { label: 'Home', icon: 'home-outline', iconActive: 'home', route: 'HomeStack' },
  { label: 'Live', icon: 'radio-outline', iconActive: 'radio', route: 'LiveStack' },
  { label: 'Rankings', icon: 'trophy-outline', iconActive: 'trophy', route: 'RankingsStack' },
  { label: 'Discover', icon: 'compass-outline', iconActive: 'compass', route: 'DiscoverStack' },
];

const COMMERCE_ITEMS: NavItem[] = [
  { label: 'Wallet', icon: 'wallet-outline', iconActive: 'wallet', route: 'WalletStack' },
  { label: 'Marketplace', icon: 'storefront-outline', iconActive: 'storefront', route: 'MarketplaceStack' },
];

const COMMUNITY_ITEMS: NavItem[] = [
  { label: 'Forum', icon: 'chatbubbles-outline', iconActive: 'chatbubbles', route: 'CommunityStack' },
  { label: 'Blog', icon: 'newspaper-outline', iconActive: 'newspaper', route: 'CommunityStack' },
  { label: 'Competitions', icon: 'ribbon-outline', iconActive: 'ribbon', route: 'CompetitionsStack' },
];

const ACCOUNT_ITEMS: NavItem[] = [
  { label: 'Notifications', icon: 'notifications-outline', iconActive: 'notifications', route: 'NotificationsStack' },
  { label: 'Profile', icon: 'person-outline', iconActive: 'person', route: 'ProfileStack' },
  { label: 'Settings', icon: 'settings-outline', iconActive: 'settings', route: 'ProfileStack' },
];

export default function Sidebar(props: DrawerContentComponentProps) {
  const { user, logout } = useAuth();
  const { navigation, state } = props;

  const activeRouteName = state.routeNames[state.index];

  const navigateTo = (route: string) => {
    navigation.navigate(route);
  };

  const isActive = (route: string) => activeRouteName === route;

  const renderItem = (item: NavItem) => {
    const active = isActive(item.route);
    return (
      <TouchableOpacity
        key={item.label}
        style={[styles.navItem, active && styles.navItemActive]}
        onPress={() => navigateTo(item.route)}
        activeOpacity={0.7}
      >
        {active && (
          <View style={styles.activeAccent} />
        )}
        <Ionicons
          name={active ? item.iconActive : item.icon}
          size={20}
          color={active ? PURPLE_LIGHT : MUTED}
          style={styles.navIcon}
        />
        <Text style={[styles.navLabel, active && styles.navLabelActive]}>
          {item.label}
        </Text>
        {item.label === 'Live' && (
          <View style={styles.liveIndicator}>
            <Text style={styles.liveIndicatorText}>LIVE</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderSection = (title: string, items: NavItem[]) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map(renderItem)}
    </View>
  );

  const mySpaceItems: NavItem[] = [];
  if (user?.role === 'dj') {
    mySpaceItems.push({ label: 'DJ Dashboard', icon: 'musical-notes-outline', iconActive: 'musical-notes', route: 'DJStack' });
  }
  if (user?.role === 'venue_manager') {
    mySpaceItems.push({ label: 'Venue Dashboard', icon: 'business-outline', iconActive: 'business', route: 'VenueStack' });
  }
  if (user?.role === 'admin') {
    mySpaceItems.push({ label: 'Admin Panel', icon: 'shield-outline', iconActive: 'shield', route: 'HomeStack' });
  }

  return (
    <View style={styles.container}>
      {/* Logo Area */}
      <LinearGradient
        colors={['#1a0a2e', '#0a0a0f']}
        style={styles.logoArea}
      >
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <Ionicons name="disc" size={28} color={PURPLE_LIGHT} />
          </View>
          <View>
            <Text style={styles.logoText}>Disk Rider</Text>
            <Text style={styles.logoSubtext}>Live</Text>
          </View>
        </View>

        {/* User info */}
        {user && (
          <View style={styles.userRow}>
            <View style={styles.avatarContainer}>
              {user.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>
                    {user.displayName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.onlineDot} />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName} numberOfLines={1}>{user.displayName}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{user.role.replace('_', ' ').toUpperCase()}</Text>
              </View>
            </View>
          </View>
        )}
      </LinearGradient>

      {/* Navigation */}
      <ScrollView
        style={styles.navScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.navScrollContent}
      >
        {renderSection('MAIN', MAIN_ITEMS)}
        {renderSection('COMMERCE', COMMERCE_ITEMS)}
        {renderSection('COMMUNITY', COMMUNITY_ITEMS)}
        {mySpaceItems.length > 0 && renderSection('MY SPACE', mySpaceItems)}
        {renderSection('ACCOUNT', ACCOUNT_ITEMS)}
      </ScrollView>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.7}>
        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    borderRightWidth: 1,
    borderRightColor: BORDER,
  },
  logoArea: {
    paddingTop: 52,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(124,58,237,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.4)',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '800',
    color: TEXT,
    letterSpacing: -0.5,
  },
  logoSubtext: {
    fontSize: 12,
    fontWeight: '600',
    color: PURPLE_LIGHT,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: PURPLE,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: EMERALD,
    borderWidth: 2,
    borderColor: BG,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT,
    marginBottom: 4,
  },
  roleBadge: {
    backgroundColor: 'rgba(124,58,237,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.3)',
  },
  roleText: {
    fontSize: 9,
    fontWeight: '700',
    color: PURPLE_LIGHT,
    letterSpacing: 0.5,
  },
  navScroll: {
    flex: 1,
  },
  navScrollContent: {
    paddingVertical: 12,
  },
  section: {
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: MUTED,
    letterSpacing: 1.5,
    marginBottom: 4,
    marginTop: 8,
    marginLeft: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 10,
    marginBottom: 2,
    position: 'relative',
  },
  navItemActive: {
    backgroundColor: 'rgba(124,58,237,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.25)',
  },
  activeAccent: {
    position: 'absolute',
    left: 0,
    top: '20%',
    bottom: '20%',
    width: 3,
    backgroundColor: PURPLE_LIGHT,
    borderRadius: 2,
  },
  navIcon: {
    marginRight: 12,
    width: 20,
    textAlign: 'center',
  },
  navLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: MUTED,
    flex: 1,
  },
  navLabelActive: {
    color: TEXT,
    fontWeight: '600',
  },
  liveIndicator: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveIndicatorText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
    marginLeft: 12,
  },
});
