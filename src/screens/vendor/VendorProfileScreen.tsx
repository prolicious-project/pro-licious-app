// src/screens/vendor/VendorProfileScreen.tsx
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

export default function VendorProfileScreen({ navigation }: any) {
  const [profile, setProfile] = useState<any>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfileData = async () => {
    try {
      const [profRes, branchesRes] = await Promise.all([
        api.get('/api/vendor/profile'),
        api.get('/api/vendor/branches'),
      ]);
      setProfile(profRes.data?.data);
      setBranches(branchesRes.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const toggleBranchStatus = async (branchId: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.patch(`/api/vendor/branches/${branchId}/status`, { status: nextStatus });
      fetchProfileData();
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
          <Text style={styles.headerTitle}>Vendor Profile</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Info Card */}
        <View style={styles.profileCard}>
          <Text style={styles.vendorName}>{profile?.name || 'Partner Shop'}</Text>
          <Text style={styles.vendorEmail}>{profile?.email}</Text>
          <Text style={styles.vendorPhone}>Phone: {profile?.phone || 'N/A'}</Text>
        </View>

        {/* Branch settings */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Branch Status Management</Text>
        </View>

        {branches.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No branches registered under this vendor.</Text>
          </View>
        ) : (
          branches.map((branch) => (
            <View key={branch.id} style={styles.branchCard}>
              <View>
                <Text style={styles.branchName}>{branch.name || `Branch #${branch.id}`}</Text>
                <Text style={styles.branchLoc}>{branch.city || 'Local Delivery Zone'}</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.statusToggle,
                  { backgroundColor: branch.status === 'ACTIVE' ? Colors.green : Colors.red },
                ]}
                onPress={() => toggleBranchStatus(branch.id, branch.status)}
              >
                <Text style={styles.statusToggleText}>
                  {branch.status === 'ACTIVE' ? 'OPEN' : 'CLOSED'}
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
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.gray100,
    ...Shadow.sm,
    alignItems: 'center',
  },
  vendorName: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  vendorEmail: {
    fontSize: 12,
    color: Colors.gray500,
    marginTop: 4,
  },
  vendorPhone: {
    fontSize: 12,
    color: Colors.gray500,
    marginTop: 2,
  },
  sectionHeader: {
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '950',
    color: Colors.textPrimary,
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
  branchCard: {
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
  branchName: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  branchLoc: {
    fontSize: 11,
    color: Colors.gray500,
    marginTop: 2,
  },
  statusToggle: {
    paddingHorizontal: Spacing.base,
    paddingVertical: 8,
    borderRadius: Radius.sm,
  },
  statusToggleText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '850',
  },
});
