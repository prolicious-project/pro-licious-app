// src/screens/rider/RiderEarningsScreen.tsx
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

export default function RiderEarningsScreen({ navigation }: any) {
  const [summary, setSummary] = useState<any>(null);
  const [earnings, setEarnings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEarningsData = async () => {
    try {
      const [sumRes, earnRes] = await Promise.all([
        api.get('/api/rider/earnings/summary'),
        api.get('/api/rider/earnings'),
      ]);
      setSummary(sumRes.data?.data);
      setEarnings(earnRes.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarningsData();
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
          <Text style={styles.headerTitle}>My Earnings</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Stats card */}
        <View style={styles.statsCard}>
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>Total Payout</Text>
            <Text style={styles.statValue}>₹{summary?.totalEarned || '0.00'}</Text>
          </View>
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>Completed Trips</Text>
            <Text style={styles.statValue}>{summary?.tripsCount || '0'}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Transaction History</Text>

        {earnings.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No earnings recorded yet.</Text>
          </View>
        ) : (
          earnings.map((item) => (
            <View key={item.id} style={styles.earningCard}>
              <View style={styles.earningHeader}>
                <Text style={styles.tripId}>Trip ID #{item.id}</Text>
                <Text style={styles.tripAmount}>+ ₹{parseFloat(item.amount).toFixed(2)}</Text>
              </View>
              <Text style={styles.tripDetail}>Order Number: #{item.orderId}</Text>
              <Text style={styles.tripDate}>
                Completed: {new Date(item.createdAt).toLocaleDateString()}
              </Text>
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
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.gray100,
    ...Shadow.sm,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: Colors.gray500,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 14,
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
    color: Colors.gray400,
    fontSize: 12,
  },
  earningCard: {
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.gray100,
    ...Shadow.sm,
  },
  earningHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  tripId: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  tripAmount: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.green,
  },
  tripDetail: {
    fontSize: 11,
    color: Colors.gray600,
  },
  tripDate: {
    fontSize: 9,
    color: Colors.gray400,
    marginTop: 4,
  },
});
