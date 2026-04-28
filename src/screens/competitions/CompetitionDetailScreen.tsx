import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Avatar from '../../components/common/Avatar';
import SplitView from '../../components/layout/SplitView';

type RouteParams = { id: string };

const MOCK_DETAIL = {
  id: '1',
  name: 'Summer Beatdown 2026',
  format: 'battle',
  status: 'active',
  prize: '$5,000',
  startDate: '2026-06-01',
  endDate: '2026-06-30',
  entryCount: 32,
  maxEntries: 64,
  description: 'The hottest summer DJ battle. Show the world what you\'ve got. Compete across multiple rounds judged by crowd reaction and panel scores.',
  leaderboard: [
    { rank: 1, name: 'DJ Pulse', stageName: 'DJ Pulse', score: 9850, votes: 12400, trend: 'up' },
    { rank: 2, name: 'VoltMaster', stageName: 'VoltMaster', score: 9720, votes: 11800, trend: 'up' },
    { rank: 3, name: 'Neon Rider', stageName: 'Neon Rider', score: 9540, votes: 10900, trend: 'down' },
    { rank: 4, name: 'BeatCraft', stageName: 'BeatCraft', score: 9200, votes: 9600, trend: 'same' },
    { rank: 5, name: 'SubZero', stageName: 'SubZero', score: 8980, votes: 8900, trend: 'up' },
    { rank: 6, name: 'Echo Drive', stageName: 'Echo Drive', score: 8750, votes: 8200, trend: 'down' },
    { rank: 7, name: 'Frequency X', stageName: 'Frequency X', score: 8500, votes: 7800, trend: 'same' },
    { rank: 8, name: 'WaveBreaker', stageName: 'WaveBreaker', score: 8100, votes: 7200, trend: 'up' },
  ],
};

