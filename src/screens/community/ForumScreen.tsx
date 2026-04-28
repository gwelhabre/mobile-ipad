import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PageHeader from '../../components/layout/PageHeader';
import SplitView from '../../components/layout/SplitView';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getForumCategories, getForumThreads, getThreadById, replyToThread } from '../../api/rankings';
import { ForumCategory, ForumThread } from '../../types';

export default function ForumScreen() {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ForumCategory | null>(null);
  const [selectedThread, setSelectedThread] = useState<ForumThread | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  const [likeOverrides, setLikeOverrides] = useState<Record<string, number>>({});

  const handleLike = (postId: string, currentCount: number) => {
    const isLiked = likedPostIds.has(postId);
    setLikedPostIds(prev => {
      const next = new Set(prev);
      isLiked ? next.delete(postId) : next.add(postId);
      return next;
    });
    setLikeOverrides(prev => ({
      ...prev,
      [postId]: (prev[postId] ?? currentCount) + (isLiked ? -1 : 1),
    }));
  };

  const fetchFullThread = useCallback(async (thread: ForumThread) => {
    try {
      const full = await getThreadById(thread.id);
      setSelectedThread(full);
    } catch {
      setSelectedThread(thread);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [cats, threadData] = await Promise.all([
          getForumCategories(),
          getForumThreads(),
        ]);
        setCategories(cats);
        setThreads(threadData);
        if (cats.length > 0) setSelectedCategory(cats[0]);
        if (threadData.length > 0) fetchFullThread(threadData[0]);
      } catch {
        setErrorMsg('Failed to load forum');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fetchFullThread]);

  const handleCategorySelect = useCallback(async (cat: ForumCategory) => {
    setSelectedCategory(cat);
    try {
      const data = await getForumThreads(cat.id);
      setThreads(data);
      if (data.length > 0) fetchFullThread(data[0]);
      else setSelectedThread(null);
    } catch {
      setErrorMsg('Failed to filter threads');
    }
  }, [fetchFullThread]);

  const handleThreadSelect = useCallback((thread: ForumThread) => {
    fetchFullThread(thread);
  }, [fetchFullThread]);

  const handleReply = async () => {
    if (!replyText.trim() || !selectedThread) return;
    setReplying(true);
    try {
      const reply = await replyToThread(selectedThread.id, replyText.trim());
      setSelectedThread(prev => prev ? {
        ...prev,
        replies: [...((prev as any).replies || []), reply],
        repliesCount: prev.repliesCount + 1,
      } : prev);
      setReplyText('');
    } catch {
      setErrorMsg('Failed to post reply');
    } finally {
      setReplying(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  const categoryThreads = selectedCategory
    ? threads.filter((t) => t.categoryId === selectedCategory.id)
    : threads;

  const leftPane = (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.leftScroll}>
      <Text style={styles.paneTitle}>CATEGORIES</Text>
      {categories.map((cat) => (
        <TouchableOpacity
          key={cat.id}
          style={[styles.categoryItem, selectedCategory?.id === cat.id && styles.categoryItemActive]}
          onPress={() => handleCategorySelect(cat)}
          activeOpacity={0.7}
        >
          <View style={[styles.categoryIcon, selectedCategory?.id === cat.id && styles.categoryIconActive]}>
            <Ionicons
              name={(cat.icon as any) || 'chatbubbles-outline'}
              size={18}
              color={selectedCategory?.id === cat.id ? '#a78bfa' : '#64748b'}
            />
          </View>
          <View style={styles.categoryInfo}>
            <Text style={[styles.categoryName, selectedCategory?.id === cat.id && styles.categoryNameActive]}>
              {cat.name}
            </Text>
            {cat.description ? (
              <Text style={styles.categoryDesc} numberOfLines={1}>{cat.description}</Text>
            ) : null}
            <View style={styles.categoryMeta}>
              <Text style={styles.categoryMetaText}>{cat.threadsCount ?? 0} threads</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      <Text style={[styles.paneTitle, styles.threadsSectionTitle]}>THREADS</Text>
      {categoryThreads.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="chatbubbles-outline" size={32} color="#3d4460" />
          <Text style={styles.emptyText}>No threads yet</Text>
        </View>
      ) : (
        categoryThreads.map((thread) => (
          <TouchableOpacity
            key={thread.id}
            style={[styles.threadItem, selectedThread?.id === thread.id && styles.threadItemActive]}
            onPress={() => handleThreadSelect(thread)}
            activeOpacity={0.75}
          >
            {thread.isPinned && (
              <Ionicons name="pin" size={12} color="#f59e0b" style={styles.pinIcon} />
            )}
            <Text style={styles.threadTitle} numberOfLines={2}>{thread.title}</Text>
            <View style={styles.threadMeta}>
              <Text style={styles.threadAuthor}>{thread.authorName}</Text>
              <Text style={styles.threadStats}>
                {thread.repliesCount} replies · {thread.viewsCount} views
              </Text>
            </View>
            {thread.tags && thread.tags.length > 0 && (
              <View style={styles.tagsRow}>
                {thread.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} label={tag} variant="gray" size="sm" />
                ))}
              </View>
            )}
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );

  const rightPane = !selectedThread ? (
    <EmptyState
      icon="chatbubbles-outline"
      title="Select a thread"
      subtitle="Choose a thread from the left to read and reply"
    />
  ) : (
    <KeyboardAvoidingView
      style={styles.threadDetail}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.threadHeader}>
        <Text style={styles.threadDetailTitle}>{selectedThread.title}</Text>
        <View style={styles.threadHeaderMeta}>
          <Avatar name={selectedThread.authorName} size={28} />
          <Text style={styles.threadAuthorName}>{selectedThread.authorName}</Text>
          <Text style={styles.threadDate}>
            {new Date(selectedThread.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <FlatList
        data={[
          {
            id: 'op',
            body: selectedThread.body,
            authorName: selectedThread.authorName,
            authorAvatarUrl: selectedThread.authorAvatarUrl,
            createdAt: selectedThread.createdAt,
            likeCount: (selectedThread as any).likeCount ?? 0,
            isOp: true,
          } as any,
          ...((selectedThread as any).replies || []),
        ]}
        keyExtractor={(r) => r.id}
        renderItem={({ item }) => (
          <View style={[styles.replyItem, item.isOp && styles.opItem]}>
            <Avatar name={item.authorName} size={36} />
            <View style={styles.replyContent}>
              <View style={styles.replyHeader}>
                <Text style={styles.replyAuthor}>{item.authorName}</Text>
                {item.isOp && <Badge label="OP" variant="emerald" size="sm" />}
                <Text style={styles.replyDate}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.replyBody}>{item.body}</Text>
              <View style={styles.replyActions}>
                <TouchableOpacity
                  style={styles.likeBtn}
                  activeOpacity={0.7}
                  onPress={() => handleLike(item.id, item.likeCount ?? 0)}
                >
                  <Ionicons
                    name={likedPostIds.has(item.id) ? 'heart' : 'heart-outline'}
                    size={14}
                    color={likedPostIds.has(item.id) ? '#ec4899' : '#6b7280'}
                  />
                  <Text style={[styles.likeCount, likedPostIds.has(item.id) && styles.likeCountActive]}>
                    {likeOverrides[item.id] ?? item.likeCount ?? 0}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        contentContainerStyle={styles.repliesList}
        showsVerticalScrollIndicator={false}
      />

      {!selectedThread.isLocked && (
        <View style={styles.replyInput}>
          <TextInput
            style={styles.replyTextField}
            placeholder="Write a reply..."
            placeholderTextColor="#4b5563"
            value={replyText}
            onChangeText={setReplyText}
            multiline
          />
          <TouchableOpacity
            style={[styles.replyBtn, (!replyText.trim() || replying) && styles.replyBtnDisabled]}
            onPress={handleReply}
            disabled={!replyText.trim() || replying}
            activeOpacity={0.75}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );

  return (
    <View style={styles.container}>
      <PageHeader title="Forum" subtitle="Discuss, share and connect with the community" />
      {errorMsg ? (
        <View style={styles.errorRow}>
          <Ionicons name="warning-outline" size={14} color="#ef4444" />
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : null}
      <SplitView left={leftPane} right={rightPane} leftFlex={4} rightFlex={6} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'rgba(239,68,68,0.08)',
  },
  errorText: { fontSize: 12, color: '#ef4444' },
  leftScroll: { flex: 1 },
  paneTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 8,
  },
  threadsSectionTitle: { marginTop: 12 },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2a',
    gap: 10,
  },
  categoryItemActive: { backgroundColor: 'rgba(124,58,237,0.08)' },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#13131a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1e1e2e',
    flexShrink: 0,
  },
  categoryIconActive: {
    borderColor: 'rgba(124,58,237,0.4)',
    backgroundColor: 'rgba(124,58,237,0.1)',
  },
  categoryInfo: { flex: 1 },
  categoryName: { fontSize: 13, fontWeight: '700', color: '#94a3b8', marginBottom: 2 },
  categoryNameActive: { color: '#f1f5f9' },
  categoryDesc: { fontSize: 11, color: '#475569', marginBottom: 3 },
  categoryMeta: { flexDirection: 'row', gap: 5, alignItems: 'center' },
  categoryMetaText: { fontSize: 11, color: '#3d4460' },
  threadItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2a',
    borderWidth: 1,
    borderColor: 'transparent',
    marginHorizontal: 4,
    marginBottom: 2,
    borderRadius: 8,
  },
  threadItemActive: {
    backgroundColor: 'rgba(124,58,237,0.1)',
    borderColor: 'rgba(124,58,237,0.3)',
  },
  pinIcon: { marginBottom: 3 },
  threadTitle: { color: '#f1f5f9', fontSize: 13, fontWeight: '600', lineHeight: 18, marginBottom: 4 },
  threadMeta: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  threadAuthor: { color: '#a78bfa', fontSize: 11, fontWeight: '600' },
  threadStats: { color: '#475569', fontSize: 11 },
  tagsRow: { flexDirection: 'row', gap: 4, flexWrap: 'wrap' },
  empty: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyText: { fontSize: 13, color: '#3d4460' },
  // Right pane thread detail
  threadDetail: { flex: 1, flexDirection: 'column' },
  threadHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2e',
    gap: 10,
  },
  threadDetailTitle: {
    color: '#f1f5f9',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  threadHeaderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  threadAuthorName: { color: '#a78bfa', fontSize: 13, fontWeight: '600' },
  threadDate: { color: '#475569', fontSize: 12 },
  repliesList: { padding: 12, gap: 4 },
  replyItem: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  opItem: {
    backgroundColor: '#0f0a1a',
    borderRadius: 12,
    padding: 12,
    borderBottomWidth: 0,
    marginBottom: 8,
  },
  replyContent: { flex: 1, gap: 6 },
  replyHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  replyAuthor: { color: '#f1f5f9', fontSize: 13, fontWeight: '600' },
  replyDate: { color: '#475569', fontSize: 11, flex: 1, textAlign: 'right' },
  replyBody: { color: '#94a3b8', fontSize: 14, lineHeight: 21 },
  replyActions: { flexDirection: 'row' },
  likeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  likeCount: { color: '#6b7280', fontSize: 12 },
  likeCountActive: { color: '#ec4899' },
  replyInput: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#1e1e2e',
    backgroundColor: '#12121a',
    alignItems: 'flex-end',
  },
  replyTextField: {
    flex: 1,
    color: '#f1f5f9',
    fontSize: 14,
    backgroundColor: '#0a0a0f',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e1e2e',
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxHeight: 100,
    minHeight: 44,
    textAlignVertical: 'top',
  },
  replyBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  replyBtnDisabled: { backgroundColor: '#374151' },
});
