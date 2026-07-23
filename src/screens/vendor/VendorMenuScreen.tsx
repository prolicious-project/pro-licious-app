// src/screens/vendor/VendorMenuScreen.tsx
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

export default function VendorMenuScreen({ navigation }: any) {
  const [menu, setMenu] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMenu = async () => {
    try {
      const res = await api.get('/api/vendor/menu');
      setMenu(res.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const toggleAvailability = async (itemId: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.patch(`/api/vendor/menu/${itemId}/availability`, { status: nextStatus });
      fetchMenu();
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
          <Text style={styles.headerTitle}>Menu Management</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {menu.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No menu items found. Add items from the admin panel.</Text>
          </View>
        ) : (
          menu.map((item) => (
            <View key={item.id} style={styles.menuCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.itemName}>{item.name}</Text>
                <TouchableOpacity
                  style={[
                    styles.availBtn,
                    { backgroundColor: item.status === 'ACTIVE' ? Colors.green : Colors.red },
                  ]}
                  onPress={() => toggleAvailability(item.id, item.status)}
                >
                  <Text style={styles.availText}>
                    {item.status === 'ACTIVE' ? 'Available' : 'Unavailable'}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.itemDesc} numberOfLines={2}>
                {item.description || 'No description provided.'}
              </Text>
              <View style={styles.footerRow}>
                <Text style={styles.itemPrice}>₹{parseFloat(item.price).toFixed(0)}</Text>
                <Text style={styles.itemMeta}>Category ID: {item.categoryId}</Text>
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
  menuCard: {
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
    marginBottom: Spacing.xs,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  availBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  availText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  itemDesc: {
    fontSize: 12,
    color: Colors.gray500,
    lineHeight: 16,
    marginBottom: Spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
    paddingTop: Spacing.sm,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  itemMeta: {
    fontSize: 10,
    color: Colors.gray400,
    fontWeight: '600',
  },
});
