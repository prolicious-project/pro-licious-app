// src/screens/vendor/VendorSettlementsScreen.tsx
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

export default function VendorSettlementsScreen({ navigation }: any) {
  const [settlements, setSettlements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSettlements = async () => {
    try {
      const res = await api.get('/api/vendor/settlements');
      setSettlements(res.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlements();
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
          <Text style={styles.headerTitle}>Settlements & payouts</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {settlements.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No payout settlements processed yet.</Text>
          </View>
        ) : (
          settlements.map((item) => (
            <View key={item.id} style={styles.payoutCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.payoutId}>Payout ID #{item.id}</Text>
                <View style={[styles.statusTag, { backgroundColor: item.status === 'PAID' ? Colors.greenBg : Colors.redBg }]}>
                  <Text style={[styles.statusTagText, { color: item.status === 'PAID' ? Colors.greenText : Colors.red }]}>
                    {item.status}
                  </Text>
                </View>
              </View>
              <View style={styles.cardDetails}>
                <Text style={styles.payoutDetail}>Amount: ₹{parseFloat(item.amount).toFixed(2)}</Text>
                <Text style={styles.payoutDetail}>Bank Ref: {item.utrNumber || 'Processing'}</Text>
                <Text style={styles.payoutDetailDate}>
                  Date: {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>
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
  payoutCard: {
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
  payoutId: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  statusTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusTagText: {
    fontSize: 9,
    fontWeight: '800',
  },
  cardDetails: {
    gap: 4,
  },
  payoutDetail: {
    fontSize: 12,
    color: Colors.gray700,
    fontWeight: '600',
  },
  payoutDetailDate: {
    fontSize: 10,
    color: Colors.gray400,
    marginTop: 2,
  },
});
