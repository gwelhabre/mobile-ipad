import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { AuthStackParamList, UserRole } from '../../types';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Signup'>;

const ROLES: { value: UserRole; label: string; icon: keyof typeof Ionicons.glyphMap; description: string }[] = [
  { value: 'fan', label: 'Fan', icon: 'heart', description: 'Discover and follow DJs' },
  { value: 'dj', label: 'DJ', icon: 'musical-notes', description: 'Stream and earn' },
  { value: 'venue_manager', label: 'Venue Manager', icon: 'business', description: 'Manage your venue & book DJs' },
];

export default function SignupScreen() {
  const navigation = useNavigation<Nav>();
  const { signup } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('fan');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!displayName.trim() || !username.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Weak Password', 'Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await signup({ displayName: displayName.trim(), username: username.trim(), email: email.trim(), password, role });
    } catch (error: any) {
      Alert.alert(
        'Signup Failed',
        error?.response?.data?.message || 'Could not create account. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const renderField = (label: string, value: string, onChangeText: (t: string) => void, opts?: {
    placeholder?: string; keyboardType?: any; autoCapitalize?: any; secureTextEntry?: boolean; icon?: keyof typeof Ionicons.glyphMap;
  }) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        {opts?.icon && <Ionicons name={opts.icon} size={16} color="#64748b" style={styles.inputIcon} />}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={opts?.placeholder || label}
          placeholderTextColor="#3d4460"
          keyboardType={opts?.keyboardType}
          autoCapitalize={opts?.autoCapitalize || 'sentences'}
          autoCorrect={false}
          secureTextEntry={opts?.secureTextEntry && !showPassword}
        />
        {opts?.secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={16} color="#64748b" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#0d0d1a', '#0a0a0f', '#0d0a1a']} style={styles.gradient}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.splitLayout}>
            {/* Left panel — branding */}
            <LinearGradient colors={['#1a0a2e', '#0f0f1a']} style={styles.leftPanel}>
              <View style={styles.leftContent}>
                <View style={styles.logoIcon}>
                  <Ionicons name="disc" size={40} color="#a78bfa" />
                </View>
                <Text style={styles.logoTitle}>Disk Rider</Text>
                <Text style={styles.logoSub}>LIVE</Text>
                <Text style={styles.leftTagline}>
                  The ultimate DJ platform for performance, booking and monetization.
                </Text>
                <View style={styles.featureList}>
                  {['Live streaming to fans', 'Virtual gifts & tips', 'Venue booking & deals', 'Rankings & competitions', 'Marketplace for sets'].map((feature) => (
                    <View key={feature} style={styles.featureItem}>
                      <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </LinearGradient>

            {/* Right panel — form */}
            <View style={styles.rightPanel}>
              <Text style={styles.heading}>Create Account</Text>
              <Text style={styles.subheading}>Join thousands of DJs and fans on Disk Rider Live</Text>

              {/* Role Selector */}
              <Text style={styles.fieldLabel}>I am a...</Text>
              <View style={styles.roleRow}>
                {ROLES.map((r) => (
                  <TouchableOpacity
                    key={r.value}
                    style={[styles.roleCard, role === r.value && styles.roleCardActive]}
                    onPress={() => setRole(r.value)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name={r.icon} size={22} color={role === r.value ? '#a78bfa' : '#64748b'} />
                    <Text style={[styles.roleLabel, role === r.value && styles.roleLabelActive]}>{r.label}</Text>
                    <Text style={styles.roleDesc}>{r.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {renderField('Display Name', displayName, setDisplayName, { icon: 'person-outline', placeholder: 'Your stage name', autoCapitalize: 'words' })}
              {renderField('Username', username, setUsername, { icon: 'at-outline', placeholder: 'yourusername', autoCapitalize: 'none' })}
              {renderField('Email Address', email, setEmail, { icon: 'mail-outline', placeholder: 'you@example.com', keyboardType: 'email-address', autoCapitalize: 'none' })}
              {renderField('Password', password, setPassword, { icon: 'lock-closed-outline', placeholder: 'Min 8 characters', secureTextEntry: true })}

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleSignup}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.submitText}>Create Account</Text>
                    <Ionicons name="arrow-forward" size={18} color="#fff" />
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.loginRow}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  splitLayout: {
    flex: 1,
    flexDirection: 'row',
    minHeight: 700,
  },
  leftPanel: {
    flex: 2,
    justifyContent: 'center',
    padding: 52,
  },
  leftContent: {
    maxWidth: 380,
  },
  logoIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: 'rgba(124,58,237,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.3)',
  },
  logoTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#f1f5f9',
    letterSpacing: -1,
  },
  logoSub: {
    fontSize: 14,
    fontWeight: '700',
    color: '#a78bfa',
    letterSpacing: 4,
    marginBottom: 20,
  },
  leftTagline: {
    fontSize: 15,
    color: '#64748b',
    lineHeight: 24,
    marginBottom: 28,
  },
  featureList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
  rightPanel: {
    flex: 3,
    padding: 52,
    paddingTop: 60,
    justifyContent: 'center',
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: '#f1f5f9',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subheading: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 28,
    lineHeight: 20,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },
  roleCard: {
    flex: 1,
    backgroundColor: '#13131a',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e1e2e',
    alignItems: 'center',
  },
  roleCardActive: {
    borderColor: '#7c3aed',
    backgroundColor: 'rgba(124,58,237,0.1)',
  },
  roleLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94a3b8',
    marginTop: 6,
    marginBottom: 3,
  },
  roleLabelActive: {
    color: '#a78bfa',
  },
  roleDesc: {
    fontSize: 10,
    color: '#475569',
    textAlign: 'center',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 7,
    letterSpacing: 0.3,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0a0f',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e1e2e',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 14,
    color: '#f1f5f9',
  },
  eyeBtn: {
    padding: 4,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    height: 50,
    gap: 8,
    marginTop: 8,
    marginBottom: 20,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#64748b',
  },
  loginLink: {
    fontSize: 14,
    color: '#a78bfa',
    fontWeight: '700',
  },
});
