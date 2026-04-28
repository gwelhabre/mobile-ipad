import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { ProfileStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { deleteAccount } from '../../api/auth';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'DeleteAccount'>;

const DELETION_ITEMS = [
  'Your public profile and all personal information',
  'Follower and following relationships',
  'Earnings history and wallet balance',
  'Digital sets and uploaded content',
  'Event history and bookings',
];

export default function DeleteAccountScreen() {
  const navigation = useNavigation<Nav>();
  const { logout } = useAuth();

  const [password, setPassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleDeletePress = () => {
    setErrorMsg('');
    if (!password) {
      setErrorMsg('Please enter your password to confirm');
      return;
    }

    Alert.alert(
      'Are you absolutely sure?',
      'This action is permanent and cannot be undone. All your data will be erased immediately.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ],
    );
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteAccount(password);
      await logout();
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? 'Failed to delete account';
      setErrorMsg(msg);
      setDeleting(false);
    }
  };

  return (
    <View style={styles.container}>
      <PageHeader
        title="Delete Account"
        actions={[{
          element: (
            <Button
              label="Back"
              onPress={() => navigation.goBack()}
              variant="ghost"
              size="sm"
              icon="arrow-back"
            />
          ),
        }]}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {errorMsg ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        {/* Warning card */}
        <View style={styles.warningCard}>
          <View style={styles.warningHeader}>
            <Ionicons name="warning" size={28} color="#ef4444" />
            <Text style={styles.warningTitle}>This is permanent and cannot be undone</Text>
          </View>
          <Text style={styles.warningBody}>
            Deleting your account will permanently remove all of your data from Disk Rider Live.
            This action cannot be reversed.
          </Text>
        </View>

        {/* What will be deleted */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>What will be deleted</Text>
          {DELETION_ITEMS.map((item, idx) => (
            <View key={idx} style={styles.deleteItem}>
              <Ionicons name="close-circle-outline" size={18} color="#ef4444" />
              <Text style={styles.deleteItemText}>{item}</Text>
            </View>
          ))}
        </Card>

        {/* Confirmation */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Confirm with your password</Text>
          <Text style={styles.confirmSubtitle}>
            Enter your current password to confirm account deletion.
          </Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor="#4b5563"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <Button
            label="Delete My Account"
            onPress={handleDeletePress}
            loading={deleting}
            disabled={deleting || !password}
            variant="danger"
            size="lg"
            style={styles.deleteBtn}
          />
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  scrollContent: { padding: 20, gap: 16, paddingBottom: 40 },
  errorBanner: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  errorText: { color: '#f87171', fontSize: 14 },
  warningCard: {
    padding: 20,
    gap: 12,
    backgroundColor: '#2d0a0a',
    borderWidth: 1,
    borderColor: '#7f1d1d',
    borderRadius: 16,
  },
  warningHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  warningTitle: { color: '#fca5a5', fontSize: 16, fontWeight: '700', flex: 1 },
  warningBody: { color: 'rgba(252,165,165,0.6)', fontSize: 13, lineHeight: 20 },
  card: { padding: 20, gap: 14, maxWidth: 560, alignSelf: 'center', width: '100%' },
  sectionTitle: { color: '#f1f5f9', fontSize: 16, fontWeight: '700' },
  confirmSubtitle: { color: '#6b7280', fontSize: 13, lineHeight: 18, marginTop: -6 },
  deleteItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  deleteItemText: { color: '#94a3b8', fontSize: 14, flex: 1, lineHeight: 20 },
  fieldGroup: { gap: 6 },
  fieldLabel: { color: '#6b7280', fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
  input: {
    backgroundColor: '#1e1e2e',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: '#f1f5f9',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#2d2d3f',
  },
  deleteBtn: { marginTop: 4, alignSelf: 'stretch' },
});
