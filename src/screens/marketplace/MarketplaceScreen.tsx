import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { MarketplaceStackParamList, Product } from '../../types';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/common/Badge';

type Nav = NativeStackNavigationProp<MarketplaceStackParamList, 'Marketplace'>;

const CATEGORIES = [
  { id: 'all', label: 'All', icon: 'grid-outline' },
  { id: 'dj_set', label: 'DJ Sets', icon: 'musical-notes-outline' },
  { id: 'sample_pack', label: 'Sample Packs', icon: 'layers-outline' },
  { id: 'preset', label: 'Presets', icon: 'options-outline' },
  { id: 'tutorial', label: 'Tutorials', icon: 'play-circle-outline' },
  { id: 'merchandise', label: 'Merchandise', icon: 'shirt-outline' },
  { id: 'ticket', label: 'Tickets', icon: 'ticket-outline' },
];

const MOCK_PRODUCTS: Product[] = Array.from({ length: 20 }, (_, i) => ({
  id: `prod-${i}`,
  sellerId: `seller-${i}`,
  sellerName: ['DJ Pulse', 'Nova Sound', 'Electra', 'Bass Theory', 'Phantom', 'Sonic Drive', 'Aurora', 'Neon Flux', 'Crystal', 'Dark Matter'][i % 10],
  title: ['Tech House Massive Vol.1', 'Deep Vibes Bundle', 'Trance Essentials Pack', 'Drum & Bass Kit', 'Techno Tools Vol.2', 'Melodic Loops Pack', 'Afro House Collection', 'Minimal Grooves', 'Progressive Presets', 'Dark Techno Kit', 'Club Hits 2026', 'Underground Sounds', 'Festival Ready Pack', 'Peak Time Bundle', 'Deep House Classics', 'Tech Essentials', 'Rave Toolkit', 'Studio Session Vol.3', 'Live Recording Bundle', 'DJ Starter Pack'][i],
  description: 'Premium quality audio content for professional DJs and producers.',
  price: [8.99, 15.99, 24.99, 12.99, 19.99, 9.99, 34.99, 7.99, 29.99, 11.99, 16.99, 22.99, 39.99, 14.99, 6.99, 18.99, 27.99, 49.99, 33.99, 4.99][i],
  currency: 'USD',
  category: (['dj_set', 'sample_pack', 'preset', 'dj_set', 'sample_pack', 'sample_pack', 'dj_set', 'preset', 'preset', 'sample_pack', 'dj_set', 'sample_pack', 'merchandise', 'dj_set', 'dj_set', 'sample_pack', 'merchandise', 'dj_set', 'dj_set', 'tutorial'] as Product['category'][])[i],
  coverUrl: undefined,
  fileUrl: undefined,
  salesCount: [340, 218, 156, 82, 445, 198, 67, 122, 89, 203, 178, 95, 44, 567, 234, 311, 78, 189, 112, 445][i],
  rating: 4.0 + (i % 10) * 0.1,
  reviewsCount: [42, 18, 23, 11, 67, 29, 8, 15, 14, 31, 22, 12, 5, 88, 34, 45, 9, 26, 17, 72][i],
  tags: ['house', 'techno', 'electronic'],
  status: 'active',
  createdAt: '2026-01-01',
}));

const SORT_OPTIONS = ['Best Sellers', 'Newest', 'Price: Low', 'Price: High', 'Top Rated'];

