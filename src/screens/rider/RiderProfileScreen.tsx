// src/screens/rider/RiderProfileScreen.tsx
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

export default function RiderProfileScreen({ navigation }: any) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      // In the real BE, rider API might use auth getMe or custom profile
      const res = await api.get('/api/auth/me');
      setProfile(res.data?.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
          <Text style={styles.headerTitle}>Rider Profile</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <Ionicons name="bicycle-outline" size={48} color={Colors.red} />
          </View>
          <Text style={styles.riderName}>{profile?.name || 'Rider Partner'}</Text>
          <Text style={styles.riderRole}>Delivery Representative</Text>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{profile?.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Phone</Text>
            <Text style={styles.value}>{profile?.phone || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Status</Text>
            <Text style={styles.value}>Active representative</Text>
          </View>
        </View>
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
  avatarWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.redBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.redBorder,
  },
  riderName: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  riderRole: {
    fontSize: 10,
    fontWeight: '750',
    color: Colors.zinc400,
    textTransform: 'uppercase',
    marginTop: 2,
    marginBottom: Spacing.lg,
  },
  infoRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  label: {
    fontSize: 12,
    color: Colors.gray400,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '800',
  },
});
