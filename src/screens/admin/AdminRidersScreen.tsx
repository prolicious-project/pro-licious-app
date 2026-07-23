// src/screens/admin/AdminRidersScreen.tsx
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

export default function AdminRidersScreen({ navigation }: any) {
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRiders = async () => {
    try {
      const res = await api.get('/api/admin/riders');
      setRiders(res.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiders();
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
          <Text style={styles.headerTitle}>System Riders</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {riders.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No delivery riders registered in system.</Text>
          </View>
        ) : (
          riders.map((rider) => (
            <View key={rider.id} style={styles.riderCard}>
              <View>
                <Text style={styles.riderName}>{rider.name || `Rider #${rider.id}`}</Text>
                <Text style={styles.riderMail}>{rider.email}</Text>
              </View>
              <View style={[styles.statusTag, { backgroundColor: rider.isOnline ? Colors.greenBg : Colors.gray100 }]}>
                <Text style={[styles.statusTagText, { color: rider.isOnline ? Colors.greenText : Colors.gray500 }]}>
                  {rider.isOnline ? 'Online' : 'Offline'}
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
  riderCard: {
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: Spacing.base,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray100,
    ...Shadow.sm,
  },
  riderName: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  riderMail: {
    fontSize: 11,
    color: Colors.gray500,
    marginTop: 2,
  },
  statusTag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.sm,
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '850',
  },
});
