// src/screens/vendor/VendorOrdersScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { api } from '../../lib/axios';
import { Colors, Spacing, Radius, Shadow } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function VendorOrdersScreen({ navigation }: any) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');

  const fetchOrders = async () => {
    try {
      const res = await api.get('/api/vendor/orders', {
        params: filterStatus ? { status: filterStatus } : {},
      });
      setOrders(res.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
          <Text style={styles.headerTitle}>All Orders</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
        {[
          { label: 'All', value: '' },
          { label: 'Placed', value: 'PLACED' },
          { label: 'Accepted', value: 'ACCEPTED' },
          { label: 'Preparing', value: 'PREPARING' },
          { label: 'Ready', value: 'READY' },
          { label: 'Delivered', value: 'DELIVERED' },
        ].map((item) => (
          <TouchableOpacity
            key={item.value}
            onPress={() => setFilterStatus(item.value)}
            style={[styles.filterTab, filterStatus === item.value && styles.activeFilterTab]}
          >
            <Text style={[styles.filterTabText, filterStatus === item.value && styles.activeFilterTabText]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No orders match the filter.</Text>
          </View>
        ) : (
          orders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderNumber}>Order #{order.orderNumber}</Text>
                <Text style={styles.orderStatusText}>{order.status}</Text>
              </View>
              <View style={styles.orderItems}>
                {order.items?.map((item: any) => (
                  <Text key={item.id} style={styles.itemText}>
                    • {item.itemName || item.name} &times; {item.quantity}
                  </Text>
                ))}
              </View>
              <Text style={styles.orderPrice}>Total: ₹{parseFloat(order.totalAmount).toFixed(0)}</Text>
            </View>
          ))
        )}
      </ScrollView>
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
    justifyContent: 'center',
    paddingHorizontal: Spacing.base,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  filterBar: {
    maxHeight: 52,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
    paddingVertical: 10,
    paddingHorizontal: Spacing.base,
  },
  filterTab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.gray200,
    marginRight: Spacing.sm,
  },
  activeFilterTab: {
    backgroundColor: Colors.red,
    borderColor: Colors.red,
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.gray500,
  },
  activeFilterTabText: {
    color: '#fff',
  },
  scrollContent: {
    padding: Spacing.base,
    gap: Spacing.base,
  },
  emptyContainer: {
    backgroundColor: '#fff',
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray100,
  },
  emptyText: {
    color: Colors.gray400,
    fontSize: 12,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.gray100,
    ...Shadow.sm,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  orderNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  orderStatusText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.red,
  },
  orderItems: {
    marginBottom: Spacing.sm,
  },
  itemText: {
    fontSize: 12,
    color: Colors.gray700,
  },
  orderPrice: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
});
