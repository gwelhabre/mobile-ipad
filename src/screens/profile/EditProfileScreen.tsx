import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Image,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../api/auth';
import { djApi } from '../../api/dj';
import { DJProfile } from '../../types';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'EditProfile'>;

export default function EditProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { user, updateUser } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');

  // DJ fields
  const [djProfile, setDjProfile] = useState<DJProfile | null>(null);
  const [stageName, setStageName] = useState('');
  const [genres, setGenres] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [soundcloud, setSoundcloud] = useState('');
  const [spotify, setSpotify] = useState('');
  const [isBookableForPrivateEvents, setIsBookableForPrivateEvents] = useState(false);

  const [saving, setSaving] = useState(false);
  const [loadingDj, setLoadingDj] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const isDj = user?.role === 'dj';
  const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (navTimerRef.current) clearTimeout(navTimerRef.current);
  }, []);

  useEffect(() => {
    if (isDj) {
      setLoadingDj(true);
      djApi.getMyProfile()
        .then(response => {
          const profile: DJProfile = response.data?.data ?? response.data ?? response;
          setDjProfile(profile);
          setStageName((profile as any).stageName ?? profile.displayName ?? '');
          setGenres((profile.genres ?? []).join(', '));
          setCity(profile.city ?? '');
          setCountry(profile.country ?? '');
          const links = (profile as any).socialLinks ?? {};
          setInstagram(links.instagram ?? '');
          setTwitter(links.twitter ?? '');
          setSoundcloud(links.soundcloud ?? '');
          setSpotify(links.spotify ?? '');
          setIsBookableForPrivateEvents(Boolean((profile as any).isBookableForPrivateEvents));
          if (profile.avatarUrl) setAvatarUrl(profile.avatarUrl);
        })
        .catch(() => {})
        .finally(() => setLoadingDj(false));
    }
  }, [isDj]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const updatedUser = await updateProfile({
        displayName,
        avatarUrl: avatarUrl || undefined,
        bio: bio || undefined,
      });

      if (isDj) {
        const genreList = genres
          .split(',')
          .map(g => g.trim())
          .filter(Boolean);

        await djApi.updateMyProfile({
          stageName,
          bio,
          genres: genreList,
          city,
          country,
          avatarUrl: avatarUrl || undefined,
          socialLinks: {
            instagram: instagram || undefined,
            twitter: twitter || undefined,
            soundcloud: soundcloud || undefined,
            spotify: spotify || undefined,
          },
          isBookableForPrivateEvents,
        });
      }

      updateUser({
        ...user,
        displayName: updatedUser?.displayName ?? updatedUser?.displayName ?? displayName,
        avatarUrl: avatarUrl || user.avatarUrl,
        bio: bio || user.bio,
      });

      setSuccessMsg('Profile updated successfully');
      navTimerRef.current = setTimeout(() => navigation.goBack(), 1200);
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? 'Failed to update profile';
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  const avatarPreview = avatarUrl ? { uri: avatarUrl } : null;

  return (
    <View style={styles.container}>
      <PageHeader
        title="Edit Profile"
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
        {successMsg ? (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>{successMsg}</Text>
          </View>
        ) : null}
        {errorMsg ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        <View style={styles.twoCol}>
          <View style={styles.leftCol}>
            <Card style={styles.avatarCard}>
              <View style={styles.avatarCircle}>
                {avatarPreview ? (
                  <Image source={avatarPreview} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarPlaceholder}>
                    {(displayName || user?.email || '?')[0].toUpperCase()}
                  </Text>
                )}
              </View>
              <Text style={styles.fieldLabel}>Avatar URL</Text>
              <TextInput
                style={styles.input}
                value={avatarUrl}
                onChangeText={setAvatarUrl}
                placeholder="https://..."
                placeholderTextColor="#4b5563"
                autoCapitalize="none"
                keyboardType="url"
              />
            </Card>
          </View>

          <View style={styles.rightCol}>
            <Card style={styles.card}>
              <Text style={styles.sectionTitle}>Basic Info</Text>

              <Text style={styles.fieldLabel}>Display Name</Text>
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Your name"
                placeholderTextColor="#4b5563"
              />

              <Text style={styles.fieldLabel}>Bio</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={bio}
                onChangeText={setBio}
                placeholder="Tell us about yourself..."
                placeholderTextColor="#4b5563"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </Card>

            {isDj && (
              <>
                {loadingDj ? (
                  <Card style={styles.card}>
                    <ActivityIndicator color="#a855f7" size="small" />
                  </Card>
                ) : (
                  <>
                    <Card style={styles.card}>
                      <Text style={styles.sectionTitle}>DJ Profile</Text>

                      <Text style={styles.fieldLabel}>Stage Name</Text>
                      <TextInput
                        style={styles.input}
                        value={stageName}
                        onChangeText={setStageName}
                        placeholder="Your DJ name"
                        placeholderTextColor="#4b5563"
                      />

                      <Text style={styles.fieldLabel}>Genres (comma separated)</Text>
                      <TextInput
                        style={styles.input}
                        value={genres}
                        onChangeText={setGenres}
                        placeholder="House, Techno, Drum & Bass"
                        placeholderTextColor="#4b5563"
                      />

                      <Text style={styles.fieldLabel}>City</Text>
                      <TextInput
                        style={styles.input}
                        value={city}
                        onChangeText={setCity}
                        placeholder="Base city"
                        placeholderTextColor="#4b5563"
                      />

                      <Text style={styles.fieldLabel}>Country</Text>
                      <TextInput
                        style={styles.input}
                        value={country}
                        onChangeText={setCountry}
                        placeholder="Country"
                        placeholderTextColor="#4b5563"
                      />

                      <View style={styles.switchRow}>
                        <View style={styles.switchText}>
                          <Text style={styles.switchTitle}>Bookable for private events</Text>
                          <Text style={styles.switchSubtitle}>
                            {isBookableForPrivateEvents ? 'Shown on your public profile' : 'Hidden from your public profile'}
                          </Text>
                        </View>
                        <Switch
                          value={isBookableForPrivateEvents}
                          onValueChange={setIsBookableForPrivateEvents}
                          trackColor={{ false: '#374151', true: '#065f46' }}
                          thumbColor={isBookableForPrivateEvents ? '#10b981' : '#9ca3af'}
                        />
                      </View>
                    </Card>

                    <Card style={styles.card}>
                      <Text style={styles.sectionTitle}>Social Links</Text>

                      <Text style={styles.fieldLabel}>Instagram</Text>
                      <TextInput
                        style={styles.input}
                        value={instagram}
                        onChangeText={setInstagram}
                        placeholder="https://instagram.com/..."
                        placeholderTextColor="#4b5563"
                        autoCapitalize="none"
                        keyboardType="url"
                      />

                      <Text style={styles.fieldLabel}>SoundCloud</Text>
                      <TextInput
                        style={styles.input}
                        value={soundcloud}
                        onChangeText={setSoundcloud}
                        placeholder="https://soundcloud.com/..."
                        placeholderTextColor="#4b5563"
                        autoCapitalize="none"
                        keyboardType="url"
                      />

                      <Text style={styles.fieldLabel}>Spotify</Text>
                      <TextInput
                        style={styles.input}
                        value={spotify}
                        onChangeText={setSpotify}
                        placeholder="https://open.spotify.com/artist/..."
                        placeholderTextColor="#4b5563"
                        autoCapitalize="none"
                        keyboardType="url"
                      />

                      <Text style={styles.fieldLabel}>Twitter / X</Text>
                      <TextInput
                        style={styles.input}
                        value={twitter}
                        onChangeText={setTwitter}
                        placeholder="https://twitter.com/..."
                        placeholderTextColor="#4b5563"
                        autoCapitalize="none"
                        keyboardType="url"
                      />
                    </Card>
                  </>
                )}
              </>
            )}

            <Button
              label="Save Changes"
              onPress={handleSave}
              loading={saving}
              disabled={saving}
              size="lg"
              style={styles.saveBtn}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  scrollContent: { padding: 20, gap: 16, paddingBottom: 40 },
  twoCol: { flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  leftCol: { width: 240 },
  rightCol: { flex: 1, gap: 16 },
  successBanner: {
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
  },
  successText: { color: '#34d399', fontSize: 14, fontWeight: '600' },
  errorBanner: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  errorText: { color: '#f87171', fontSize: 14 },
  avatarCard: { padding: 20, alignItems: 'center', gap: 16 },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1e1e2e',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#a855f7',
  },
  avatarImage: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: { color: '#a855f7', fontSize: 36, fontWeight: '700' },
  card: { padding: 20, gap: 12 },
  sectionTitle: { color: '#f1f5f9', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  fieldLabel: { color: '#6b7280', fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
  input: {
    backgroundColor: '#1e1e2e',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#f1f5f9',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#2d2d3f',
  },
  multilineInput: { height: 96, paddingTop: 12 },
  switchRow: {
    marginTop: 10,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#2d2d3f',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  switchText: { flex: 1 },
  switchTitle: { color: '#f1f5f9', fontSize: 14, fontWeight: '700' },
  switchSubtitle: { color: '#6b7280', fontSize: 12, marginTop: 3 },
  saveBtn: { marginTop: 4, alignSelf: 'stretch' },
});
