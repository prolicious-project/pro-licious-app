// src/screens/OrdersScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { api } from '../lib/axios';
import { Colors, Spacing, Radius, Shadow } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import OrderStatusBadge from '../components/OrderStatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function OrdersScreen() {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/api/customer/orders');
      setOrders(res.data?.data || []);
    } catch (err) {
      console.error('Error fetching customer orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      if (!isAuthenticated) {
        navigation.navigate('Login');
        return;
      }
      fetchOrders();
    }
  }, [isAuthenticated, isFocused]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="receipt-outline" size={44} color={Colors.gray400} />
          </View>
          <Text style={styles.emptyTitle}>No orders placed yet</Text>
          <Text style={styles.emptySub}>
            You haven't placed any orders with Pro-Licious yet. Explore fresh meat options now!
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => navigation.navigate('HomeTab')}
          >
            <Text style={styles.exploreBtnText}>Explore Vendors</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.orderCard}
              onPress={() => navigation.navigate('OrderDetail', { id: item.id })}
            >
              <View style={styles.cardHeader}>
                <View style={styles.numberRow}>
                  <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
                  <OrderStatusBadge status={item.status} />
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.gray400} />
              </View>

              <View style={styles.cardDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={14} color={Colors.gray400} />
                  <Text style={styles.detailText}>{formatDate(item.createdAt)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="storefront-outline" size={14} color={Colors.gray400} />
                  <Text style={styles.detailText}>Vendor #{item.vendorId}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Amount:</Text>
                  <Text style={styles.totalVal}>₹{parseFloat(item.totalAmount).toFixed(0)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
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
  listContent: {
    padding: Spacing.base,
    gap: Spacing.base,
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
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
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
    lineHeight: 16,
  },
  exploreBtn: {
    backgroundColor: Colors.red,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 12,
    borderRadius: Radius.md,
    ...Shadow.md,
  },
  exploreBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.gray100,
    ...Shadow.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.red,
  },
  cardDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    color: Colors.gray550 || '#555555',
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
    paddingTop: Spacing.sm,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 12,
    color: Colors.gray500,
    fontWeight: '600',
  },
  totalVal: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
});
