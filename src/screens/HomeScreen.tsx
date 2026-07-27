// src/screens/HomeScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
  Dimensions,
  SafeAreaView,
  StatusBar,
  ImageStyle,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Spacing, Radius, Shadow } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { customerApi } from '../services/api';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import LoadingSpinner from '../components/LoadingSpinner';

const { width } = Dimensions.get('window');

const VENDOR_IMGS = [
  'https://media.istockphoto.com/id/2282137289/photo/assortment-of-raw-meat-chicken-beef-veal-carnivore-diet.jpg?s=2048x2048&w=is&k=20&c=c_fxzXu5ws7u6MVmMvYoZvcDZ8qPEa_UFSHFoP66nJ4=',
  'https://media.istockphoto.com/id/860919410/photo/chef-in-hotel-or-restaurant-kitchen-cooking-only-hands-prepared-salmon-steak-with-dill.jpg?s=2048x2048&w=is&k=20&c=7SXxR7FPy6sENQsRCivv1nO9TpcCkIMywT5yVU0ztVI=',
  'https://media.istockphoto.com/id/1475032701/photo/close-view-of-butchers-shop-meat-cuts-display.jpg?s=2048x2048&w=is&k=20&c=uziTblVVhCMC-HJUZnoT4sVK6FK70jG9qqBF7kfbRJ4=',
  'https://media.istockphoto.com/id/1189476532/photo/foods-high-in-zinc.jpg?s=2048x2048&w=is&k=20&c=eCT9yn_2a76S65lNi8dqx0EDv7KUp7flkwQxLsy1I-w=',
];

const CATEGORY_IMGS = [
  'https://media.istockphoto.com/id/998699576/photo/chicken-fillet.jpg?s=2048x2048&w=is&k=20&c=FAVoiLQxWq-z9duRqDdkIG7FtN2Tx-NsQnKKcqYjAzU=',
  'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?q=80&w=300&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?q=80&w=300&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?q=80&w=300&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1628268909376-e8c4dfedb180?q=80&w=300&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1514326640560-7d063ef2aed5?q=80&w=300&auto=format&fit=crop',
];

