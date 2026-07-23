// src/screens/OrderDetailScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  SafeAreaView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { api } from '../lib/axios';
import { getSocket } from '../lib/socket';
import { Colors, Spacing, Radius, Shadow } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import OrderStatusBadge from '../components/OrderStatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function OrderDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { id } = route.params;

  const { isAuthenticated, token, user } = useSelector((state: RootState) => state.auth);
  const [order, setOrder] = useState<any>(null);
  const [tracking, setTracking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');

  // Razorpay Pay Now Simulation State
  const [payingNow, setPayingNow] = useState(false);
  const [payModal, setPayModal] = useState<'idle' | 'loading' | 'processing' | 'success' | 'failed'>('idle');
  const [payMessage, setPayMessage] = useState('');

  const fetchOrderDetails = async () => {
    try {
      const [orderRes, trackingRes] = await Promise.all([
        api.get(`/api/customer/orders/${id}`),
        api.get(`/api/customer/orders/${id}/tracking`),
      ]);
      setOrder(orderRes.data?.data);
      setTracking(trackingRes.data?.data || []);
    } catch (e) {
      console.error('Error fetching order details:', e);
      setError('Could not load order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigation.navigate('Login');
      return;
    }
    fetchOrderDetails();

    const socket = getSocket(token || undefined);
    socket.connect();
    socket.emit('join_order_room', { orderId: Number(id), userId: user?.id, role: 'CUSTOMER' });

    const onStatus = () => {
      fetchOrderDetails();
    };

    socket.on('order_status_changed', onStatus);
    socket.on('rider_assigned', onStatus);

    return () => {
      socket.off('order_status_changed', onStatus);
      socket.off('rider_assigned');
      socket.disconnect();
    };
  }, [isAuthenticated, id]);

  const handleCancelOrder = () => {
    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          setError('');
          setCancelling(true);
          try {
            await api.post(`/api/customer/orders/${id}/cancel`);
            await fetchOrderDetails();
          } catch (e: any) {
            setError(e.response?.data?.message || 'Failed to cancel order.');
          } finally {
            setCancelling(false);
          }
        },
      },
    ]);
  };

  const handlePayNow = () => {
    setPayingNow(true);
    setPayModal('loading');
    setPayMessage('Loading payment gateway...');
    setTimeout(() => {
      setPayModal('processing');
      setPayMessage('Complete payment using simulated Razorpay session');
    }, 1000);
  };

  const simulatePaymentSuccess = async () => {
    setPayModal('loading');
    setPayMessage('Verifying signature with server...');
    try {
      await api.post('/api/customer/payments/verify', {
        orderId: order.id,
        razorpayOrderId: `rzp_mock_${Date.now()}`,
        razorpayPaymentId: `pay_mock_${Date.now()}`,
        razorpaySignature: 'mock_signature_from_react_native_detail',
      });
      setPayModal('success');
      setPayMessage('Payment successful! Your order status has been updated.');
      setTimeout(() => {
        setPayModal('idle');
        setPayingNow(false);
        fetchOrderDetails();
      }, 1500);
    } catch (err: any) {
      setPayModal('failed');
      setPayMessage(err.response?.data?.message || 'Verification failed. Try again.');
      setPayingNow(false);
    }
  };

  const simulatePaymentFailure = () => {
    setPayModal('failed');
    setPayMessage('Payment was cancelled or failed.');
    setPayingNow(false);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.toLocaleDateString()} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color={Colors.red} />
        <Text style={styles.errorText}>Order Not Found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('OrdersTab')}>
          <Text style={styles.backBtnText}>Back to My Orders</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const showCancelButton = ['PLACED', 'ACCEPTED'].includes(order.status);
  const isUnpaidOnlineOrder =
    order.paymentMethod !== 'COD' && !['PAID', 'DELIVERED'].includes(order.status);

  // Check if paid from tracking timeline
  const isPaid =
    order.status === 'DELIVERED' ||
    order.paymentMethod === 'COD' ||
    tracking.some((t: any) => t.title?.toLowerCase().includes('payment') || t.status === 'PAID');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtnHeader} onPress={() => navigation.navigate('OrdersTab')}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
          <Text style={styles.headerTitle}>Order Details</Text>
        </TouchableOpacity>
        {showCancelButton && (
          <TouchableOpacity
            style={styles.cancelOrderBtn}
            onPress={handleCancelOrder}
            disabled={cancelling}
          >
            <Text style={styles.cancelOrderText}>{cancelling ? '...' : 'Cancel'}</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* PAY NOW BANNER */}
        {isUnpaidOnlineOrder && (
          <View style={styles.payNowBanner}>
            <View style={styles.payNowLeft}>
              <View style={styles.walletCircle}>
                <Ionicons name="wallet" size={20} color="#fff" />
              </View>
              <View>
                <Text style={styles.payNowTitle}>Payment Pending</Text>
                <Text style={styles.payNowSub}>
                  Pay ₹{parseFloat(order.totalAmount || 0).toFixed(0)} via {order.paymentMethod}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.payNowBtn} onPress={handlePayNow} disabled={payingNow}>
              <Text style={styles.payNowBtnText}>{payingNow ? '...' : 'Pay Now'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Order Header info */}
        <View style={styles.orderHeaderCard}>
          <View style={styles.orderTitleRow}>
            <View>
              <Text style={styles.orderNum}>Order #{order.orderNumber}</Text>
              <Text style={styles.orderDate}>Placed on {formatDate(order.createdAt)}</Text>
            </View>
            <OrderStatusBadge status={order.status} />
          </View>

          {/* Items */}
          <View style={styles.itemsWrapper}>
            <Text style={styles.subHeading}>Items Ordered</Text>
            <View style={styles.itemsBorder}>
              {order.items?.map((item: any) => (
                <View key={item.id} style={styles.itemRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{item.itemName || item.name || 'Item'}</Text>
                    <Text style={styles.itemQty}>
                      ₹{parseFloat(item.price).toFixed(0)} &times; {item.quantity}
                    </Text>
                  </View>
                  <Text style={styles.itemTotal}>₹{parseFloat(item.total).toFixed(0)}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Price Breakdown */}
          <View style={styles.breakdown}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Subtotal</Text>
              <Text style={styles.breakdownVal}>₹{parseFloat(order.subtotal).toFixed(2)}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Delivery Fee</Text>
              <Text style={styles.breakdownVal}>₹{parseFloat(order.deliveryFee).toFixed(2)}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>GST (5%)</Text>
              <Text style={styles.breakdownVal}>₹{parseFloat(order.taxAmount).toFixed(2)}</Text>
            </View>
            <View style={[styles.breakdownRow, styles.grandTotalRow]}>
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Text style={styles.grandTotalVal}>₹{parseFloat(order.totalAmount).toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Logistics & Payment info */}
        <View style={styles.metaCardsRow}>
          <View style={styles.metaCard}>
            <Text style={styles.metaCardTitle}>✓ Delivery Address</Text>
            <Text style={styles.metaCardDesc}>Address ID #{order.addressId}</Text>
          </View>

          <View style={styles.metaCard}>
            <Text style={styles.metaCardTitle}>✓ Payment Info</Text>
            <View style={styles.metaPaymentStatusRow}>
              <Text style={styles.metaPaymentMethod}>{order.paymentMethod}</Text>
              <View style={[styles.paymentStatusTag, { backgroundColor: isPaid ? Colors.greenBg : Colors.redBg }]}>
                <Text style={[styles.paymentStatusTagText, { color: isPaid ? Colors.greenText : Colors.red }]}>
                  {isPaid ? 'PAID' : 'PENDING'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Live Tracking Timeline */}
        <View style={styles.trackingCard}>
          <Text style={styles.trackingTitle}>Live Tracking</Text>
          {tracking.length === 0 ? (
            <View style={styles.noTracking}>
              <Ionicons name="time" size={24} color={Colors.gray400} />
              <Text style={styles.noTrackingText}>Waiting for updates...</Text>
            </View>
          ) : (
            <View style={styles.timeline}>
              {tracking.map((event: any, i: number) => {
                const isNewest = i === 0;
                return (
                  <View key={event.id} style={styles.timelineRow}>
                    <View style={styles.indicatorCol}>
                      <View style={[styles.dot, isNewest && styles.activeDot]} />
                      {i < tracking.length - 1 && <View style={styles.line} />}
                    </View>
                    <View style={styles.timelineContent}>
                      <Text style={[styles.timelineEventTitle, isNewest && styles.activeEventTitle]}>
                        {event.title}
                      </Text>
                      {event.description && <Text style={styles.timelineEventDesc}>{event.description}</Text>}
                      <Text style={styles.timelineTime}>
                        {new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Pay Now Simulator Modal */}
      <Modal visible={payModal !== 'idle'} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={[styles.modalIndicator, { backgroundColor: payModal === 'success' ? Colors.green : Colors.red }]} />
            <View style={styles.modalBody}>
              {payModal === 'loading' && <LoadingSpinner />}
              {payModal === 'processing' && (
                <>
                  <Ionicons name="logo-paypal" size={40} color={Colors.red} style={{ marginBottom: Spacing.sm }} />
                  <Text style={styles.modalTitle}>Razorpay Gateway Simulation</Text>
                  <Text style={styles.modalDesc}>{payMessage}</Text>
                  <Text style={styles.modalAmount}>Amount: ₹{parseFloat(order.totalAmount || 0).toFixed(2)}</Text>
                  <View style={styles.modalActions}>
                    <TouchableOpacity style={styles.modalCancel} onPress={simulatePaymentFailure}>
                      <Text style={styles.modalCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modalConfirm} onPress={simulatePaymentSuccess}>
                      <Text style={styles.modalConfirmText}>Simulate Success</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
              {payModal === 'success' && (
                <>
                  <Ionicons name="checkmark-circle" size={48} color={Colors.green} />
                  <Text style={styles.modalTitle}>Payment Verified</Text>
                  <Text style={styles.modalDesc}>{payMessage}</Text>
                </>
              )}
              {payModal === 'failed' && (
                <>
                  <Ionicons name="close-circle" size={48} color={Colors.red} />
                  <Text style={styles.modalTitle}>Payment Failed</Text>
                  <Text style={styles.modalDesc}>{payMessage}</Text>
                  <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setPayModal('idle')}>
                    <Text style={styles.modalCloseText}>Close</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing['2xl'],
    gap: Spacing.md,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  backBtn: {
    paddingHorizontal: Spacing.base,
    paddingVertical: 8,
    borderRadius: Radius.sm,
    backgroundColor: Colors.redBg,
    borderWidth: 1,
    borderColor: Colors.redBorder,
  },
  backBtnText: {
    color: Colors.red,
    fontWeight: '700',
    fontSize: 14,
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
  backBtnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  cancelOrderBtn: {
    backgroundColor: Colors.redBg,
    borderWidth: 1,
    borderColor: Colors.redBorder,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.sm,
  },
  cancelOrderText: {
    color: Colors.red,
    fontSize: 12,
    fontWeight: '800',
  },
  scrollContent: {
    padding: Spacing.base,
    gap: Spacing.base,
  },
  errorBox: {
    backgroundColor: Colors.redBg,
    borderWidth: 1,
    borderColor: Colors.redBorder,
    padding: 12,
    borderRadius: Radius.md,
  },
  payNowBanner: {
    backgroundColor: Colors.red,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Shadow.md,
  },
  payNowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  walletCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payNowTitle: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 15,
  },
  payNowSub: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    marginTop: 2,
  },
  payNowBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: Spacing.base,
    paddingVertical: 8,
    borderRadius: Radius.sm,
  },
  payNowBtnText: {
    color: Colors.red,
    fontWeight: '900',
    fontSize: 12,
  },
  orderHeaderCard: {
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.gray100,
    ...Shadow.sm,
  },
  orderTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
    paddingBottom: Spacing.md,
    marginBottom: Spacing.md,
  },
  orderNum: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  orderDate: {
    fontSize: 11,
    color: Colors.gray500,
    marginTop: 2,
  },
  subHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  itemsWrapper: {
    marginBottom: Spacing.md,
  },
  itemsBorder: {
    borderWidth: 1,
    borderColor: Colors.gray100,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.gray50,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  itemQty: {
    fontSize: 11,
    color: Colors.gray500,
    marginTop: 2,
  },
  itemTotal: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  breakdown: {
    backgroundColor: Colors.gray50,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: 6,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownLabel: {
    fontSize: 11,
    color: Colors.gray500,
    fontWeight: '600',
  },
  breakdownVal: {
    fontSize: 11,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
    paddingTop: Spacing.sm,
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  grandTotalVal: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.red,
  },
  metaCardsRow: {
    flexDirection: 'row',
    gap: Spacing.base,
  },
  metaCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray100,
    ...Shadow.sm,
  },
  metaCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  metaCardDesc: {
    fontSize: 11,
    color: Colors.gray500,
  },
  metaPaymentStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  metaPaymentMethod: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  paymentStatusTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  paymentStatusTagText: {
    fontSize: 9,
    fontWeight: '800',
  },
  trackingCard: {
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.gray100,
    ...Shadow.sm,
  },
  trackingTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.md,
  },
  noTracking: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: 4,
  },
  noTrackingText: {
    fontSize: 12,
    color: Colors.gray500,
  },
  timeline: {
    paddingLeft: 10,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  indicatorCol: {
    alignItems: 'center',
    width: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gray400,
    marginTop: 4,
  },
  activeDot: {
    backgroundColor: Colors.red,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: Colors.redBg,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.gray200,
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: Spacing.lg,
  },
  timelineEventTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.gray500,
  },
  activeEventTitle: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  timelineEventDesc: {
    fontSize: 11,
    color: Colors.gray500,
    marginTop: 2,
  },
  timelineTime: {
    fontSize: 9,
    color: Colors.gray400,
    marginTop: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '100%',
    maxWidth: 340,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadow.lg,
  },
  modalIndicator: {
    height: 6,
    width: '100%',
  },
  modalBody: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
    marginBottom: 4,
    textAlign: 'center',
  },
  modalDesc: {
    fontSize: 12,
    color: Colors.gray500,
    textAlign: 'center',
    lineHeight: 16,
  },
  modalAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginVertical: Spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    width: '100%',
  },
  modalCancel: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: Radius.sm,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.gray500,
  },
  modalConfirm: {
    flex: 1.5,
    backgroundColor: Colors.red,
    borderRadius: Radius.sm,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#fff',
  },
  modalCloseBtn: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.gray100,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 8,
    borderRadius: Radius.sm,
  },
  modalCloseText: {
    fontSize: 12,
    color: Colors.gray700,
    fontWeight: '700',
  },
});
