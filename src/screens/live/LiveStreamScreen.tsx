import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { LiveStackParamList } from '../../types';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import { sendTip } from '../../api/tips';

const TIP_PRESETS = [2, 5, 10, 20];

type Route = RouteProp<LiveStackParamList, 'LiveStream'>;

const GIFTS = [
  { id: '1', emoji: '🔥', name: 'Fire', price: 1 },
  { id: '2', emoji: '⚡', name: 'Bolt', price: 5 },
  { id: '3', emoji: '💎', name: 'Diamond', price: 50 },
  { id: '4', emoji: '🚀', name: 'Rocket', price: 20 },
  { id: '5', emoji: '👑', name: 'Crown', price: 100 },
  { id: '6', emoji: '🎵', name: 'Note', price: 2 },
];

const MOCK_CHAT = [
  { id: '1', user: 'Alex', message: 'This set is 🔥🔥🔥', time: '22:04', type: 'message' },
  { id: '2', user: 'Maria', message: 'Best DJ in the game right now!', time: '22:04', type: 'message' },
  { id: '3', user: 'TechBeat', message: '💎 sent a Diamond Gift!', time: '22:05', type: 'gift', giftName: 'Diamond', giftValue: 50 },
  { id: '4', user: 'Jordan', message: 'Drop incoming I can feel it', time: '22:05', type: 'message' },
  { id: '5', user: 'Neon', message: 'ID on that track please??', time: '22:06', type: 'message' },
  { id: '6', user: 'Sam', message: '🔥 sent a Fire Gift!', time: '22:06', type: 'gift', giftName: 'Fire', giftValue: 1 },
  { id: '7', user: 'Kai', message: 'TUNNEL 🚀🚀', time: '22:07', type: 'message' },
  { id: '8', user: 'Alex', message: 'That transition was immaculate', time: '22:07', type: 'message' },
  { id: '9', user: 'Vibe', message: 'Just started watching — absolute fire', time: '22:08', type: 'message' },
  { id: '10', user: 'Leo', message: '👑 sent a Crown Gift!', time: '22:08', type: 'gift', giftName: 'Crown', giftValue: 100 },
];

