import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../types';
import client from '../../api/client';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'BlockedUsers'>;

export default function BlockedUsersScreen() {
  const navigation = useNavigation<Nav>();
  const [loading, setLoading] = useState(true);
  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchBlocked = async () => {
      try {
        const { data } = await client.get('/users/me/blocked');
        setBlockedUsers(Array.isArray(data) ? data : []);
      } catch {
        // 404 or error → treat as empty list
        setBlockedUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBlocked();
  }, []);

  return (
    <View style={styles.container}>
      <PageHeader
        title="Blocked Users"
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

      {loading ? (
        <LoadingSpinner fullScreen />
      ) : (
        <EmptyState
          icon="person-remove-outline"
          title="No blocked users"
          subtitle="Users you block will appear here."
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
});
