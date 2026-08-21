// src/screens/CartScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { api } from '../lib/axios';
import { setCart, updateQuantity, removeItem, clearCart } from '../store/slices/cartSlice';
import { Colors, Spacing, Radius, Shadow } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import LoadingSpinner from '../components/LoadingSpinner';

export default function CartScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const { isAuthenticated, isGuest } = useSelector((state: RootState) => state.auth);
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const vendorId = useSelector((state: RootState) => state.cart.vendorId);
  const [loading, setLoading] = useState(true);
  const fetchCart = async () => {
    try {
      const res = await api.get('/api/customer/cart');
      const activeCarts = res.data?.data || [];
      if (activeCarts.length > 0) {
        const cart = activeCarts[0];
        const items = cart.items.map((item: any) => ({
          id: item.menuItemId,
          cartItemId: item.id,
          name: item.menuItemName || item.name || `Item #${item.menuItemId}`,
          price: item.price,
          quantity: item.quantity,
          vendorId: cart.vendorId,
       }));
         dispatch(setCart({ items, vendorId: cart.vendorId }));
      } else {
        dispatch(setCart({ items: [], vendorId: null }));
      }
    } catch (e) {
      console.error('Error fetching cart:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      if (isAuthenticated) {
        // Sync cart from server for logged-in users
        fetchCart();
      } else {
        // Guests see local cart state (from Redux) — no server sync needed
        setLoading(false);
      }
    }
  }, [isAuthenticated, isGuest, isFocused]);

  const handleUpdateQty = async (itemId: number, newQty: number) => {
    if (!isAuthenticated) {
      dispatch(updateQuantity({ id: itemId, quantity: newQty }));
      return;
    }
    try {
      if (newQty <= 0) {
        await api.delete(`/api/customer/cart/items/${itemId}`);
      } else {
        await api.patch(`/api/customer/cart/items/${itemId}`, { quantity: newQty });
      }
      await fetchCart();
    } catch (e) {
      console.error('Error updating cart item:', e);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    if (!isAuthenticated) {
      dispatch(removeItem(itemId));
      return;
    }
    try {
      await api.delete(`/api/customer/cart/items/${itemId}`);
      await fetchCart();
    } catch (e) {
      console.error('Error removing cart item:', e);
    }
  };

  const handleClearCart = async () => {
    if (!isAuthenticated) {
      dispatch(clearCart());
      return;
    }
    try {
      await api.delete('/api/customer/cart', { params: vendorId ? { vendorId } : {} });
      await fetchCart();
    } catch (e) {
      console.error('Error clearing cart:', e);
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + parseFloat(item.price) * item.quantity, 0);
  const deliveryFee = 40;
  const tax = subtotal * 0.05;
  const grandTotal = subtotal > 0 ? subtotal + deliveryFee + tax : 0;

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="basket" size={44} color={Colors.red} />
          </View>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySub}>Explore fresh meat options nearby.</Text>
          <TouchableOpacity
            style={styles.shopBtn}
            onPress={() => navigation.navigate('HomeTab')}
          >
            <Text style={styles.shopBtnText}>Go to Shop</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Header info */}
            <View style={styles.vendorHeader}>
              <Text style={styles.vendorHeaderText}>Items from Vendor #{vendorId}</Text>
              <TouchableOpacity onPress={handleClearCart}>
                <Text style={styles.clearCartText}>Clear Cart</Text>
              </TouchableOpacity>
            </View>

            {/* Cart Items List */}
            <View style={styles.itemsList}>
              {cartItems.map((item) => (
                <View key={item.id} style={styles.cartItemCard}>
                  <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?q=80&w=200&auto=format&fit=crop' }}
                    style={styles.itemImg}
                  />
                  <View style={styles.itemMeta}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.itemPrice}>₹{parseFloat(item.price).toFixed(0)}</Text>
                  </View>

                  <View style={styles.qtyRow}>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => handleUpdateQty(item.cartItemId || item.id, item.quantity - 1)}
                    >
                      <Ionicons name="remove" size={12} color={Colors.red} />
                    </TouchableOpacity>
                    <Text style={styles.qtyVal}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => handleUpdateQty(item.cartItemId || item.id, item.quantity + 1)}
                    >
                      <Ionicons name="add" size={12} color={Colors.red} />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => handleRemoveItem(item.cartItemId || item.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color={Colors.gray400} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Order Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Order Summary</Text>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryVal}>₹{subtotal.toFixed(2)}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Fee</Text>
                <Text style={styles.summaryVal}>₹{deliveryFee.toFixed(2)}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>GST (5%)</Text>
                <Text style={styles.summaryVal}>₹{tax.toFixed(2)}</Text>
              </View>

              <View style={[styles.summaryRow, styles.grandTotalRow]}>
                <Text style={styles.grandTotalLabel}>Grand Total</Text>
                <Text style={styles.grandTotalVal}>₹{grandTotal.toFixed(2)}</Text>
              </View>
            </View>
          </ScrollView>

          {/* Bottom Checkout Action */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={() => {
                if (isAuthenticated) {
                  // Fully logged in — go straight to checkout
                  navigation.navigate('Checkout');
                } else {
                  // Guest — must log in before placing an order
                  navigation.navigate('Login', { returnToCheckout: true });
                }
              }}
            >
              {!isAuthenticated && (
                <Ionicons name="lock-closed-outline" size={15} color="#fff" style={{ marginRight: 6 }} />
              )}
              <Text style={styles.checkoutBtnText}>
                {isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'}
              </Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
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
  header: {
    height: 56,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['2xl'],
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.redBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.redBorder,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 12,
    color: Colors.gray500,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  shopBtn: {
    backgroundColor: Colors.red,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 12,
    borderRadius: Radius.md,
    ...Shadow.md,
  },
  shopBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  vendorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  vendorHeaderText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  clearCartText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.red,
  },
  itemsList: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  cartItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray100,
    ...Shadow.sm,
  },
  itemImg: {
    width: 48,
    height: 48,
    borderRadius: Radius.sm,
    marginRight: Spacing.md,
    backgroundColor: Colors.gray100,
  },
  itemMeta: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  itemPrice: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.red,
    marginTop: 2,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.redBg,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.redBorder,
    marginRight: Spacing.md,
  },
  qtyBtn: {
    padding: 2,
  },
  qtyVal: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.red,
    marginHorizontal: 8,
  },
  removeBtn: {
    padding: 4,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: Radius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.gray100,
    ...Shadow.sm,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.gray500,
    fontWeight: '600',
  },
  summaryVal: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
    paddingTop: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: 0,
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  grandTotalVal: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.red,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
    padding: Spacing.base,
  },
  checkoutBtn: {
    backgroundColor: Colors.red,
    borderRadius: Radius.md,
    height: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    ...Shadow.md,
  },
  checkoutBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
});
