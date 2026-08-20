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
  ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { api } from '../../lib/axios';
import { Colors, Spacing, Radius, Shadow } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import LoadingSpinner from '../../components/LoadingSpinner';
import { handleLogoutImmediate } from '../../utils/auth';

export default function RiderDashboardScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [online, setOnline] = useState(true);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [otpMap, setOtpMap] = useState<Record<number, string>>({});
  const [actionLoading, setActionLoading] = useState<Record<number, boolean>>({});

  const setOrderOtp = (orderId: number, val: string) => {
    setOtpMap((prev) => ({ ...prev, [orderId]: val }));
  };

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
    if (actionLoading[order.id]) return;
    try {
      setActionLoading((prev) => ({ ...prev, [order.id]: true }));
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
      await fetchRiderData();
    } catch (e: any) {
      console.error(e);
      Alert.alert('Notice', e.response?.data?.message || 'Action could not be completed.');
      await fetchRiderData();
    } finally {
      setActionLoading((prev) => ({ ...prev, [order.id]: false }));
    }
  };

  const handleReject = async (orderId: number) => {
    if (actionLoading[orderId]) return;
    try {
      setActionLoading((prev) => ({ ...prev, [orderId]: true }));
      await api.patch(`/api/rider/orders/${orderId}/reject`);
      await fetchRiderData();
    } catch (e: any) {
      Alert.alert('Notice', e.response?.data?.message || 'Unable to reject order.');
    } finally {
      setActionLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const handleDeliver = async (orderId: number) => {
    const orderOtp = (otpMap[orderId] || '').trim();
    if (!orderOtp || orderOtp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit delivery OTP (Use 123456 for demo).');
      return;
    }
    if (actionLoading[orderId]) return;
    try {
      setActionLoading((prev) => ({ ...prev, [orderId]: true }));
      await api.post(`/api/rider/orders/${orderId}/deliver`, { otp: orderOtp });
      setOtpMap((prev) => ({ ...prev, [orderId]: '' }));
      Alert.alert('Success', 'Order delivered successfully!');
      await fetchRiderData();
    } catch (e: any) {
      Alert.alert('Delivery Error', e.response?.data?.message || 'Invalid delivery confirmation code. Use 123456.');
    } finally {
      setActionLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const handleSignOut = () => {
    handleLogoutImmediate(dispatch, navigation);
  };

  const getStatusBadgeStyle = (status: string, isAcceptedByMe: boolean) => {
    if (!isAcceptedByMe) {
      return { bg: '#DCFCE7', text: '#15803D', label: 'AVAILABLE' };
    }
    switch (status) {
      case 'ACCEPTED':
      case 'READY':
        return { bg: '#DBEAFE', text: '#1D4ED8', label: 'ACCEPTED' };
      case 'ARRIVED_VENDOR':
        return { bg: '#F3E8FF', text: '#7E22CE', label: 'AT VENDOR' };
      case 'PICKED_UP':
        return { bg: '#FEF3C7', text: '#B45309', label: 'ON THE WAY' };
      case 'ARRIVED_CUSTOMER':
        return { bg: '#FEE2E2', text: '#DC2626', label: 'AT CUSTOMER' };
      default:
        return { bg: '#F3F4F6', text: '#374151', label: status };
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="bicycle" size={24} color="#DC2626" />
          <Text style={styles.headerTitle}>Rider Console</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={toggleOnline}
            style={[styles.statusTogglePill, { backgroundColor: online ? '#DCFCE7' : '#FEE2E2' }]}
            activeOpacity={0.7}
          >
            <View style={[styles.statusDot, { backgroundColor: online ? '#16A34A' : '#DC2626' }]} />
            <Text style={[styles.statusToggleText, { color: online ? '#15803D' : '#DC2626' }]}>
              {online ? 'ONLINE' : 'OFFLINE'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSignOut} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={22} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available & Active Deliveries</Text>
          <Text style={styles.sectionSubtitle}>
            {activeOrders.length} order{activeOrders.length === 1 ? '' : 's'} available
          </Text>
        </View>

        {activeOrders.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="sparkles-outline" size={48} color={Colors.gray400} />
            <Text style={styles.emptyTitle}>No Orders Available</Text>
            <Text style={styles.emptyText}>New delivery orders will appear here automatically.</Text>
          </View>
        ) : (
          activeOrders.map((order) => {
            const showOtpField = order.status === 'ARRIVED_CUSTOMER';
            const isAcceptedByMe = order.assignmentStatus === 'ACCEPTED';
            const isBusy = !!actionLoading[order.id];
            const badge = getStatusBadgeStyle(order.status, isAcceptedByMe);
            const addressText = order.address
              ? `${order.address.houseNumber || ''} ${order.address.street || ''}, ${order.address.city || ''} (${order.address.pincode || ''})`.trim()
              : `House #${order.addressId || 'N/A'}`;

            return (
              <View key={order.id} style={styles.orderCard}>
                {/* Header Row */}
                <View style={styles.cardHeader}>
                  <View style={styles.orderNumTag}>
                    <Text style={styles.orderNumText}>Order #{order.orderNumber}</Text>
                  </View>
                  <View style={[styles.badgePill, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
                  </View>
                </View>

                {/* Details Section */}
                <View style={styles.cardBody}>
                  <View style={styles.detailRow}>
                    <Ionicons name="storefront-outline" size={16} color="#DC2626" style={styles.detailIcon} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.detailLabel}>Vendor</Text>
                      <Text style={styles.detailValBold}>{order.vendor?.name || 'Local Store'}</Text>
                      {order.vendor?.businessAddress ? (
                        <Text style={styles.detailSubText}>{order.vendor.businessAddress}</Text>
                      ) : null}
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={16} color="#16A34A" style={styles.detailIcon} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.detailLabel}>Delivery Address</Text>
                      <Text style={styles.detailValBold}>{addressText}</Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <Ionicons name="cash-outline" size={16} color="#2563EB" style={styles.detailIcon} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.detailLabel}>Order Total</Text>
                      <Text style={styles.priceTagText}>₹{order.totalAmount}</Text>
                    </View>
                  </View>
                </View>

                {/* Bottom Action Area */}
                {showOtpField ? (
                  <View style={styles.otpCard}>
                    <View style={styles.otpHeaderRow}>
                      <Ionicons name="key-outline" size={16} color="#DC2626" />
                      <Text style={styles.otpLabel}>Customer Delivery OTP</Text>
                      <View style={styles.demoTag}>
                        <Text style={styles.demoTagText}>Demo: 123456</Text>
                      </View>
                    </View>
                    <TextInput
                      style={styles.otpInput}
                      placeholder="123456"
                      placeholderTextColor="#9CA3AF"
                      value={otpMap[order.id] || ''}
                      onChangeText={(t) => setOrderOtp(order.id, t.replace(/\D/g, '').slice(0, 6))}
                      keyboardType="number-pad"
                      maxLength={6}
                      editable={!isBusy}
                    />
                    <TouchableOpacity
                      style={[styles.primaryActionBtn, isBusy && styles.disabledBtn]}
                      onPress={() => handleDeliver(order.id)}
                      disabled={isBusy}
                    >
                      {isBusy ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <>
                          <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                          <Text style={styles.primaryActionText}>Confirm Delivery</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                ) : !isAcceptedByMe ? (
                  <View style={styles.acceptRejectRow}>
                    <TouchableOpacity
                      style={[styles.acceptBtn, isBusy && styles.disabledBtn]}
                      onPress={() => handleAction(order)}
                      disabled={isBusy}
                    >
                      {isBusy ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <>
                          <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                          <Text style={styles.acceptBtnText}>Accept Order</Text>
                        </>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.rejectBtn, isBusy && styles.disabledBtn]}
                      onPress={() => handleReject(order.id)}
                      disabled={isBusy}
                    >
                      <Ionicons name="close-circle-outline" size={18} color="#DC2626" />
                      <Text style={styles.rejectBtnText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.primaryActionBtn, isBusy && styles.disabledBtn]}
                    onPress={() => handleAction(order)}
                    disabled={isBusy}
                  >
                    {isBusy ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Ionicons
                          name={
                            order.status === 'ACCEPTED' || order.status === 'READY'
                              ? 'storefront-outline'
                              : order.status === 'ARRIVED_VENDOR'
                              ? 'bag-handle-outline'
                              : 'navigate-outline'
                          }
                          size={18}
                          color="#fff"
                        />
                        <Text style={styles.primaryActionText}>
                          {(order.status === 'ACCEPTED' || order.status === 'READY') && 'Arrived at Shop'}
                          {order.status === 'ARRIVED_VENDOR' && 'Picked Up Order'}
                          {order.status === 'PICKED_UP' && 'Arrived at Customer Address'}
                        </Text>
                      </>
                    )}
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
    backgroundColor: '#F9FAFB',
  },
  header: {
    height: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    ...Shadow.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusTogglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusToggleText: {
    fontSize: 11,
    fontWeight: '800',
  },
  logoutBtn: {
    padding: 4,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  emptyBox: {
    backgroundColor: '#ffffff',
    padding: 36,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginTop: 12,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Shadow.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 12,
  },
  orderNumTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  orderNumText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1F2937',
  },
  badgePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  cardBody: {
    gap: 12,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  detailIcon: {
    marginTop: 2,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
  },
  detailValBold: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 1,
  },
  detailSubText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  priceTagText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#DC2626',
    marginTop: 1,
  },
  otpCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  otpHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  otpLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#991B1B',
    flex: 1,
  },
  demoTag: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  demoTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DC2626',
  },
  otpInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 8,
    height: 44,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 6,
  },
  primaryActionBtn: {
    backgroundColor: '#DC2626',
    height: 44,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  primaryActionText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
  acceptRejectRow: {
    flexDirection: 'row',
    gap: 10,
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: '#16A34A',
    height: 44,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  acceptBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#DC2626',
    height: 44,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  rejectBtnText: {
    color: '#DC2626',
    fontWeight: '800',
    fontSize: 14,
  },
  disabledBtn: {
    opacity: 0.6,
  },
});
