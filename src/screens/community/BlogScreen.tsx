import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';

const BLOG_CATEGORIES = ['All', 'News', 'Tutorials', 'Interviews', 'Events', 'Gear', 'Culture'];

const MOCK_POSTS = Array.from({ length: 9 }, (_, i) => ({
  id: `post-${i}`,
  title: [
    'The Evolution of Tech House: From Minimal Roots to Peak Time Anthems',
    'Interview: DJ Pulse on His Journey from Bedroom to Berghain',
    'Top 10 Must-Have VST Plugins for Electronic Music Production in 2026',
    'How Virtual Gifting Is Revolutionizing the DJ Economy',
    'Fabric London at 25: How the Club Shaped Global Electronic Music',
    'The Art of the Warm-Up Set: Tips from Touring DJs',
    'Pioneer CDJ-3000 Review: Two Years On',
    'From Local to Global: Building a DJ Brand in the Digital Age',
    'Understanding DJ Booking Contracts: What Every Artist Needs to Know',
  ][i],
  excerpt: [
    'We trace the sonic journey of one of dance music\'s most enduring genres and look at what makes it tick in 2026.',
    'In an exclusive interview, the UK\'s hottest DJ talks about breaking through, staying authentic, and his love for Fabric.',
    'Our producers pick the plugins that actually make it into their sessions — from synths to effects processors.',
    'As live streaming grows, virtual gifts are creating new revenue streams for DJs. We look at how the economics work.',
    'A celebration of the legendary London club that has shaped underground dance culture for a quarter century.',
    'What separates a good warm-up from a great one? We asked five touring DJs to share their secrets.',
    'After two years with Pioneer\'s flagship media player, is it still the gold standard?',
    'Building a sustainable career as a DJ in the age of social media requires both talent and strategy.',
    'Legal and practical advice for understanding the contracts you\'ll encounter as you level up your DJ career.',
  ][i],
  author: ['DJ Pulse', 'Nova Sound', 'Editorial Team', 'Electra', 'Bass Theory', 'Music Journo', 'Gear Review', 'Industry Insider', 'DJ Mag Staff'][i],
  category: ['Culture', 'Interviews', 'Tutorials', 'News', 'Culture', 'Tutorials', 'Gear', 'Culture', 'News'][i],
  readTime: [8, 12, 6, 5, 10, 7, 9, 8, 6][i],
  views: [4200, 8100, 3600, 2900, 5800, 2100, 3300, 4700, 1900][i],
  likes: [312, 640, 218, 156, 445, 178, 234, 389, 124][i],
  publishedAt: new Date(Date.now() - i * 3 * 24 * 3600000).toISOString(),
  isFeatured: i === 0,
}));

export default function BlogScreen() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filtered = MOCK_POSTS.filter(
    (p) => selectedCategory === 'All' || p.category === selectedCategory,
  );

  const renderPost = ({ item }: { item: typeof MOCK_POSTS[0] }) => (
    <TouchableOpacity style={[styles.postCard, item.isFeatured && styles.postCardFeatured]} activeOpacity={0.8}>
      {/* Cover area */}
      <View style={[styles.postCover, item.isFeatured && styles.postCoverFeatured]}>
        <Ionicons name="newspaper-outline" size={30} color={item.isFeatured ? '#a78bfa' : '#7c3aed'} />
        {item.isFeatured && (
          <View style={styles.featuredBadge}>
            <Ionicons name="star" size={11} color="#f59e0b" />
            <Text style={styles.featuredBadgeText}>Featured</Text>
          </View>
        )}
      </View>

      <View style={styles.postBody}>
        <View style={styles.postMeta}>
          <Badge
            label={item.category}
            variant={item.isFeatured ? 'amber' : 'purple'}
            size="sm"
          />
          <Text style={styles.readTime}>{item.readTime} min read</Text>
        </View>

        <Text style={[styles.postTitle, item.isFeatured && styles.postTitleFeatured]} numberOfLines={3}>
          {item.title}
        </Text>

        <Text style={styles.postExcerpt} numberOfLines={2}>{item.excerpt}</Text>

        <View style={styles.postFooter}>
          <Avatar name={item.author} size={24} />
          <Text style={styles.authorName}>{item.author}</Text>
          <Text style={styles.footerDot}>•</Text>
          <Text style={styles.postDate}>
            {new Date(item.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
        </View>

        <View style={styles.engagementRow}>
          <View style={styles.engagementItem}>
            <Ionicons name="eye-outline" size={13} color="#64748b" />
            <Text style={styles.engagementText}>{(item.views / 1000).toFixed(1)}k</Text>
          </View>
          <View style={styles.engagementItem}>
            <Ionicons name="heart-outline" size={13} color="#64748b" />
            <Text style={styles.engagementText}>{item.likes}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <PageHeader title="Blog" subtitle="News, tutorials and stories from the scene" />

      {/* Category tabs */}
      <View style={styles.categoryBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {BLOG_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.categoryChipText, selectedCategory === cat && styles.categoryChipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 3-column post grid */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        numColumns={3}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  categoryBar: {
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2e',
  },
  categoryScroll: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#13131a',
    borderWidth: 1,
    borderColor: '#1e1e2e',
  },
  categoryChipActive: {
    backgroundColor: 'rgba(124,58,237,0.15)',
    borderColor: '#7c3aed',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b',
  },
  categoryChipTextActive: {
    color: '#a78bfa',
    fontWeight: '700',
  },
  grid: {
    padding: 16,
    paddingBottom: 24,
  },
  postCard: {
    flex: 1,
    margin: 6,
    backgroundColor: '#13131a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e1e2e',
    overflow: 'hidden',
  },
  postCardFeatured: {
    borderColor: 'rgba(245,158,11,0.3)',
    backgroundColor: '#141420',
  },
  postCover: {
    height: 120,
    backgroundColor: 'rgba(124,58,237,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2e',
    position: 'relative',
  },
  postCoverFeatured: {
    backgroundColor: 'rgba(124,58,237,0.12)',
    borderBottomColor: 'rgba(245,158,11,0.2)',
  },
  featuredBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245,158,11,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
  },
  featuredBadgeText: { fontSize: 10, fontWeight: '700', color: '#f59e0b' },
  postBody: { padding: 14 },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  readTime: { fontSize: 11, color: '#475569' },
  postTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f1f5f9',
    lineHeight: 19,
    marginBottom: 6,
  },
  postTitleFeatured: { fontSize: 15 },
  postExcerpt: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 17,
    marginBottom: 10,
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  authorName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
  footerDot: { fontSize: 10, color: '#475569' },
  postDate: { fontSize: 11, color: '#475569' },
  engagementRow: {
    flexDirection: 'row',
    gap: 12,
  },
  engagementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  engagementText: { fontSize: 11, color: '#64748b' },
});