export default function HomeScreen({ navigation }: any) {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [vendors, setVendors] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const loadData = async () => {
    try {
      const [vendorsRes, catsRes] = await Promise.all([
        customerApi.getVendors(),
        customerApi.getCategories(),
      ]);
      if (vendorsRes.data?.data) setVendors(vendorsRes.data.data);
      if (catsRes.data?.data) setCategories(catsRes.data.data);
    } catch (err) {
      // Silently handle data fetch errors
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [isAuthenticated])
  );

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await customerApi.search(searchQuery);
      setSearchResults(res.data?.data || []);
    } catch (e) {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const toggleFavorite = async (vendorId: number) => {
    try {
      if (favorites.has(vendorId)) {
        await customerApi.removeFavorite(vendorId);
        setFavorites((prev) => {
          const s = new Set(prev);
          s.delete(vendorId);
          return s;
        });
      } else {
        await customerApi.addFavorite(vendorId);
        setFavorites((prev) => new Set(prev).add(vendorId));
      }
    } catch (e) {
      // Silently handle favorite toggle errors
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header bar mirroring web header structure */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoBadge}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.logoImage as ImageStyle}
              resizeMode="contain"
            />
          </View>
        </View>
        <TouchableOpacity
          style={styles.headerCartBtn}
          onPress={() => navigation.navigate('CartTab')}
        >
          <Ionicons name="cart-outline" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* HERO SECTION */}
        <View style={styles.hero}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1603048297172-c92544798d5e?q=80&w=2000&auto=format&fit=crop' }}
            style={styles.heroBg as ImageStyle}
          />
          <View style={styles.heroOverlay} />

          <View style={styles.heroContent}>
            <View style={styles.badgeContainer}>
              <Ionicons name="sparkles" size={12} color={Colors.red} />
              <Text style={styles.badgeText}>PREMIUM FRESHNESS GUARANTEED</Text>
            </View>

            <Text style={styles.heroTitle}>
              Farm-Fresh Cuts,{'\n'}
              <Text style={{ color: Colors.redLight }}>Delivered in Minutes.</Text>
            </Text>

            <Text style={styles.heroDesc}>
              100% traceably fresh meat, cleaned and delivered under strict temperature control.
            </Text>

            <View style={styles.searchBarContainer}>
              <Ionicons name="search-outline" size={20} color={Colors.gray400} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search chicken, steaks, fish..."
                placeholderTextColor={Colors.gray400}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
              />
              <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
                <Text style={styles.searchBtnText}>{searchLoading ? '...' : 'Go'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* SEARCH RESULTS */}
        {searchResults !== null && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Search Results</Text>
                <Text style={styles.sectionSub}>Matching products or vendors</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setSearchResults(null);
                  setSearchQuery('');
                }}
              >
                <Text style={styles.clearSearchBtn}>Clear &times;</Text>
              </TouchableOpacity>
            </View>

            {searchResults.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No matching products or vendors found.</Text>
              </View>
            ) : (
              <FlatList
                data={searchResults}
                keyExtractor={(item, index) => index.toString()}
                numColumns={2}
                scrollEnabled={false}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    style={styles.vendorCard}
                    onPress={() => navigation.navigate('VendorMenu', { id: item.id || item.vendorId })}
                  >
                    <Image
                      source={{ uri: VENDOR_IMGS[index % VENDOR_IMGS.length] }}
                      style={styles.vendorImg as ImageStyle}
                    />
                    <View style={styles.vendorCardInfo}>
                      <Text style={styles.vendorName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.vendorDesc} numberOfLines={1}>
                        {item.description || item.email || 'Premium partner store'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        )}

        {/* PROMO CAROUSEL */}
        {searchResults === null && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.promoScroll}
          >
            {/* Promo Card 1 */}
            <View style={[styles.promoCard, { backgroundColor: '#7f1d1d' }]}>
              <View>
                <Text style={styles.promoBadge}>LIMITED OFFER</Text>
                <Text style={styles.promoTitleText}>Get 20% Cashback{'\n'}On First Order</Text>
              </View>
              <View style={styles.promoFooter}>
                <Text style={styles.promoCode}>Code: FIRST20</Text>
                <Text style={styles.promoCTA}>Order Now</Text>
              </View>
            </View>

            {/* Promo Card 2 */}
            <View style={[styles.promoCard, { backgroundColor: Colors.bgDark }]}>
              <View>
                <Text style={[styles.promoBadge, { backgroundColor: Colors.red }]}>SPECIAL LAUNCH</Text>
                <Text style={styles.promoTitleText}>Gourmet Ribeye Steak{'\n'}Fresh Arrivals</Text>
              </View>
              <View style={styles.promoFooter}>
                <Text style={styles.promoSubtext}>Antibiotic-free local meats</Text>
                <Text style={[styles.promoCTA, { color: Colors.redLight }]}>Browse Steaks</Text>
              </View>
            </View>
          </ScrollView>
        )}

        {/* CATEGORIES */}
        {searchResults === null && (
          <View style={styles.categorySection}>
            <Text style={styles.sectionTitle}>Explore Categories</Text>
            <Text style={styles.sectionSub}>Pick from our premium selections</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}
            >
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <View key={i} style={styles.categoryCardLoader} />
                  ))
                : categories.map((cat, idx) => (
                    <TouchableOpacity key={cat.id || idx} style={styles.categoryCard}>
                      <View style={styles.categoryImgContainer}>
                        <Image
                          source={{ uri: cat.imageUrl || CATEGORY_IMGS[idx % CATEGORY_IMGS.length] }}
                          style={styles.categoryImg as ImageStyle}
                        />
                      </View>
                      <Text style={styles.categoryNameText}>{cat.name}</Text>
                    </TouchableOpacity>
                  ))}
            </ScrollView>
          </View>
        )}

        {/* VENDORS */}
        {searchResults === null && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Trusted Vendors Near You</Text>
            <Text style={styles.sectionSub}>Top-rated certified partner stores delivering locally</Text>

            {loading ? (
              <LoadingSpinner />
            ) : vendors.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No certified vendors online in your area.</Text>
              </View>
            ) : (
              <View style={styles.vendorGrid}>
                {vendors.map((vendor, idx) => (
                  <TouchableOpacity
                    key={vendor.id}
                    style={styles.vendorGridCard}
                    onPress={() => navigation.navigate('VendorMenu', { id: vendor.id })}
                  >
                    <View style={styles.vendorImgWrapper}>
                      <Image
                        source={{ uri: vendor.logoUrl || VENDOR_IMGS[idx % VENDOR_IMGS.length] }}
                        style={styles.vendorImgFull as ImageStyle}
                      />
                      <View style={styles.timeTag}>
                        <Ionicons name="time" size={10} color={Colors.red} />
                        <Text style={styles.timeTagText}>25-45 MINS</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.favBtn}
                        onPress={() => toggleFavorite(vendor.id)}
                      >
                        <Ionicons
                          name={favorites.has(vendor.id) ? 'heart' : 'heart-outline'}
                          size={16}
                          color={favorites.has(vendor.id) ? Colors.red : Colors.textPrimary}
                        />
                      </TouchableOpacity>
                      <View style={[styles.statusTag, { backgroundColor: vendor.status === 'ACTIVE' ? Colors.green : Colors.gray500 }]}>
                        <Text style={styles.statusTagText}>
                          {vendor.status === 'ACTIVE' ? 'OPEN' : 'CLOSED'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.vendorCardDetails}>
                      <View style={styles.vendorTitleRow}>
                        <Text style={styles.vendorCardName} numberOfLines={1}>
                          {vendor.name}
                        </Text>
                        <View style={styles.ratingBadge}>
                          <Ionicons name="star" size={10} color="#eab308" />
                          <Text style={styles.ratingBadgeText}>{vendor.rating || '4.8'}</Text>
                        </View>
                      </View>
                      <Text style={styles.vendorCardDesc} numberOfLines={2}>
                        {vendor.description || vendor.email}
                      </Text>
                      <View style={styles.vendorCardFooter}>
                        <Text style={styles.badgeFooterText}>✓ FSSAI Approved</Text>
                        <Text style={styles.badgeFooterTextPrice}>Best Price</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* TRUST BADGES */}
        <View style={styles.trustSection}>
          <Text style={styles.trustSectionTitle}>Why Choose MeatInMinutes?</Text>
          <View style={styles.trustGrid}>
            <View style={styles.trustCard}>
              <View style={styles.trustIconContainer}>
                <Ionicons name="flash-outline" size={20} color={Colors.red} />
              </View>
              <Text style={styles.trustTitle}>Instant Delivery</Text>
              <Text style={styles.trustDesc}>Under 45 mins local delivery</Text>
            </View>

            <View style={styles.trustCard}>
              <View style={styles.trustIconContainer}>
                <Ionicons name="shield-checkmark-outline" size={20} color={Colors.green} />
              </View>
              <Text style={styles.trustTitle}>FSSAI Hygienic</Text>
              <Text style={styles.trustDesc}>Strictly controlled temperature</Text>
            </View>

            <View style={styles.trustCard}>
              <View style={styles.trustIconContainer}>
                <Ionicons name="ribbon-outline" size={20} color="#f59e0b" />
              </View>
              <Text style={styles.trustTitle}>Premium Cuts</Text>
              <Text style={styles.trustDesc}>Antibiotic-free organic meats</Text>
            </View>

            <View style={styles.trustCard}>
              <View style={styles.trustIconContainer}>
                <Ionicons name="star-outline" size={20} color="#6366f1" />
              </View>
              <Text style={styles.trustTitle}>Best in Market</Text>
              <Text style={styles.trustDesc}>Rated 4.8+ by thousands</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    height: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  logoBadge: {
    backgroundColor: 'transparent',
    width: 50,
    height: 40,
    marginRight: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 120,
    height: 85,
  },
  logoTitle: {
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: -0.5,
    color: Colors.textPrimary,
  },
  headerCartBtn: {
  width: 40,
  height: 40,
  justifyContent: 'center',
  alignItems: 'center',
},
  scrollContent: {
    paddingBottom: Spacing['3xl'],
  },
  hero: {
    position: 'relative',
    height: 260,
    padding: Spacing.base,
    justifyContent: 'center',
  },
  heroBg: {
    ...StyleSheet.absoluteFillObject,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9, 9, 11, 0.75)',
  },
  heroContent: {
    zIndex: 10,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    gap: 6,
    marginBottom: Spacing.sm,
  },
  badgeText: {
    color: Colors.redLight,
    fontWeight: '800',
    fontSize: 9,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 28,
    marginBottom: Spacing.xs,
  },
  heroDesc: {
    color: Colors.zinc400,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: Spacing.base,
    maxWidth: '85%',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.base,
    height: 46,
    borderWidth: 1,
    borderColor: Colors.gray100,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  searchBtn: {
    backgroundColor: Colors.red,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.base,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  sectionContainer: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  sectionSub: {
    fontSize: 11,
    color: Colors.gray500,
    marginTop: 2,
  },
  clearSearchBtn: {
    color: Colors.red,
    fontWeight: '700',
    fontSize: 12,
  },
  emptyContainer: {
    backgroundColor: Colors.gray50,
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.gray100,
  },
  emptyText: {
    color: Colors.gray500,
    fontWeight: '600',
    fontSize: 13,
  },
  vendorCard: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 4,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.gray100,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  vendorImg: {
    height: 100,
    width: '100%',
  },
  vendorCardInfo: {
    padding: Spacing.sm,
  },
  vendorName: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  vendorDesc: {
    fontSize: 10,
    color: Colors.gray500,
    marginTop: 2,
  },
  promoScroll: {
    paddingLeft: Spacing.base,
    paddingRight: Spacing.xs,
    paddingTop: Spacing.base,
    gap: Spacing.base,
  },
  promoCard: {
    width: width * 0.75,
    height: 140,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    justifyContent: 'space-between',
    marginRight: Spacing.xs,
  },
  promoBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: '#fff',
    fontSize: 8,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  promoTitleText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
  promoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  promoCode: {
    color: '#fef08a',
    fontWeight: '700',
    fontSize: 11,
  },
  promoSubtext: {
    color: Colors.zinc400,
    fontSize: 10,
  },
  promoCTA: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  categorySection: {
    paddingTop: Spacing.lg,
    paddingLeft: Spacing.base,
  },
  categoryScroll: {
    paddingTop: Spacing.md,
    paddingRight: Spacing.base,
    gap: Spacing.md,
  },
  categoryCardLoader: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.gray100,
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: Spacing.xs,
  },
  categoryImgContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: '#fff',
    overflow: 'hidden',
    ...Shadow.sm,
  },
  categoryImg: {
    width: '100%',
    height: '100%',
  },
  categoryNameText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.gray800,
    marginTop: Spacing.xs,
  },
  vendorGrid: {
    gap: Spacing.base,
    marginTop: Spacing.sm,
  },
  vendorGridCard: {
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.gray100,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  vendorImgWrapper: {
    height: 140,
    position: 'relative',
  },
  vendorImgFull: {
    width: '100%',
    height: '100%',
  },
  timeTag: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  timeTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  favBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 99,
    padding: 6,
  },
  statusTag: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusTagText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
  vendorCardDetails: {
    padding: Spacing.base,
  },
  vendorTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  vendorCardName: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fefcbf',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  ratingBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#854d0e',
  },
  vendorCardDesc: {
    fontSize: 11,
    color: Colors.gray500,
    lineHeight: 15,
    marginBottom: Spacing.base,
  },
  vendorCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
    paddingTop: Spacing.sm,
  },
  badgeFooterText: {
    fontSize: 10,
    color: Colors.gray500,
    fontWeight: '600',
  },
  badgeFooterTextPrice: {
    fontSize: 10,
    color: Colors.green,
    fontWeight: '700',
  },
  trustSection: {
    backgroundColor: Colors.bgDark,
    paddingVertical: Spacing['2xl'],
    paddingHorizontal: Spacing.base,
    marginTop: Spacing['2xl'],
  },
  trustSectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  trustGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  trustCard: {
    width: (width - Spacing.base * 2 - Spacing.md) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    textAlign: 'center',
  },
  trustIconContainer: {
    backgroundColor: '#000',
    borderRadius: Radius.sm,
    padding: 8,
    marginBottom: Spacing.sm,
  },
  trustTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2,
  },
  trustDesc: {
    color: Colors.zinc400,
    fontSize: 9,
    textAlign: 'center',
  },
});
