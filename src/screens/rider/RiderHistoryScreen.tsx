// src/screens/rider/RiderHistoryScreen.tsx
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

export default function RiderHistoryScreen({ navigation }: any) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/api/rider/orders');
      // Filter out only past completed orders
      const list = res.data?.data || [];
      const past = list.filter((o: any) => ['DELIVERED', 'CANCELLED', 'REJECTED'].includes(o.status));
      setOrders(past);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
          <Text style={styles.headerTitle}>Delivery History</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {orders.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No completed trips found in history.</Text>
          </View>
        ) : (
          orders.map((item) => (
            <View key={item.id} style={styles.historyCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.orderNum}>Order #{item.orderNumber}</Text>
                <Text style={styles.orderStatus}>{item.status}</Text>
              </View>
              <Text style={styles.detail}>Date: {new Date(item.createdAt).toLocaleDateString()}</Text>
              <Text style={styles.detail}>Amt: ₹{parseFloat(item.totalAmount).toFixed(0)}</Text>
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
  scrollContent: {
    padding: Spacing.base,
    gap: Spacing.base,
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
    color: Colors.gray400,
    fontSize: 12,
  },
  historyCard: {
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
    color: Colors.gray500,
  },
  detail: {
    fontSize: 12,
    color: Colors.gray700,
    marginTop: 2,
  },
});
