import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { MarketplaceStackParamList } from '../../types';
import Badge from '../../components/common/Badge';
import { marketplaceApi } from '../../api/marketplace';

type Route = RouteProp<MarketplaceStackParamList, 'ProductDetail'>;

const MOCK_REVIEWS = [
  { id: '1', user: 'Alex B.', rating: 5, comment: 'Absolutely incredible quality. Worth every penny!', date: '2026-03-01' },
  { id: '2', user: 'Maria K.', rating: 4, comment: 'Great set, solid production. Would buy again.', date: '2026-02-20' },
  { id: '3', user: 'TechBeat', rating: 5, comment: 'Used this in my set last weekend, crowd went wild.', date: '2026-02-15' },
];

export default function ProductDetailScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation();
  const [isPurchased, setIsPurchased] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  const product = {
    id: route.params.productId,
    title: 'Tech House Massive Vol.1',
    sellerName: 'DJ Pulse',
    price: 8.99,
    category: 'DJ Set',
    rating: 4.8,
    reviewsCount: 42,
    salesCount: 340,
    duration: 62,
    description: 'A high-energy Tech House set recorded live at Fabric London. Features exclusive edits, unreleased tracks, and a signature driving groove that will keep any dancefloor moving from start to finish. Mastered for both club and headphone listening.',
    tracklist: [
      '01. Mystery Artist - Untitled (Opening Mix)',
      '02. Dj Pulse - Tech Drive (Original Mix)',
      '03. Unknown - Underground Groove',
      '04. Fabric Special Edit - Dub Version',
      '05. Closing Sequence - Deep Outro',
    ],
    tags: ['tech house', 'live recording', 'fabric', 'underground'],
  };

  const handlePurchase = async () => {
    if (isPurchased || purchasing) return;
    Alert.alert(
      'Confirm Purchase',
      `Buy "${product.title}" for $${product.price.toFixed(2)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Buy Now',
          onPress: async () => {
            setPurchasing(true);
            try {
              await marketplaceApi.purchaseProduct(product.id);
              setIsPurchased(true);
            } catch (err: any) {
              Alert.alert('Purchase failed', err?.response?.data?.error || err?.response?.data?.message || 'Could not complete purchase.');
            } finally {
              setPurchasing(false);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={20} color="#f1f5f9" />
        <Text style={styles.backText}>Marketplace</Text>
      </TouchableOpacity>

      <View style={styles.mainLayout}>
        {/* Left: Product visual */}
        <View style={styles.leftPane}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.productImageArea}>
              <Ionicons name="disc" size={80} color="#7c3aed" />
            </View>

            {/* Seller card */}
            <View style={styles.sellerCard}>
              <View style={styles.sellerAvatar}>
                <Text style={styles.sellerAvatarText}>{product.sellerName.charAt(0)}</Text>
              </View>
              <View>
                <Text style={styles.sellerLabel}>Sold by</Text>
                <Text style={styles.sellerName}>{product.sellerName}</Text>
              </View>
            </View>

            {/* Product stats */}
            <View style={styles.statsBlock}>
              <View style={styles.statRow}>
                <Ionicons name="star" size={15} color="#f59e0b" />
                <Text style={styles.statLabel}>Rating</Text>
                <Text style={styles.statValue}>{product.rating}/5.0</Text>
              </View>
              <View style={styles.statRow}>
                <Ionicons name="cart" size={15} color="#10b981" />
                <Text style={styles.statLabel}>Sales</Text>
                <Text style={styles.statValue}>{product.salesCount}</Text>
              </View>
              <View style={styles.statRow}>
                <Ionicons name="chatbubble" size={15} color="#3b82f6" />
                <Text style={styles.statLabel}>Reviews</Text>
                <Text style={styles.statValue}>{product.reviewsCount}</Text>
              </View>
              {product.duration && (
                <View style={styles.statRow}>
                  <Ionicons name="time" size={15} color="#64748b" />
                  <Text style={styles.statLabel}>Duration</Text>
                  <Text style={styles.statValue}>{product.duration} min</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>

        {/* Right: Details & purchase */}
        <ScrollView style={styles.rightPane} contentContainerStyle={styles.rightContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.productHeader}>
            <Badge label={product.category} variant="purple" size="md" />
            <Text style={styles.productTitle}>{product.title}</Text>

            <View style={styles.ratingRow}>
              {Array.from({ length: 5 }, (_, i) => (
                <Ionicons key={i} name="star" size={16} color={i < Math.floor(product.rating) ? '#f59e0b' : '#2d2d40'} />
              ))}
              <Text style={styles.ratingText}>{product.rating} ({product.reviewsCount} reviews)</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this product</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          {/* Tracklist */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tracklist</Text>
            {product.tracklist.map((track, idx) => (
              <View key={idx} style={styles.trackRow}>
                <Ionicons name="musical-note" size={14} color="#7c3aed" />
                <Text style={styles.trackText}>{track}</Text>
              </View>
            ))}
          </View>

          {/* Tags */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsRow}>
              {product.tags.map((tag) => (
                <Badge key={tag} label={`#${tag}`} variant="gray" size="sm" />
              ))}
            </View>
          </View>

          {/* Buy section */}
          <View style={styles.buySection}>
            <View style={styles.priceBlock}>
              <Text style={styles.priceLabel}>Price</Text>
              <Text style={styles.priceValue}>${product.price}</Text>
            </View>
            <TouchableOpacity
              style={[styles.buyButton, (isPurchased || purchasing) && styles.buyButtonPurchased]}
              onPress={handlePurchase}
              disabled={isPurchased || purchasing}
            >
              <Ionicons name={isPurchased ? 'checkmark-circle' : 'cart'} size={20} color="#fff" />
              <Text style={styles.buyButtonText}>
                {purchasing ? 'Buying...' : isPurchased ? 'Purchased' : 'Buy Now'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Reviews */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reviews ({product.reviewsCount})</Text>
            {MOCK_REVIEWS.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewAvatar}>
                    <Text style={styles.reviewAvatarText}>{review.user.charAt(0)}</Text>
                  </View>
                  <View style={styles.reviewMeta}>
                    <Text style={styles.reviewUser}>{review.user}</Text>
                    <View style={styles.reviewStars}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <Ionicons key={i} name="star" size={12} color={i < review.rating ? '#f59e0b' : '#2d2d40'} />
                      ))}
                    </View>
                  </View>
                  <Text style={styles.reviewDate}>
                    {new Date(review.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Text>
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2e',
  },
  backText: { fontSize: 15, color: '#94a3b8', fontWeight: '600' },
  mainLayout: { flex: 1, flexDirection: 'row' },
  leftPane: {
    width: '30%',
    borderRightWidth: 1,
    borderRightColor: '#1e1e2e',
  },
  rightPane: { flex: 1 },
  rightContent: { padding: 28, paddingBottom: 40 },
  productImageArea: {
    height: 220,
    backgroundColor: 'rgba(124,58,237,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2e',
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2e',
  },
  sellerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerAvatarText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  sellerLabel: { fontSize: 11, color: '#64748b', marginBottom: 1 },
  sellerName: { fontSize: 15, fontWeight: '700', color: '#f1f5f9' },
  statsBlock: {
    padding: 20,
    gap: 12,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statLabel: { flex: 1, fontSize: 13, color: '#64748b' },
  statValue: { fontSize: 13, color: '#f1f5f9', fontWeight: '700' },
  productHeader: { marginBottom: 24 },
  productTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#f1f5f9',
    letterSpacing: -0.5,
    marginVertical: 10,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: { fontSize: 13, color: '#64748b', marginLeft: 6 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: 12,
  },
  description: { fontSize: 14, color: '#94a3b8', lineHeight: 22 },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2a',
  },
  trackText: { fontSize: 13, color: '#94a3b8' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  buySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#13131a',
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    borderColor: '#1e1e2e',
    marginBottom: 28,
  },
  priceBlock: {},
  priceLabel: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  priceValue: { fontSize: 30, fontWeight: '800', color: '#a78bfa' },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#7c3aed',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buyButtonPurchased: { backgroundColor: '#10b981' },
  buyButtonText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  reviewCard: {
    backgroundColor: '#13131a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e1e2e',
    marginBottom: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  reviewAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewAvatarText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  reviewMeta: { flex: 1 },
  reviewUser: { fontSize: 13, fontWeight: '700', color: '#f1f5f9', marginBottom: 2 },
  reviewStars: { flexDirection: 'row', gap: 2 },
  reviewDate: { fontSize: 11, color: '#475569' },
  reviewComment: { fontSize: 13, color: '#94a3b8', lineHeight: 18 },
});