export default function LiveStreamScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation();
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState(MOCK_CHAT);
  const [showGifts, setShowGifts] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [tipModal, setTipModal] = useState(false);
  const [tipAmount, setTipAmount] = useState('5');
  const [tipMessage, setTipMessage] = useState('');
  const [tipLoading, setTipLoading] = useState(false);

  const streamInfo = {
    id: route.params.streamId,
    djId: route.params.djId,
    djName: route.params.djName ?? 'DJ Pulse',
    title: 'Tech House Massive — Live from London',
    genre: 'Tech House',
    viewerCount: 2840,
    giftsTotal: 1240,
    duration: '1:42:18',
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    setChat((prev) => [...prev, {
      id: Date.now().toString(),
      user: 'You',
      message: message.trim(),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      type: 'message',
    }]);
    setMessage('');
  };

  const handleTip = async () => {
    const amount = Number(tipAmount.replace(',', '.'));
    if (!Number.isFinite(amount) || amount <= 0) {
      Alert.alert('Invalid amount', 'Enter a tip amount greater than 0.');
      return;
    }
    if (amount > 20) {
      Alert.alert('Tip limit', 'Private tips are capped at 20 EUR per DJ per stream/event.');
      return;
    }
    if (!streamInfo.djId) {
      Alert.alert('Tip unavailable', 'This stream is missing DJ info.');
      return;
    }
    setTipLoading(true);
    try {
      const result = await sendTip({
        djId: streamInfo.djId,
        amount,
        liveId: streamInfo.id,
        message: tipMessage.trim() || undefined,
      });
      setTipModal(false);
      setTipAmount('5');
      setTipMessage('');
      Alert.alert(
        'Tip sent',
        `DJ receives ${result.sellerAmount.toFixed(2)} ${result.currency}; platform commission ${result.platformAmount.toFixed(2)} ${result.currency} supports the local DJing ecosystem.`,
      );
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error || err?.response?.data?.message || 'Failed to send tip.');
    } finally {
      setTipLoading(false);
    }
  };

  const sendGift = (gift: typeof GIFTS[0]) => {
    setChat((prev) => [...prev, {
      id: Date.now().toString(),
      user: 'You',
      message: `${gift.emoji} sent a ${gift.name} Gift!`,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      type: 'gift',
      giftName: gift.name,
      giftValue: gift.price,
    }]);
    setShowGifts(false);
  };

  const renderChatItem = ({ item }: { item: typeof MOCK_CHAT[0] }) => (
    <View style={[styles.chatItem, item.type === 'gift' && styles.chatItemGift]}>
      {item.type === 'gift' && (
        <View style={styles.giftIndicator}>
          <Ionicons name="gift" size={12} color="#a78bfa" />
        </View>
      )}
      <Text style={styles.chatText}>
        <Text style={[styles.chatUser, item.type === 'gift' && styles.chatUserGift]}>
          {item.user}{' '}
        </Text>
        {item.message}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Back */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#f1f5f9" />
        </TouchableOpacity>
        <Text style={styles.topTitle} numberOfLines={1}>{streamInfo.title}</Text>
        <View style={styles.topRight}>
          <View style={styles.viewersBadge}>
            <Ionicons name="eye" size={14} color="#fff" />
            <Text style={styles.viewersText}>{streamInfo.viewerCount.toLocaleString()}</Text>
          </View>
        </View>
      </View>

      <View style={styles.mainContent}>
        {/* Stream Area (2/3) */}
        <View style={styles.streamArea}>
          <LinearGradient
            colors={['#0a0a1e', '#1a0a2e', '#0a0a0f']}
            style={styles.streamPlaceholder}
          >
            <Ionicons name="radio" size={64} color="rgba(124,58,237,0.4)" />
            <Text style={styles.streamPlaceholderText}>Live Stream</Text>
            <Text style={styles.streamDuration}>{streamInfo.duration}</Text>
          </LinearGradient>

          {/* Stream overlay info */}
          <View style={styles.streamOverlay}>
            <View style={styles.streamBadgeRow}>
              <View style={styles.liveStreamBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveBadgeText}>LIVE</Text>
              </View>
              <Badge label={streamInfo.genre} variant="purple" size="sm" />
            </View>
          </View>

          {/* DJ Info below stream */}
          <View style={styles.djInfoBar}>
            <Avatar name={streamInfo.djName} size={44} showOnline />
            <View style={styles.djInfoText}>
              <Text style={styles.djStreamName}>{streamInfo.djName}</Text>
              <Text style={styles.djStreamTitle} numberOfLines={1}>{streamInfo.title}</Text>
            </View>
            <View style={styles.streamActions}>
              <TouchableOpacity
                style={[styles.streamActionBtn, isFollowing && styles.streamActionBtnActive]}
                onPress={() => setIsFollowing(!isFollowing)}
              >
                <Ionicons name={isFollowing ? 'heart' : 'heart-outline'} size={16} color={isFollowing ? '#ef4444' : '#94a3b8'} />
                <Text style={styles.streamActionText}>{isFollowing ? 'Following' : 'Follow'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tipBtn} onPress={() => setTipModal(true)}>
                <Ionicons name="cash-outline" size={16} color="#10b981" />
                <Text style={styles.tipBtnText}>Tip</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareBtn}>
                <Ionicons name="share-social-outline" size={16} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Ionicons name="eye-outline" size={16} color="#64748b" />
              <Text style={styles.statText}>{streamInfo.viewerCount.toLocaleString()} watching</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="gift-outline" size={16} color="#a78bfa" />
              <Text style={styles.statText}>${streamInfo.giftsTotal.toLocaleString()} in gifts</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={16} color="#64748b" />
              <Text style={styles.statText}>{streamInfo.duration}</Text>
            </View>
          </View>
        </View>

        {/* Chat + Gifts Panel (1/3) */}
        <KeyboardAvoidingView
          style={styles.chatPanel}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          {/* Chat header */}
          <View style={styles.chatHeader}>
            <Text style={styles.chatHeaderTitle}>Live Chat</Text>
            <TouchableOpacity
              style={[styles.giftToggleBtn, showGifts && styles.giftToggleBtnActive]}
              onPress={() => setShowGifts(!showGifts)}
            >
              <Ionicons name="gift" size={14} color={showGifts ? '#a78bfa' : '#64748b'} />
              <Text style={[styles.giftToggleText, showGifts && styles.giftToggleTextActive]}>Gifts</Text>
            </TouchableOpacity>
          </View>

          {/* Gift panel */}
          {showGifts && (
            <View style={styles.giftPanel}>
              <Text style={styles.giftPanelTitle}>Send a Gift</Text>
              <View style={styles.giftsGrid}>
                {GIFTS.map((gift) => (
                  <TouchableOpacity
                    key={gift.id}
                    style={styles.giftBtn}
                    onPress={() => sendGift(gift)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.giftEmoji}>{gift.emoji}</Text>
                    <Text style={styles.giftName}>{gift.name}</Text>
                    <Text style={styles.giftPrice}>${gift.price}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Chat messages */}
          <FlatList
            data={chat}
            keyExtractor={(item) => item.id}
            renderItem={renderChatItem}
            showsVerticalScrollIndicator={false}
            style={styles.chatList}
            contentContainerStyle={styles.chatListContent}
          />

          {/* Message input */}
          <View style={styles.chatInput}>
            <TextInput
              style={styles.chatTextInput}
              value={message}
              onChangeText={setMessage}
              placeholder="Say something..."
              placeholderTextColor="#3d4460"
              onSubmitEditing={sendMessage}
              returnKeyType="send"
            />
            <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
              <Ionicons name="send" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>

      <Modal visible={tipModal} transparent animationType="fade" onRequestClose={() => setTipModal(false)}>
        <View style={styles.tipOverlay}>
          <View style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <Text style={styles.tipTitle}>Tip the DJ</Text>
              <TouchableOpacity onPress={() => setTipModal(false)} style={styles.tipClose}>
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.tipSubtitle}>Private tip — capped at 20 EUR per DJ per stream/event.</Text>
            <View style={styles.tipPresets}>
              {TIP_PRESETS.map((p) => {
                const active = String(p) === tipAmount;
                return (
                  <TouchableOpacity
                    key={p}
                    style={[styles.tipPreset, active && styles.tipPresetActive]}
                    onPress={() => setTipAmount(String(p))}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.tipPresetText, active && styles.tipPresetTextActive]}>{p}€</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TextInput
              style={styles.tipInput}
              value={tipAmount}
              onChangeText={setTipAmount}
              keyboardType="decimal-pad"
              placeholder="Amount"
              placeholderTextColor="#4b5563"
            />
            <TextInput
              style={[styles.tipInput, { minHeight: 60 }]}
              value={tipMessage}
              onChangeText={setTipMessage}
              placeholder="Add a message (optional)"
              placeholderTextColor="#4b5563"
              multiline
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[styles.tipSendBtn, tipLoading && styles.tipSendBtnDisabled]}
              onPress={handleTip}
              disabled={tipLoading}
              activeOpacity={0.85}
            >
              {tipLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.tipSendText}>Send Tip</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2e',
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#13131a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#f1f5f9',
  },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  viewersBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 5,
  },
  viewersText: { fontSize: 13, fontWeight: '700', color: '#f87171' },
  mainContent: { flex: 1, flexDirection: 'row' },
  streamArea: {
    flex: 2,
    borderRightWidth: 1,
    borderRightColor: '#1e1e2e',
  },
  streamPlaceholder: {
    flex: 1,
    minHeight: 300,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  streamPlaceholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(241,245,249,0.3)',
  },
  streamDuration: {
    fontSize: 14,
    color: 'rgba(241,245,249,0.2)',
  },
  streamOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
  },
  streamBadgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  liveStreamBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  liveBadgeText: { fontSize: 11, fontWeight: '800', color: '#fff' },
  djInfoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1e1e2e',
    gap: 12,
    backgroundColor: '#0d0d16',
  },
  djInfoText: { flex: 1 },
  djStreamName: { fontSize: 15, fontWeight: '700', color: '#f1f5f9' },
  djStreamTitle: { fontSize: 12, color: '#64748b', marginTop: 2 },
  streamActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  streamActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#13131a',
    borderWidth: 1,
    borderColor: '#1e1e2e',
  },
  streamActionBtnActive: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderColor: '#ef4444',
  },
  streamActionText: { fontSize: 13, color: '#94a3b8', fontWeight: '600' },
  shareBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#13131a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1e1e2e',
  },
  statsBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#1e1e2e',
    gap: 20,
  },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { fontSize: 13, color: '#64748b' },
  chatPanel: {
    flex: 1,
    flexDirection: 'column',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2e',
  },
  chatHeaderTitle: { fontSize: 15, fontWeight: '700', color: '#f1f5f9' },
  giftToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#13131a',
    borderWidth: 1,
    borderColor: '#1e1e2e',
  },
  giftToggleBtnActive: {
    backgroundColor: 'rgba(124,58,237,0.15)',
    borderColor: '#7c3aed',
  },
  giftToggleText: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  giftToggleTextActive: { color: '#a78bfa' },
  giftPanel: {
    backgroundColor: '#0d0d16',
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2e',
    padding: 14,
  },
  giftPanelTitle: { fontSize: 12, fontWeight: '700', color: '#64748b', marginBottom: 10, letterSpacing: 0.5 },
  giftsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  giftBtn: {
    alignItems: 'center',
    backgroundColor: '#13131a',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1e1e2e',
    minWidth: 68,
  },
  giftEmoji: { fontSize: 22, marginBottom: 3 },
  giftName: { fontSize: 11, color: '#94a3b8', fontWeight: '600', marginBottom: 2 },
  giftPrice: { fontSize: 11, color: '#a78bfa', fontWeight: '700' },
  chatList: { flex: 1 },
  chatListContent: { paddingHorizontal: 12, paddingVertical: 8, gap: 4 },
  chatItem: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  chatItemGift: {
    backgroundColor: 'rgba(124,58,237,0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  giftIndicator: {
    width: 20,
    height: 20,
    borderRadius: 5,
    backgroundColor: 'rgba(124,58,237,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatText: { fontSize: 13, color: '#94a3b8', lineHeight: 18, flex: 1 },
  chatUser: { fontWeight: '700', color: '#f1f5f9' },
  chatUserGift: { color: '#a78bfa' },
  chatInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#1e1e2e',
    gap: 8,
  },
  chatTextInput: {
    flex: 1,
    backgroundColor: '#13131a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e1e2e',
    paddingHorizontal: 14,
    height: 40,
    fontSize: 14,
    color: '#f1f5f9',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8,
    backgroundColor: 'rgba(16,185,129,0.12)', borderWidth: 1, borderColor: '#10b98155',
  },
  tipBtnText: { fontSize: 13, color: '#10b981', fontWeight: '700' },
  tipOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'center', padding: 32 },
  tipCard: { backgroundColor: '#12121a', borderRadius: 18, borderWidth: 1, borderColor: '#1f1f2e', padding: 22, gap: 14, maxWidth: 480, alignSelf: 'center', width: '100%' },
  tipHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tipTitle: { color: '#fff', fontSize: 20, fontWeight: '900' },
  tipClose: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#1f1f2e', alignItems: 'center', justifyContent: 'center' },
  tipSubtitle: { color: '#94a3b8', fontSize: 13 },
  tipPresets: { flexDirection: 'row', gap: 10 },
  tipPreset: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#13131a', borderWidth: 1, borderColor: '#1e1e2e', alignItems: 'center' },
  tipPresetActive: { borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.12)' },
  tipPresetText: { color: '#94a3b8', fontSize: 15, fontWeight: '700' },
  tipPresetTextActive: { color: '#10b981' },
  tipInput: { backgroundColor: '#0a0a0f', borderWidth: 1, borderColor: '#1e1e2e', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: '#fff', fontSize: 14 },
  tipSendBtn: { backgroundColor: '#10b981', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 6 },
  tipSendBtnDisabled: { opacity: 0.6 },
  tipSendText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
