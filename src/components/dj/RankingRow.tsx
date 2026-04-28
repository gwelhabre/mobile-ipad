import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RankingEntry } from '../../types';

interface RankingRowProps {
  entry: RankingEntry;
  onPress?: () => void;
}

export default function RankingRow({ entry, onPress }: RankingRowProps) {
  const rank = Number.isFinite(entry.rank) ? entry.rank : 0;
  const stageName = entry.stageName?.trim() || (rank > 0 ? `DJ #${rank}` : 'Ranked DJ');
  const score = Number.isFinite(entry.score) ? entry.score : 0;
  const followersCount = Number.isFinite(entry.followersCount) ? entry.followersCount : 0;
  const rankColor = rank === 1 ? '#f59e0b' : rank === 2 ? '#94a3b8' : rank === 3 ? '#cd7c2f' : '#64748b';
  const change = entry.change ?? 0;
  const trendIcon = change > 0 ? 'trending-up' : change < 0 ? 'trending-down' : 'remove';
  const trendColor = change > 0 ? '#10b981' : change < 0 ? '#ef4444' : '#64748b';

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.rankCell}>
        <Text style={[styles.rank, { color: rankColor }]}>
          {rank > 0 && rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : `#${rank || '-'}`}
        </Text>
      </View>

      <View style={styles.changeCell}>
        <Ionicons name={trendIcon} size={16} color={trendColor} />
        {change !== 0 && (
          <Text style={[styles.changeText, { color: trendColor }]}>
            {Math.abs(change)}
          </Text>
        )}
      </View>

      <View style={styles.djCell}>
        {entry.avatar ? (
          <Image source={{ uri: entry.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>{stageName.charAt(0)}</Text>
          </View>
        )}
        <View style={styles.djInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.djName}>{stageName}</Text>
            {entry.isVerified && <Ionicons name="checkmark-circle" size={14} color="#7c3aed" />}
          </View>
          {entry.username ? <Text style={styles.username}>@{entry.username}</Text> : null}
        </View>
      </View>

      <View style={styles.scoreCell}>
        <Text style={styles.score}>{score.toLocaleString()}</Text>
      </View>

      <View style={styles.genreCell}>
        <Text style={styles.genre}>{entry.genre || '-'}</Text>
      </View>

      <View style={styles.cityCell}>
        <Text style={styles.city}>{entry.city || '-'}</Text>
      </View>

      <View style={styles.followersCell}>
        <Text style={styles.followers}>
          {followersCount >= 1000
            ? `${(followersCount / 1000).toFixed(1)}k`
            : followersCount}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2e',
  },
  rankCell: { width: 56, alignItems: 'center' },
  changeCell: { width: 52, flexDirection: 'row', alignItems: 'center', gap: 2 },
  djCell: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  scoreCell: { width: 90, alignItems: 'flex-end' },
  genreCell: { width: 100, paddingLeft: 16 },
  cityCell: { width: 110, paddingLeft: 16 },
  followersCell: { width: 80, alignItems: 'flex-end' },
  rank: {
    fontSize: 15,
    fontWeight: '800',
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: '#7c3aed',
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarInitial: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  djInfo: {},
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  djName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f1f5f9',
  },
  username: {
    fontSize: 12,
    color: '#64748b',
  },
  score: {
    fontSize: 14,
    fontWeight: '700',
    color: '#a78bfa',
  },
  genre: {
    fontSize: 13,
    color: '#94a3b8',
  },
  city: {
    fontSize: 13,
    color: '#94a3b8',
  },
  followers: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
  },
});
