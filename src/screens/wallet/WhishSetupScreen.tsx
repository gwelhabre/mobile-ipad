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
import { walletApi } from '../../api/wallet';

type Step = 'phone' | 'code' | 'done';

export default function WhishSetupScreen() {
  const navigation = useNavigation();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const startSetup = async () => {
    if (!/^\+[1-9]\d{6,14}$/.test(phone.trim())) {
      Alert.alert('Invalid phone', 'Use E.164 format, e.g. +9617XXXXXXX.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await walletApi.setupWhish(phone.trim());
      setVerificationId(res.data.verificationId);
      setDisplayName(res.data.displayName ?? null);
      setStep('code');
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error ?? 'Could not start verification.');
    } finally {
      setSubmitting(false);
    }
  };

  const verifyCode = async () => {
    if (!verificationId) return;
    setSubmitting(true);
    try {
      await walletApi.verifyWhish(verificationId, code.trim());
      setStep('done');
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error ?? 'Verification failed.');
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
        <Text style={styles.headerTitle}>Connect Whish</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.cardWrapper}>
          <View style={styles.heading}>
            <Ionicons name="phone-portrait-outline" size={32} color="#a78bfa" />
            <Text style={styles.title}>Connect Whish</Text>
            <Text style={styles.subtitle}>
              Verify the Whish account where you&apos;ll receive payouts.
            </Text>
          </View>

          {step === 'phone' && (
            <View style={styles.section}>
              <Text style={styles.label}>Whish phone number</Text>
              <TextInput
                style={styles.input}
                placeholder="+9617XXXXXXX"
                placeholderTextColor="#3d4460"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={styles.hint}>Use E.164 format with country code.</Text>
              <TouchableOpacity
                style={[styles.submitBtn, (submitting || !phone.trim()) && styles.submitBtnDisabled]}
                onPress={startSetup}
                disabled={submitting || !phone.trim()}
              >
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Send verification code</Text>}
              </TouchableOpacity>
            </View>
          )}

          {step === 'code' && (
            <View style={styles.section}>
              {displayName && (
                <View style={styles.lookupCard}>
                  <Text style={styles.lookupText}>
                    Verifying for <Text style={{ fontWeight: '700', color: '#f1f5f9' }}>{displayName}</Text>
                  </Text>
                </View>
              )}
              <Text style={styles.label}>Verification code</Text>
              <TextInput
                style={[styles.input, styles.codeInput]}
                placeholder="6-digit code"
                placeholderTextColor="#3d4460"
                value={code}
                onChangeText={(v) => setCode(v.replace(/\D/g, ''))}
                keyboardType="number-pad"
                maxLength={6}
              />
              <Text style={styles.hint}>Check the SMS sent to your Whish phone.</Text>
              <TouchableOpacity
                style={[styles.submitBtn, (submitting || code.length !== 6) && styles.submitBtnDisabled]}
                onPress={verifyCode}
                disabled={submitting || code.length !== 6}
              >
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Verify</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setStep('phone'); setCode(''); }}>
                <Text style={styles.changeLink}>Use a different number</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 'done' && (
            <View style={styles.doneSection}>
              <Ionicons name="shield-checkmark" size={48} color="#10b981" />
              <Text style={styles.doneTitle}>Whish account verified</Text>
              <Text style={styles.doneSub}>You can now receive payouts to {phone}.</Text>
              <TouchableOpacity style={styles.submitBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.submitBtnText}>Continue to payouts</Text>
              </TouchableOpacity>
            </View>
          )}
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
  heading: { alignItems: 'center', gap: 8 },
  title: { color: '#f1f5f9', fontSize: 22, fontWeight: '800' },
  subtitle: { color: '#94a3b8', fontSize: 13, textAlign: 'center', maxWidth: 360 },
  section: {
    backgroundColor: '#13131a', borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: '#1e1e2e', gap: 12,
  },
  label: { fontSize: 14, fontWeight: '700', color: '#94a3b8', letterSpacing: 0.3 },
  input: {
    backgroundColor: '#0a0a0f', borderRadius: 12,
    borderWidth: 1, borderColor: '#1e1e2e',
    color: '#f1f5f9', fontSize: 16,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  codeInput: { textAlign: 'center', letterSpacing: 6, fontSize: 22, fontWeight: '700' },
  hint: { color: '#64748b', fontSize: 12 },
  lookupCard: {
    backgroundColor: 'rgba(124,58,237,0.08)', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: 'rgba(124,58,237,0.2)',
  },
  lookupText: { color: '#94a3b8', fontSize: 13 },
  changeLink: { color: '#64748b', fontSize: 12, textAlign: 'center', paddingTop: 4 },
  doneSection: {
    alignItems: 'center', gap: 12, paddingVertical: 16,
    backgroundColor: '#13131a', borderRadius: 16, padding: 28,
    borderWidth: 1, borderColor: '#1e1e2e',
  },
  doneTitle: { color: '#bbf7d0', fontSize: 20, fontWeight: '700' },
  doneSub: { color: '#94a3b8', fontSize: 14, textAlign: 'center' },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#7c3aed', borderRadius: 14, height: 52,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
