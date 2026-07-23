// src/screens/admin/AdminVendorsScreen.tsx
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

export default function AdminVendorsScreen({ navigation }: any) {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVendors = async () => {
    try {
      const res = await api.get('/api/admin/vendors');
      setVendors(res.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const toggleVendorStatus = async (vendorId: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.patch(`/api/admin/vendors/${vendorId}/status`, { status: nextStatus });
      fetchVendors();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
          <Text style={styles.headerTitle}>System Vendors</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {vendors.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No vendors registered in system.</Text>
          </View>
        ) : (
          vendors.map((vendor) => (
            <View key={vendor.id} style={styles.vendorCard}>
              <View>
                <Text style={styles.vendorName}>{vendor.name || `Vendor #${vendor.id}`}</Text>
                <Text style={styles.vendorLoc}>{vendor.email}</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.statusToggle,
                  { backgroundColor: vendor.status === 'ACTIVE' ? Colors.green : Colors.red },
                ]}
                onPress={() => toggleVendorStatus(vendor.id, vendor.status)}
              >
                <Text style={styles.statusToggleText}>
                  {vendor.status === 'ACTIVE' ? 'ACTIVE' : 'BLOCKED'}
                </Text>
              </TouchableOpacity>
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
  vendorCard: {
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
  vendorName: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  vendorLoc: {
    fontSize: 11,
    color: Colors.gray500,
    marginTop: 2,
  },
  statusToggle: {
    paddingHorizontal: Spacing.base,
    paddingVertical: 6,
    borderRadius: Radius.sm,
  },
  statusToggleText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '850',
  },
});
