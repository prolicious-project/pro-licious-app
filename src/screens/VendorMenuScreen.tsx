// src/screens/VendorMenuScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Radius, Shadow } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../lib/axios';
import { useDispatch, useSelector } from 'react-redux';
import { setCart, addItem, updateQuantity } from '../store/slices/cartSlice';
import { RootState } from '../store/store';
import LoadingSpinner from '../components/LoadingSpinner';

const { width } = Dimensions.get('window');

export default function VendorMenuScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const { id } = route.params;

  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const cartItems = useSelector((state: RootState) => state.cart.items);

  const [vendor, setVendor] = useState<any>(null);
  const [menu, setMenu] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('');

  const fetchAndSyncCart = async (vendorIdVal: number, menuItemsList: any[]) => {
    try {
      const cartRes = await api.get(`/api/customer/cart`);
      const activeCarts = cartRes.data?.data || [];
      const vendorCart = activeCarts.find((c: any) => c.vendorId === vendorIdVal);
      if (vendorCart) {
        const reduxItems = vendorCart.items.map((ci: any) => {
          const menuItem = menuItemsList.find((mi: any) => mi.id === ci.menuItemId) || {};
          return {
            id: ci.menuItemId,
            cartItemId: ci.id,
            name: menuItem.name || 'Item',
            price: ci.price,
            quantity: ci.quantity,
            vendorId: vendorIdVal,
          };
        });
        dispatch(setCart({ items: reduxItems, vendorId: vendorIdVal }));
      } else {
        dispatch(setCart({ items: [], vendorId: null }));
      }
    } catch (e) {
      console.error('Error syncing cart:', e);
    }
  };

  useEffect(() => {
    Promise.all([
      api.get(`/api/customer/vendors/${id}`),
      api.get(`/api/customer/vendors/${id}/menu`),
    ])
      .then(async ([vendorRes, menuRes]) => {
        setVendor(vendorRes.data?.data);
        const cats = menuRes.data?.data?.categories || [];
        const rawItems = menuRes.data?.data?.items || [];
        const items = rawItems.map((item: any) => {
          const category = cats.find((c: any) => c.id === item.categoryId);
          return {
            ...item,
            categoryName: category ? category.name : 'Uncategorized',
          };
        });
        setMenu(items);
        if (items.length > 0) {
          setActiveTab(items[0].categoryName || 'Uncategorized');
        }
        if (isAuthenticated) {
          await fetchAndSyncCart(Number(id), items);
        }
      })
      .catch((err) => console.error('Error fetching vendor data:', err))
      .finally(() => setLoading(false));
  }, [isAuthenticated, id]);

  const handleAddItem = async (item: any) => {
    if (!isAuthenticated) {
      dispatch(addItem({
        id: item.id,
        name: item.name,
        price: String(item.price),
        quantity: 1,
        vendorId: Number(id),
      }));
      return;
    }
    try {
      await api.post('/api/customer/cart/items', {
        vendorId: Number(id),
        menuItemId: item.id,
        quantity: 1,
      });
      await fetchAndSyncCart(Number(id), menu);
    } catch (e) {
      console.error('Error adding item to cart:', e);
    }
  };

  const handleUpdateQuantity = async (item: any, newQty: number) => {
    if (!isAuthenticated) {
      dispatch(updateQuantity({ id: item.id, quantity: newQty }));
      return;
    }
    try {
      const currentItem = cartItems.find((i) => i.id === item.id);
      if (!currentItem) return;

      if (newQty <= 0) {
        if (currentItem.cartItemId) {
          await api.delete(`/api/customer/cart/items/${currentItem.cartItemId}`);
        }
      } else {
        if (currentItem.cartItemId) {
          await api.patch(`/api/customer/cart/items/${currentItem.cartItemId}`, { quantity: newQty });
        }
      }
      await fetchAndSyncCart(Number(id), menu);
    } catch (e) {
      console.error('Error updating cart quantity:', e);
    }
  };

  const getQty = (itemId: number) => cartItems.find((i) => i.id === itemId)?.quantity || 0;
  const cartTotal = cartItems.reduce((acc, i) => acc + parseFloat(i.price) * i.quantity, 0);
  const cartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  const categories = [...new Set(menu.map((i: any) => i.categoryName || 'Menu'))];

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!vendor) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Vendor not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Back button header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
          <Text style={styles.backText}>Home</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Vendor Banner */}
        <View style={styles.bannerContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1607006411061-0b5c1fb981f4?q=80&w=1200&auto=format&fit=crop' }}
            style={styles.bannerImg as any}
          />
          <View style={styles.bannerOverlay} />
          <View style={styles.bannerTextContainer}>
            <View style={[styles.statusTag, { backgroundColor: vendor.status === 'ACTIVE' ? Colors.green : Colors.gray500 }]}>
              <Text style={styles.statusTagText}>
                {vendor.status === 'ACTIVE' ? 'OPEN NOW' : 'CLOSED'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              {vendor.logoUrl ? (
                <Image source={{ uri: vendor.logoUrl }} style={styles.vendorLogoIcon} />
              ) : (
                <View style={styles.defaultLogoBadge}>
                  <Ionicons name="storefront-outline" size={20} color="#dc2626" />
                </View>
              )}
              <Text style={styles.vendorName}>{vendor.name}</Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="star" size={14} color="#eab308" />
              <Text style={styles.metaText}>4.8 • 25-40 min</Text>
              {vendor.phone && <Text style={styles.metaText}>• {vendor.phone}</Text>}
            </View>
          </View>
        </View>

        {/* Category Tab Selector */}
        {categories.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryBar}
            contentContainerStyle={styles.categoryBarContent}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setActiveTab(cat)}
                style={[styles.categoryTab, activeTab === cat && styles.activeCategoryTab]}
              >
                <Text style={[styles.categoryTabText, activeTab === cat && styles.activeCategoryTabText]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Menu list */}
        <View style={styles.menuContainer}>
          {menu
            .filter((item) => !activeTab || (item.categoryName || 'Menu') === activeTab)
            .map((item) => {
              const qty = getQty(item.id);
              const available =
                typeof item.isAvailable !== 'undefined'
                  ? item.isAvailable
                  : item.status === 'ACTIVE' &&
                    (item.stockQuantity === -1 ||
                      (typeof item.stockQuantity === 'number' && item.stockQuantity > 0));

              return (
                <View key={item.id} style={styles.menuItemCard}>
                  <View style={styles.itemInfo}>
                    {!available && <Text style={styles.outOfStock}>OUT OF STOCK</Text>}
                    <Text style={styles.itemName}>{item.name}</Text>
                    {item.description && (
                      <Text style={styles.itemDesc} numberOfLines={2}>
                        {item.description}
                      </Text>
                    )}
                    <View style={styles.priceRow}>
                      <Text style={styles.itemPrice}>₹{parseFloat(item.price).toFixed(0)}</Text>
                      {item.isVeg !== undefined && (
                        <View style={[styles.vegBadge, { borderColor: item.isVeg ? '#10b981' : '#ef4444' }]}>
                          <Text style={[styles.vegText, { color: item.isVeg ? '#15803d' : '#b91c1c' }]}>
                            {item.isVeg ? '🟢 VEG' : '🔴 NON-VEG'}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={styles.itemAction}>
                    <Image
                      source={{ uri: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?q=80&w=200&auto=format&fit=crop' }}
                      style={styles.itemImg as any}
                    />
                    <View style={styles.qtyContainer}>
                      {qty === 0 ? (
                        <TouchableOpacity
                          style={[styles.addBtn, !available && styles.addBtnDisabled]}
                          onPress={() => handleAddItem(item)}
                          disabled={!available}
                        >
                          <Text style={styles.addBtnText}>ADD +</Text>
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.qtyRow}>
                          <TouchableOpacity
                            style={styles.qtyBtn}
                            onPress={() => handleUpdateQuantity(item, qty - 1)}
                          >
                            <Ionicons name="remove" size={14} color={Colors.red} />
                          </TouchableOpacity>
                          <Text style={styles.qtyVal}>{qty}</Text>
                          <TouchableOpacity
                            style={styles.qtyBtn}
                            onPress={() => handleUpdateQuantity(item, qty + 1)}
                          >
                            <Ionicons name="add" size={14} color={Colors.red} />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
        </View>
      </ScrollView>

      {/* Floating Bottom Cart Bar */}
      {cartCount > 0 && (
        <View style={styles.cartBar}>
          <View>
            <Text style={styles.cartBarCount}>{cartCount} Item{cartCount > 1 ? 's' : ''}</Text>
            <Text style={styles.cartBarPrice}>₹{cartTotal.toFixed(0)}</Text>
          </View>
          <TouchableOpacity
            style={styles.cartBarBtn}
            onPress={() => navigation.navigate('CartTab')}
          >
            <Text style={styles.cartBarBtnText}>View Cart</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  header: {
    height: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
    justifyContent: 'center',
    paddingHorizontal: Spacing.base,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
  },
  backText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  bannerContainer: {
    height: 180,
    position: 'relative',
    justifyContent: 'flex-end',
    padding: Spacing.base,
  },
  bannerImg: {
    ...StyleSheet.absoluteFillObject,
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  bannerTextContainer: {
    zIndex: 10,
  },
  statusTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    marginBottom: Spacing.sm,
  },
  statusTagText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
  vendorName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: Colors.zinc300,
    fontSize: 12,
    fontWeight: '600',
  },
  categoryBar: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  categoryBarContent: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  categoryTab: {
    paddingHorizontal: Spacing.base,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  activeCategoryTab: {
    backgroundColor: Colors.red,
    borderColor: Colors.red,
  },
  categoryTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.gray500,
  },
  activeCategoryTabText: {
    color: '#fff',
  },
  menuContainer: {
    padding: Spacing.base,
    gap: Spacing.base,
  },
  menuItemCard: {
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: Spacing.base,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.gray100,
    ...Shadow.sm,
  },
  itemInfo: {
    flex: 1,
    marginRight: Spacing.base,
  },
  outOfStock: {
    color: Colors.gray400,
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  itemDesc: {
    fontSize: 12,
    color: Colors.gray500,
    lineHeight: 16,
    marginBottom: Spacing.base,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  vegBadge: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  vegText: {
    fontSize: 8,
    fontWeight: '900',
  },
  itemAction: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
  },
  itemImg: {
    width: 80,
    height: 60,
    borderRadius: Radius.sm,
    marginBottom: -10,
    backgroundColor: Colors.gray100,
  },
  qtyContainer: {
    width: 84,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.redBorder,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    ...Shadow.sm,
    zIndex: 10,
  },
  addBtn: {
    paddingVertical: 6,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  addBtnDisabled: {
    opacity: 0.4,
  },
  addBtnText: {
    color: Colors.red,
    fontSize: 12,
    fontWeight: '900',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.redBg,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  qtyBtn: {
    padding: 2,
  },
  qtyVal: {
    color: Colors.red,
    fontWeight: '900',
    fontSize: 12,
  },
  cartBar: {
    position: 'absolute',
    bottom: Spacing.base,
    left: Spacing.base,
    right: Spacing.base,
    backgroundColor: Colors.bgDark,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Shadow.lg,
  },
  cartBarCount: {
    color: Colors.zinc400,
    fontSize: 10,
    fontWeight: '600',
  },
  cartBarPrice: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
  cartBarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.red,
    paddingHorizontal: Spacing.base,
    paddingVertical: 8,
    borderRadius: Radius.sm,
  },
  cartBarBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    marginRight: 4,
  },
  vendorLogoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fff',
  },
  defaultLogoBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