export default function CompetitionDetailScreen() {
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const [loading, setLoading] = useState(false);
  const [entered, setEntered] = useState(false);

  const handleEnter = () => {
    Alert.alert(
      'Enter Competition',
      `Join ${MOCK_DETAIL.name}? Your live performances during the competition period will be evaluated.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Enter', style: 'default', onPress: () => setEntered(true) },
      ],
    );
  };

  const handleVote = (djId: string, name: string) => {
    Alert.alert('Vote Cast', `You voted for ${name}!`);
  };

  const leftContent = (
    <ScrollView style={styles.leftPane} contentContainerStyle={styles.leftContent}>
      <LinearGradient
        colors={['#a855f720', '#0a0a0f']}
        style={styles.heroGradient}
      >
        <View style={styles.formatBadge}>
          <Text style={styles.formatText}>{MOCK_DETAIL.format.replace('_', ' ').toUpperCase()}</Text>
        </View>
        <Text style={styles.competitionName}>{MOCK_DETAIL.name}</Text>
        <Badge label={MOCK_DETAIL.status} variant="success" />
      </LinearGradient>

      <Card style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Prize Pool</Text>
        <Text style={styles.prizeAmount}>{MOCK_DETAIL.prize}</Text>
      </Card>

      <Card style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Details</Text>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#6b7280" />
          <Text style={styles.detailText}>
            {new Date(MOCK_DETAIL.startDate).toLocaleDateString()} – {new Date(MOCK_DETAIL.endDate).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="people-outline" size={16} color="#6b7280" />
          <Text style={styles.detailText}>{MOCK_DETAIL.entryCount} / {MOCK_DETAIL.maxEntries} entries</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(MOCK_DETAIL.entryCount / MOCK_DETAIL.maxEntries) * 100}%` }]} />
        </View>
      </Card>

      <Card style={styles.infoCard}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.description}>{MOCK_DETAIL.description}</Text>
      </Card>

      {!entered ? (
        <TouchableOpacity style={styles.enterBtn} onPress={handleEnter}>
          <Ionicons name="trophy-outline" size={18} color="#ffffff" />
          <Text style={styles.enterBtnText}>Enter Competition</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.enteredBadge}>
          <Ionicons name="checkmark-circle" size={18} color="#10b981" />
          <Text style={styles.enteredText}>You're in!</Text>
        </View>
      )}
    </ScrollView>
  );

  const rightContent = (
    <ScrollView style={styles.rightPane} contentContainerStyle={styles.rightContent}>
      <Text style={styles.leaderboardTitle}>Leaderboard</Text>
      {MOCK_DETAIL.leaderboard.map((entry) => (
        <Card key={entry.rank} style={styles.leaderRow}>
          <View style={styles.rankBadge}>
            <Text style={[styles.rankNum, entry.rank <= 3 && { color: ['#f59e0b', '#9ca3af', '#b45309'][entry.rank - 1] }]}>
              #{entry.rank}
            </Text>
          </View>
          <Avatar name={entry.name} size={40} />
          <View style={styles.leaderInfo}>
            <Text style={styles.leaderName}>{entry.stageName}</Text>
            <Text style={styles.leaderVotes}>{entry.votes.toLocaleString()} votes</Text>
          </View>
          <View style={styles.leaderRight}>
            <Text style={styles.leaderScore}>{entry.score.toLocaleString()}</Text>
            <Text style={styles.scoreLabel}>pts</Text>
            <TouchableOpacity
              style={styles.voteBtn}
              onPress={() => handleVote(String(entry.rank), entry.name)}
            >
              <Text style={styles.voteBtnText}>Vote</Text>
            </TouchableOpacity>
          </View>
        </Card>
      ))}
    </ScrollView>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <PageHeader title="Competition" showBack />
      <SplitView leftContent={leftContent} rightContent={rightContent} leftFlex={2} rightFlex={3} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  leftPane: { flex: 1 },
  leftContent: { padding: 20, gap: 16 },
  heroGradient: { borderRadius: 16, padding: 20, marginBottom: 4 },
  formatBadge: { backgroundColor: '#a855f720', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 12 },
  formatText: { color: '#a855f7', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  competitionName: { color: '#ffffff', fontSize: 22, fontWeight: '800', marginBottom: 12 },
  infoCard: { gap: 8 },
  sectionTitle: { color: '#ffffff80', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  prizeAmount: { color: '#10b981', fontSize: 32, fontWeight: '900' },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailText: { color: '#ffffff80', fontSize: 14 },
  progressBar: { height: 6, backgroundColor: '#ffffff10', borderRadius: 3, overflow: 'hidden', marginTop: 4 },
  progressFill: { height: '100%', backgroundColor: '#a855f7', borderRadius: 3 },
  description: { color: '#ffffff70', fontSize: 14, lineHeight: 22 },
  enterBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#a855f7', borderRadius: 14, padding: 16 },
  enterBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  enteredBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#10b98120', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#10b98140' },
  enteredText: { color: '#10b981', fontSize: 16, fontWeight: '700' },
  rightPane: { flex: 1, borderLeftWidth: 1, borderLeftColor: '#ffffff10' },
  rightContent: { padding: 20, gap: 10 },
  leaderboardTitle: { color: '#ffffff', fontSize: 20, fontWeight: '700', marginBottom: 8 },
  leaderRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rankBadge: { width: 32, alignItems: 'center' },
  rankNum: { color: '#ffffff80', fontSize: 16, fontWeight: '700' },
  leaderInfo: { flex: 1 },
  leaderName: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
  leaderVotes: { color: '#6b7280', fontSize: 12, marginTop: 2 },
  leaderRight: { alignItems: 'flex-end', gap: 4 },
  leaderScore: { color: '#a855f7', fontSize: 18, fontWeight: '800' },
  scoreLabel: { color: '#6b7280', fontSize: 11 },
  voteBtn: { backgroundColor: '#a855f720', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#a855f740' },
  voteBtnText: { color: '#a855f7', fontSize: 12, fontWeight: '600' },
});
