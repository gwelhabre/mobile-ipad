import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { LinearGradient } from 'expo-linear-gradient';
import { walletApi } from '../../api/wallet';
import type { RidesPackage } from '../../types';

export default function AddFundsScreen() {
  const navigation = useNavigation();
  const [packages, setPackages] = useState<RidesPackage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    walletApi.getPackages()
      .then((res) => {
        const items = res.data.packages ?? [];
        setPackages(items);
        if (items.length) setSelectedId(items[0].id);
      })
      .catch(() => Alert.alert('Error', 'Could not load Rides packages.'))
      .finally(() => setLoadingPackages(false));
  }, []);

  const selected = packages.find((p) => p.id === selectedId) ?? null;

  const handleCheckout = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      const res = await walletApi.createCheckout(selected.id);
      const returnUrl = Linking.createURL('wallet/topup-complete');
      const result = await WebBrowser.openAuthSessionAsync(res.data.url, returnUrl);
      if (result.type === 'success') {
        Alert.alert(
          'Top-up complete',
          `${selected.ridesAmount} Rides will appear once Whish confirms.`,
          [{ text: 'OK', onPress: () => navigation.goBack() }],
        );
      }
    } catch {
      Alert.alert('Error', 'Could not start Whish checkout. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#f1f5f9" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Funds</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.cardWrapper}>
          <LinearGradient
            colors={['rgba(124,58,237,0.3)', 'rgba(16,185,129,0.2)']}
            style={styles.headerCard}
          >
            <Text style={styles.headerCardLabel}>Buy Rides via Whish</Text>
            <Text style={styles.headerCardSub}>
              Rides are DiskRider&apos;s in-app currency for gifts and tips.
            </Text>
          </LinearGradient>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pick a Package</Text>
            {loadingPackages ? (
              <ActivityIndicator color="#a78bfa" />
            ) : packages.length === 0 ? (
              <Text style={styles.empty}>No packages available.</Text>
            ) : (
              <View style={styles.list}>
                {packages.map((pkg) => {
                  const active = pkg.id === selectedId;
                  return (
                    <TouchableOpacity
                      key={pkg.id}
                      style={[styles.pkgRow, active && styles.pkgRowActive]}
                      onPress={() => setSelectedId(pkg.id)}
                      activeOpacity={0.75}
                    >
                      <View style={styles.pkgLeft}>
                        <Ionicons name="diamond-outline" size={20} color={active ? '#fbbf24' : '#64748b'} />
                        <Text style={[styles.pkgAmount, active && styles.pkgAmountActive]}>
                          {pkg.ridesAmount.toLocaleString()} Rides
                        </Text>
                      </View>
                      <Text style={[styles.pkgPrice, active && styles.pkgPriceActive]}>
                        ${pkg.priceUsd.toFixed(2)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, (submitting || !selected) && styles.submitBtnDisabled]}
            onPress={handleCheckout}
            disabled={submitting || !selected}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="open-outline" size={20} color="#fff" />
                <Text style={styles.submitBtnText}>
                  {selected ? `Continue to Whish — $${selected.priceUsd.toFixed(2)}` : 'Pick a package'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.secureNote}>
            <Ionicons name="lock-closed" size={12} color="#475569" /> Payment is processed securely by Whish.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#1e1e2e', gap: 14,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#13131a', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#f1f5f9' },
  scrollContent: { flexGrow: 1, alignItems: 'center', padding: 40 },
  cardWrapper: { width: '100%', maxWidth: 520, gap: 20 },
  headerCard: { borderRadius: 16, padding: 24, alignItems: 'center', gap: 6 },
  headerCardLabel: { fontSize: 18, fontWeight: '800', color: '#f1f5f9' },
  headerCardSub: { fontSize: 13, color: 'rgba(241,245,249,0.7)', textAlign: 'center' },
  section: {
    backgroundColor: '#13131a', borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: '#1e1e2e',
  },
  sectionTitle: {
    fontSize: 14, fontWeight: '700', color: '#94a3b8',
    marginBottom: 14, letterSpacing: 0.3,
  },
  empty: { color: '#64748b', textAlign: 'center', paddingVertical: 16 },
  list: { gap: 10 },
  pkgRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#0a0a0f', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    borderWidth: 1.5, borderColor: '#1e1e2e',
  },
  pkgRowActive: { borderColor: '#7c3aed', backgroundColor: 'rgba(124,58,237,0.08)' },
  pkgLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pkgAmount: { color: '#94a3b8', fontSize: 16, fontWeight: '700' },
  pkgAmountActive: { color: '#f1f5f9' },
  pkgPrice: { color: '#94a3b8', fontSize: 14, fontWeight: '600' },
  pkgPriceActive: { color: '#a78bfa' },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: '#7c3aed', borderRadius: 14, height: 56,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },
  secureNote: { fontSize: 12, color: '#475569', textAlign: 'center' },
});
