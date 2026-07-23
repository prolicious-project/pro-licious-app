// src/screens/vendor/VendorDashboardScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { RootState } from '../../store/store';
import { api } from '../../lib/axios';
import { Colors, Spacing, Radius, Shadow } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function VendorDashboardScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [summary, setSummary] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [summaryRes, ordersRes] = await Promise.all([
        api.get('/api/vendor/analytics/summary'),
        api.get('/api/vendor/orders'),
      ]);
      setSummary(summaryRes.data?.data);
      setOrders(ordersRes.data?.data || []);
    } catch (e) {
      console.error('Error fetching vendor dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigation.replace('Login');
      return;
    }
    fetchDashboardData();
  }, [isAuthenticated]);

  const handleUpdateStatus = async (orderId: number, action: 'accept' | 'reject' | 'preparing' | 'ready') => {
    try {
      await api.patch(`/api/vendor/orders/${orderId}/${action}`);
      fetchDashboardData();
    } catch (e) {
      console.error(`Error status update:`, e);
    }
  };

  const handleSignOut = () => {
    dispatch(logout());
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vendor Dashboard</Text>
        <TouchableOpacity onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={22} color={Colors.red} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Analytics Grid */}
        <View style={styles.analyticsGrid}>
          <View style={styles.analyticsCard}>
            <Text style={styles.cardLabel}>Total Earnings</Text>
            <Text style={styles.cardVal}>₹{summary?.totalRevenue || '0.00'}</Text>
          </View>
          <View style={styles.analyticsCard}>
            <Text style={styles.cardLabel}>Orders Completed</Text>
            <Text style={styles.cardVal}>{summary?.totalOrders || '0'}</Text>
          </View>
        </View>

        {/* Recent Orders List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
        </View>

        {orders.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No orders received yet.</Text>
          </View>
        ) : (
          <View style={styles.ordersList}>
            {orders.map((item) => (
              <View key={item.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <Text style={styles.orderNum}>Order #{item.orderNumber}</Text>
                  <Text style={styles.orderStatus}>{item.status}</Text>
                </View>

                <View style={styles.itemsBlock}>
                  {item.items?.map((itemDetail: any) => (
                    <Text key={itemDetail.id} style={styles.itemText}>
                      • {itemDetail.itemName || itemDetail.name} &times; {itemDetail.quantity}
                    </Text>
                  ))}
                </View>

                <Text style={styles.orderAmount}>Total: ₹{parseFloat(item.totalAmount).toFixed(0)}</Text>

                {/* Actions depending on status */}
                {item.status === 'PLACED' && (
                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      style={[styles.btn, styles.rejectBtn]}
                      onPress={() => handleUpdateStatus(item.id, 'reject')}
                    >
                      <Text style={styles.rejectBtnText}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.btn, styles.acceptBtn]}
                      onPress={() => handleUpdateStatus(item.id, 'accept')}
                    >
                      <Text style={styles.acceptBtnText}>Accept</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {item.status === 'ACCEPTED' && (
                  <TouchableOpacity
                    style={[styles.btn, styles.primaryBtn]}
                    onPress={() => handleUpdateStatus(item.id, 'preparing')}
                  >
                    <Text style={styles.primaryBtnText}>Start Preparing</Text>
                  </TouchableOpacity>
                )}

                {item.status === 'PREPARING' && (
                  <TouchableOpacity
                    style={[styles.btn, styles.primaryBtn]}
                    onPress={() => handleUpdateStatus(item.id, 'ready')}
                  >
                    <Text style={styles.primaryBtnText}>Mark Ready</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  scrollContent: {
    padding: Spacing.base,
    gap: Spacing.base,
    paddingBottom: Spacing['3xl'],
  },
  sidebarRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.gray100,
    ...Shadow.sm,
  },
  sidebarBtn: {
    alignItems: 'center',
    flex: 1,
  },
  sidebarBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  analyticsGrid: {
    flexDirection: 'row',
    gap: Spacing.base,
  },
  analyticsCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.gray100,
    ...Shadow.sm,
  },
  cardLabel: {
    fontSize: 11,
    color: Colors.gray500,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardVal: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  sectionHeader: {
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  emptyBox: {
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray100,
  },
  emptyText: {
    color: Colors.gray500,
    fontSize: 12,
  },
  ordersList: {
    gap: Spacing.base,
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
  orderNum: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  orderStatus: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.red,
  },
  itemsBlock: {
    marginBottom: Spacing.sm,
  },
  itemText: {
    fontSize: 12,
    color: Colors.gray700,
    lineHeight: 16,
  },
  orderAmount: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  btn: {
    flex: 1,
    height: 38,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectBtn: {
    borderWidth: 1,
    borderColor: Colors.redBorder,
    backgroundColor: Colors.redBg,
  },
  rejectBtnText: {
    color: Colors.red,
    fontWeight: '800',
    fontSize: 12,
  },
  acceptBtn: {
    backgroundColor: Colors.red,
  },
  acceptBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
  },
  primaryBtn: {
    backgroundColor: Colors.red,
    height: 38,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
  },
});
