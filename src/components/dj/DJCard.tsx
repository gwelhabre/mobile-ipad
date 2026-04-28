import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DJProfile } from '../../types';
import Badge from '../common/Badge';

interface DJCardProps {
  dj: DJProfile;
  onPress: () => void;
}

export default function DJCard({ dj, onPress }: DJCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {/* Avatar / Cover */}
      <View style={styles.avatarArea}>
        {dj.avatarUrl ? (
          <Image source={{ uri: dj.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="musical-notes" size={28} color="#7c3aed" />
          </View>
        )}
        {dj.isLive && (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
        {dj.isVerified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={18} color="#7c3aed" />
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{dj.displayName}</Text>
        <Text style={styles.username} numberOfLines={1}>@{dj.username}</Text>

        {/* Genre tags */}
        <View style={styles.genres}>
          {dj.genres.slice(0, 2).map((genre) => (
            <Badge key={genre} label={genre} variant="purple" size="sm" style={styles.genreBadge} />
          ))}
          {dj.isBookableForPrivateEvents && (
            <Badge label="Private events" variant="emerald" size="sm" style={styles.genreBadge} />
          )}
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="trophy" size={12} color="#f59e0b" />
            <Text style={styles.statText}>#{dj.rank}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="people" size={12} color="#64748b" />
            <Text style={styles.statText}>{(dj.followersCount / 1000).toFixed(1)}k</Text>
          </View>
          {dj.city && (
            <View style={styles.stat}>
              <Ionicons name="location" size={12} color="#64748b" />
              <Text style={styles.statText} numberOfLines={1}>{dj.city}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#13131a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e1e2e',
    overflow: 'hidden',
    margin: 6,
  },
  avatarArea: {
    position: 'relative',
    height: 140,
    backgroundColor: '#1e1e2e',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(124,58,237,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  verifiedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
  },
  info: {
    padding: 14,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: 2,
  },
  username: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  genres: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 10,
  },
  genreBadge: {
    marginRight: 0,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
});
