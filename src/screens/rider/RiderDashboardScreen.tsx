// src/screens/rider/RiderDashboardScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { api } from '../../lib/axios';
import { Colors, Spacing, Radius, Shadow } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useNavigation } from '@react-navigation/native';
import { handleLogoutImmediate } from '../../utils/auth';

export default function RiderDashboardScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [online, setOnline] = useState(false);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [otp, setOtp] = useState('');

  const fetchRiderData = async () => {
    try {
      const res = await api.get('/api/rider/orders');
      setActiveOrders(res.data?.data || []);
    } catch (e) {
      console.error('Error fetching rider orders:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigation.replace('Login');
      return;
    }
    fetchRiderData();
  }, [isAuthenticated]);

  const toggleOnline = async () => {
    try {
      const nextStatus = !online;
      await api.patch('/api/rider/availability', { isOnline: nextStatus });
      setOnline(nextStatus);
      fetchRiderData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAction = async (order: any) => {
    try {
      let endpoint = `/api/rider/orders/${order.id}/accept`;
      if (order.assignmentStatus === 'ACCEPTED') {
        if (order.status === 'ACCEPTED' || order.status === 'READY') {
          endpoint = `/api/rider/orders/${order.id}/arrived-vendor`;
        } else if (order.status === 'ARRIVED_VENDOR') {
          endpoint = `/api/rider/orders/${order.id}/picked-up`;
        } else if (order.status === 'PICKED_UP') {
          endpoint = `/api/rider/orders/${order.id}/arrived-customer`;
        }
      }

      await api.patch(endpoint);
      fetchRiderData();
    } catch (e: any) {
      console.error(e);
      Alert.alert('Notice', e.response?.data?.message || 'Action could not be completed.');
      fetchRiderData();
    }
  };

  const handleDeliver = async (orderId: number) => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit delivery OTP.');
      return;
    }
    try {
      await api.post(`/api/rider/orders/${orderId}/deliver`, { otp });
      setOtp('');
      Alert.alert('Success', 'Order delivered successfully!');
      fetchRiderData();
    } catch (e: any) {
      Alert.alert('Delivery Error', e.response?.data?.message || 'Invalid delivery confirmation code.');
    }
  };

  const handleSignOut = () => {
    handleLogoutImmediate(dispatch, navigation);
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rider Console</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={toggleOnline} style={[styles.statusIndicator, { backgroundColor: online ? Colors.green : Colors.red }]}>
            <Text style={styles.statusText}>{online ? 'ONLINE' : 'OFFLINE'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={22} color={Colors.red} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Assigned Orders List */}
        <Text style={styles.sectionTitle}>Available & Active Deliveries</Text>

        {activeOrders.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No active orders available right now.</Text>
          </View>
        ) : (
          activeOrders.map((order) => {
            const showOtpField = order.status === 'ARRIVED_CUSTOMER';
            const isAcceptedByMe = order.assignmentStatus === 'ACCEPTED';
            const addressText = order.address
              ? `${order.address.houseNumber || ''} ${order.address.street || ''}, ${order.address.city || ''} (${order.address.pincode || ''})`.trim()
              : `House #${order.addressId || 'N/A'}`;

            return (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.orderNum}>Order #{order.orderNumber}</Text>
                  <Text style={styles.orderStatus}>
                    {isAcceptedByMe ? order.status : 'AVAILABLE FOR PICKUP'}
                  </Text>
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.detailText}>Vendor: {order.vendor?.name || 'Local shop'}</Text>
                  {order.vendor?.businessAddress ? (
                    <Text style={styles.detailText}>Shop Address: {order.vendor.businessAddress}</Text>
                  ) : null}
                  <Text style={styles.detailText}>Delivery To: {addressText}</Text>
                  <Text style={styles.detailText}>Total Amount: ₹{order.totalAmount}</Text>
                </View>

                {showOtpField ? (
                  <View style={styles.otpBlock}>
                    <Text style={styles.otpLabel}>Enter Customer Delivery OTP</Text>
                    <TextInput
                      style={styles.otpInput}
                      placeholder="000000"
                      value={otp}
                      onChangeText={(t) => setOtp(t.replace(/\D/g, '').slice(0, 6))}
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleDeliver(order.id)}
                    >
                      <Text style={styles.actionBtnText}>Confirm Delivery</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleAction(order)}
                  >
                    <Text style={styles.actionBtnText}>
                      {!isAcceptedByMe && 'Accept Order'}
                      {isAcceptedByMe && (order.status === 'ACCEPTED' || order.status === 'READY') && 'Arrived at Shop'}
                      {isAcceptedByMe && order.status === 'ARRIVED_VENDOR' && 'Picked Up Order'}
                      {isAcceptedByMe && order.status === 'PICKED_UP' && 'Arrived at Customer Address'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  statusText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
  },
  scrollContent: {
    padding: Spacing.base,
    gap: Spacing.base,
    paddingBottom: Spacing['3xl'],
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.gray100,
    ...Shadow.sm,
  },
  tabBtn: {
    alignItems: 'center',
    flex: 1,
  },
  tabBtnText: {
    fontSize: 10,
    fontWeight: '700',
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
    color: Colors.gray500,
    fontSize: 12,
  },
  orderCard: {
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
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  orderStatus: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.red,
  },
  cardBody: {
    gap: 4,
    marginBottom: Spacing.md,
  },
  detailText: {
    fontSize: 12,
    color: Colors.gray700,
  },
  actionBtn: {
    backgroundColor: Colors.red,
    height: 38,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
  },
  otpBlock: {
    gap: Spacing.sm,
  },
  otpLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.gray500,
    textTransform: 'uppercase',
  },
  otpInput: {
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: Radius.sm,
    height: 40,
    textAlign: 'center',
    fontSize: 16,
    letterSpacing: 4,
  },
});
