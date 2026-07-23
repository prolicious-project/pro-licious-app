// src/screens/admin/AdminDashboardScreen.tsx
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

export default function AdminDashboardScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [liveStats, setLiveStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      const [statsRes, ordersRes] = await Promise.all([
        api.get('/api/admin/dashboard/live'),
        api.get('/api/admin/orders'),
      ]);
      setLiveStats(statsRes.data?.data);
      setOrders(ordersRes.data?.data || []);
    } catch (e) {
      console.error('Error fetching admin stats:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigation.replace('Login');
      return;
    }
    fetchAdminData();
  }, [isAuthenticated]);

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
        <Text style={styles.headerTitle}>System Admin Console</Text>
        <TouchableOpacity onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={22} color={Colors.red} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Live System Counter Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Active Orders</Text>
            <Text style={styles.statVal}>{liveStats?.activeOrders || '0'}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Online Vendors</Text>
            <Text style={styles.statVal}>{liveStats?.onlineVendors || '0'}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Online Riders</Text>
            <Text style={styles.statVal}>{liveStats?.onlineRiders || '0'}</Text>
          </View>
        </View>

        {/* Recent System Orders */}
        <Text style={styles.sectionTitle}>Recent System Orders</Text>
        {orders.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No orders registered globally yet.</Text>
          </View>
        ) : (
          <View style={styles.ordersList}>
            {orders.map((item) => (
              <View key={item.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <Text style={styles.orderNum}>Order #{item.orderNumber}</Text>
                  <Text style={styles.orderStatus}>{item.status}</Text>
                </View>
                <View style={styles.orderDetails}>
                  <Text style={styles.detailText}>Vendor ID: #{item.vendorId}</Text>
                  <Text style={styles.detailText}>Rider ID: #{item.riderId || 'Unassigned'}</Text>
                  <Text style={styles.detailText}>Amount: ₹{parseFloat(item.totalAmount).toFixed(0)}</Text>
                </View>
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
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray100,
    ...Shadow.sm,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.gray500,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statVal: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  emptyBox: {
    backgroundColor: '#fff',
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray100,
  },
  emptyText: {
    color: Colors.gray50 || '#555555',
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
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  orderStatus: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.red,
  },
  orderDetails: {
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: Colors.gray700,
  },
});