export default function MarketplaceScreen() {
  const navigation = useNavigation<Nav>();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('Best Sellers');

  const filtered = MOCK_PRODUCTS.filter((p) => {
    const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const categoryIcon: Record<string, keyof typeof Ionicons.glyphMap> = {
    dj_set: 'disc',
    sample_pack: 'layers',
    preset: 'options',
    tutorial: 'play-circle',
    merchandise: 'shirt',
    ticket: 'ticket',
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
      activeOpacity={0.8}
    >
      <View style={styles.productCover}>
        <Ionicons name={categoryIcon[item.category] || 'disc'} size={32} color="#7c3aed" />
        {item.salesCount > 200 && (
          <View style={styles.bestsellerBadge}>
            <Text style={styles.bestsellerText}>BEST SELLER</Text>
          </View>
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.productSeller}>{item.sellerName}</Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={12} color="#f59e0b" />
          <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
          <Text style={styles.reviewsText}>({item.reviewsCount})</Text>
        </View>
        <View style={styles.productFooter}>
          <Text style={styles.productPrice}>${item.price}</Text>
          <TouchableOpacity style={styles.buyBtn}>
            <Text style={styles.buyBtnText}>Buy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <PageHeader title="Marketplace" subtitle="DJ sets, samples, presets and more" />

      <View style={styles.mainLayout}>
        {/* Left sidebar: categories */}
        <View style={styles.categorySidebar}>
          <Text style={styles.categoryHeader}>CATEGORIES</Text>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryItem, selectedCategory === cat.id && styles.categoryItemActive]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Ionicons
                name={cat.icon as any}
                size={16}
                color={selectedCategory === cat.id ? '#a78bfa' : '#64748b'}
              />
              <Text style={[styles.categoryLabel, selectedCategory === cat.id && styles.categoryLabelActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}

          <Text style={[styles.categoryHeader, { marginTop: 20 }]}>SORT BY</Text>
          {SORT_OPTIONS.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.sortItem, sort === s && styles.sortItemActive]}
              onPress={() => setSort(s)}
            >
              <Text style={[styles.sortLabel, sort === s && styles.sortLabelActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Main content */}
        <View style={styles.mainContent}>
          {/* Search */}
          <View style={styles.searchBar}>
            <View style={styles.searchWrapper}>
              <Ionicons name="search-outline" size={18} color="#64748b" />
              <TextInput
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
                placeholder="Search products..."
                placeholderTextColor="#3d4460"
              />
            </View>
            <Text style={styles.resultsCount}>{filtered.length} products</Text>
          </View>

          {/* Product grid — 4 columns */}
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={renderProduct}
            numColumns={4}
            contentContainerStyle={styles.grid}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  mainLayout: { flex: 1, flexDirection: 'row' },
  categorySidebar: {
    width: 200,
    borderRightWidth: 1,
    borderRightColor: '#1e1e2e',
    padding: 16,
  },
  categoryHeader: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    marginBottom: 2,
  },
  categoryItemActive: {
    backgroundColor: 'rgba(124,58,237,0.12)',
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b',
  },
  categoryLabelActive: {
    color: '#a78bfa',
    fontWeight: '700',
  },
  sortItem: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    marginBottom: 2,
  },
  sortItemActive: { backgroundColor: 'rgba(124,58,237,0.08)' },
  sortLabel: { fontSize: 12, color: '#64748b' },
  sortLabelActive: { color: '#a78bfa', fontWeight: '600' },
  mainContent: { flex: 1 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2e',
    gap: 14,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#13131a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e1e2e',
    paddingHorizontal: 14,
    height: 42,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#f1f5f9' },
  resultsCount: { fontSize: 13, color: '#64748b' },
  grid: { padding: 14, paddingBottom: 24 },
  productCard: {
    flex: 1,
    margin: 5,
    backgroundColor: '#13131a',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e1e2e',
    overflow: 'hidden',
  },
  productCover: {
    height: 110,
    backgroundColor: 'rgba(124,58,237,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2e',
  },
  bestsellerBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#f59e0b',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  bestsellerText: { fontSize: 8, fontWeight: '800', color: '#000' },
  productInfo: { padding: 12 },
  productTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: 3,
    lineHeight: 17,
  },
  productSeller: { fontSize: 11, color: '#64748b', marginBottom: 5 },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 8,
  },
  ratingText: { fontSize: 12, fontWeight: '700', color: '#f1f5f9' },
  reviewsText: { fontSize: 11, color: '#64748b' },
  productFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productPrice: { fontSize: 16, fontWeight: '800', color: '#a78bfa' },
  buyBtn: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  buyBtnText: { fontSize: 12, fontWeight: '700', color: '#fff' },
});
