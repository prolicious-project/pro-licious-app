// src/screens/CheckoutScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { api } from '../lib/axios';
import { Colors, Spacing, Radius, Shadow } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import LoadingSpinner from '../components/LoadingSpinner';

const { width } = Dimensions.get('window');

export default function CheckoutScreen() {
  const navigation = useNavigation<any>();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const vendorId = useSelector((state: RootState) => state.cart.vendorId);

  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');

  // New Address Form State
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addressType, setAddressType] = useState('HOME');
  const [houseNumber, setHouseNumber] = useState('');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [pincode, setPincode] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Payment Simulation Modal State
  const [paymentModal, setPaymentModal] = useState<'idle' | 'loading' | 'processing' | 'success' | 'failed'>('idle');
  const [paymentMessage, setPaymentMessage] = useState('');
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const addressRes = await api.get('/api/customer/addresses');
      const addrList = addressRes.data?.data || [];
      setAddresses(addrList);
      if (addrList.length > 0) {
        const defaultAddr = addrList.find((a: any) => a.isDefault);
        setSelectedAddressId(defaultAddr ? defaultAddr.id : addrList[0].id);
      }
    } catch (e) {
      console.error('Error fetching checkout data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      // Guest tried to reach checkout — send to Login with return flag
      navigation.navigate('Login', { returnToCheckout: true });
      return;
    }
    if (cartItems.length === 0) {
      navigation.navigate('CartTab');
      return;
    }
    fetchData();
  }, [isAuthenticated, cartItems.length]);

  const handleAddAddress = async () => {
    if (!houseNumber.trim() || !street.trim() || !city.trim() || !stateVal.trim() || !pincode.trim()) {
      setError('Please fill in all address fields.');
      return;
    }
    setError('');
    try {
      const payload = {
        addressType,
        houseNumber,
        street,
        landmark,
        city,
        state: stateVal,
        pincode,
        isDefault: addresses.length === 0,
      };
      const res = await api.post('/api/customer/addresses', payload);
      const newAddress = res.data?.data;
      if (newAddress) {
        setAddresses((prev) => [...prev, newAddress]);
        setSelectedAddressId(newAddress.id);
        setShowAddAddress(false);
        setHouseNumber('');
        setStreet('');
        setLandmark('');
        setCity('');
        setStateVal('');
        setPincode('');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not add address. Check fields.');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setError('Please select a delivery address.');
      return;
    }
    if (!vendorId) {
      setError('Vendor not found in cart.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      const payload = {
        vendorId,
        addressId: selectedAddressId,
        paymentMethod,
      };
      const res = await api.post('/api/customer/orders', payload);
      const newOrder = res.data?.data;

      if (!newOrder?.id) {
        setError('Order placed but ID not returned.');
        setSubmitting(false);
        return;
      }

      setCreatedOrderId(newOrder.id);

      // Simulation mode for online payments
      if (paymentMethod === 'UPI' || paymentMethod === 'CARD') {
        setPaymentModal('loading');
        setPaymentMessage('Loading payment gateway...');
        setTimeout(() => {
          setPaymentModal('processing');
          setPaymentMessage('Review details and simulate Razorpay authorization');
        }, 1200);
      } else {
        // Cash on delivery
        navigation.navigate('OrderDetail', { id: newOrder.id });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to place order. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const simulatePaymentSuccess = async () => {
    if (!createdOrderId) return;
    setPaymentModal('loading');
    setPaymentMessage('Verifying payment signatures...');
    try {
      // Mock payment verification on backend
      await api.post('/api/customer/payments/verify', {
        orderId: createdOrderId,
        razorpayOrderId: `rzp_mock_${Date.now()}`,
        razorpayPaymentId: `pay_mock_${Date.now()}`,
        razorpaySignature: 'mock_signature_from_react_native_client',
      });
      setPaymentModal('success');
      setPaymentMessage('Payment verified successfully! Redirecting...');
      setTimeout(() => {
        setPaymentModal('idle');
        navigation.navigate('OrderDetail', { id: createdOrderId });
      }, 1500);
    } catch (err: any) {
      setPaymentModal('failed');
      setPaymentMessage(err.response?.data?.message || 'Verification failed. Try again.');
    }
  };

  const simulatePaymentFailure = () => {
    setPaymentModal('failed');
    setPaymentMessage('User cancelled payment or gateway timed out.');
  };

  const subtotal = cartItems.reduce((acc, item) => acc + parseFloat(item.price) * item.quantity, 0);
  const deliveryFee = 40;
  const tax = subtotal * 0.05;
  const grandTotal = subtotal + deliveryFee + tax;

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Address Selection */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <View style={styles.titleRow}>
              <Ionicons name="location" size={20} color={Colors.red} />
              <Text style={styles.cardTitle}>Delivery Address</Text>
            </View>
            {!showAddAddress && (
              <TouchableOpacity onPress={() => setShowAddAddress(true)}>
                <Text style={styles.addAddrBtn}>+ Add New</Text>
              </TouchableOpacity>
            )}
          </View>

          {showAddAddress ? (
            <View style={styles.addAddressForm}>
              <Text style={styles.formLabel}>Address Type</Text>
              <View style={styles.typeSelector}>
                {['HOME', 'WORK', 'OTHER'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setAddressType(type)}
                    style={[styles.typeBtn, addressType === type && styles.activeTypeBtn]}
                  >
                    <Text style={[styles.typeBtnText, addressType === type && styles.activeTypeBtnText]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.addrInput}
                placeholder="House / Flat Number"
                value={houseNumber}
                onChangeText={setHouseNumber}
              />
              <TextInput
                style={styles.addrInput}
                placeholder="Street / Locality"
                value={street}
                onChangeText={setStreet}
              />
              <TextInput
                style={styles.addrInput}
                placeholder="Landmark (Optional)"
                value={landmark}
                onChangeText={setLandmark}
              />
              <View style={styles.formRow}>
                <TextInput
                  style={[styles.addrInput, { flex: 1 }]}
                  placeholder="City"
                  value={city}
                  onChangeText={setCity}
                />
                <TextInput
                  style={[styles.addrInput, { flex: 1 }]}
                  placeholder="State"
                  value={stateVal}
                  onChangeText={setStateVal}
                />
              </View>
              <TextInput
                style={styles.addrInput}
                placeholder="Pincode"
                value={pincode}
                onChangeText={(t) => setPincode(t.replace(/\D/g, '').slice(0, 6))}
                keyboardType="number-pad"
              />

              <View style={styles.formActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setShowAddAddress(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleAddAddress}>
                  <Text style={styles.saveBtnText}>Save Address</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.addressesList}>
              {addresses.length === 0 ? (
                <Text style={styles.noAddressText}>No saved addresses. Please add one to proceed.</Text>
              ) : (
                addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <TouchableOpacity
                      key={addr.id}
                      style={[styles.addressCard, isSelected && styles.selectedAddressCard]}
                      onPress={() => setSelectedAddressId(addr.id)}
                    >
                      <View style={styles.addressMeta}>
                        <Text style={styles.addressTag}>{addr.addressType}</Text>
                        {isSelected && <Ionicons name="checkmark-circle" size={18} color={Colors.red} />}
                      </View>
                      <Text style={styles.addressLines}>
                        {addr.houseNumber}, {addr.street}
                      </Text>
                      <Text style={styles.addressSub}>
                        {addr.landmark ? `${addr.landmark}, ` : ''}
                        {addr.city}, {addr.state} - {addr.pincode}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          )}
        </View>

        {/* Payment Methods */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <View style={styles.titleRow}>
              <Ionicons name="card" size={20} color={Colors.red} />
              <Text style={styles.cardTitle}>Payment Method</Text>
            </View>
          </View>

          <View style={styles.paymentMethodsGrid}>
            {[
              { id: 'COD', label: 'Cash on Delivery', desc: 'Pay when order arrives', icon: 'bicycle-outline' },
              { id: 'UPI', label: 'UPI Payment', desc: 'Mock authorization', icon: 'wallet-outline' },
              { id: 'CARD', label: 'Credit/Debit Card', desc: 'Mock authentication', icon: 'card-outline' },
            ].map((method) => {
              const isSelected = paymentMethod === method.id;
              return (
                <TouchableOpacity
                  key={method.id}
                  style={[styles.paymentMethodCard, isSelected && styles.selectedPaymentMethod]}
                  onPress={() => setPaymentMethod(method.id)}
                >
                  <Ionicons
                    name={method.icon as any}
                    size={22}
                    color={isSelected ? Colors.red : Colors.textSecondary}
                  />
                  <Text style={[styles.paymentMethodLabel, isSelected && styles.selectedPaymentLabel]}>
                    {method.label}
                  </Text>
                  <Text style={styles.paymentMethodDesc}>{method.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Items Summary */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <View style={styles.titleRow}>
              <Ionicons name="basket-outline" size={20} color={Colors.red} />
              <Text style={styles.cardTitle}>Items Summary</Text>
            </View>
          </View>

          <View style={styles.summaryItemsList}>
            {cartItems.map((item) => (
              <View key={item.id} style={styles.summaryItemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.summaryItemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.summaryItemQty}>
                    ₹{parseFloat(item.price).toFixed(0)} &times; {item.quantity}
                  </Text>
                </View>
                <Text style={styles.summaryItemPrice}>
                  ₹{(parseFloat(item.price) * item.quantity).toFixed(0)}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.totalsWrapper}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalVal}>₹{subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Delivery Fee</Text>
              <Text style={styles.totalVal}>₹{deliveryFee.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>GST (5%)</Text>
              <Text style={styles.totalVal}>₹{tax.toFixed(2)}</Text>
            </View>
            <View style={[styles.totalRow, styles.grandTotalBorder]}>
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Text style={styles.grandTotalVal}>₹{grandTotal.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.placeOrderBtn, submitting && styles.disabledBtn]}
          onPress={handlePlaceOrder}
          disabled={submitting}
        >
          <Text style={styles.placeOrderText}>
            {submitting ? 'Placing Order...' : `Confirm & Pay ₹${grandTotal.toFixed(0)}`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Razorpay Simulation Modal */}
      <Modal visible={paymentModal !== 'idle'} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={[styles.modalIndicator, { backgroundColor: paymentModal === 'success' ? Colors.green : Colors.red }]} />

            <View style={styles.modalBody}>
              {paymentModal === 'loading' && <LoadingSpinner />}
              {paymentModal === 'processing' && (
                <>
                  <Ionicons name="logo-paypal" size={40} color={Colors.red} style={{ marginBottom: Spacing.sm }} />
                  <Text style={styles.modalTitle}>Razorpay Gateway Simulation</Text>
                  <Text style={styles.modalDesc}>{paymentMessage}</Text>
                  <Text style={styles.modalAmount}>Amount: ₹{grandTotal.toFixed(2)}</Text>

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
              {paymentModal === 'success' && (
                <>
                  <Ionicons name="checkmark-circle" size={48} color={Colors.green} />
                  <Text style={styles.modalTitle}>Payment Verified</Text>
                  <Text style={styles.modalDesc}>{paymentMessage}</Text>
                </>
              )}
              {paymentModal === 'failed' && (
                <>
                  <Ionicons name="close-circle" size={48} color={Colors.red} />
                  <Text style={styles.modalTitle}>Payment Failed</Text>
                  <Text style={styles.modalDesc}>{paymentMessage}</Text>
                  <TouchableOpacity
                    style={styles.modalCloseBtn}
                    onPress={() => setPaymentModal('idle')}
                  >
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
  header: {
    height: 56,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
  },
  backBtn: {
    padding: 4,
    marginRight: Spacing.md,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: 100,
    gap: Spacing.base,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    padding: 12,
    borderRadius: Radius.md,
    gap: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  sectionCard: {
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
    marginBottom: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  addAddrBtn: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.red,
  },
  addAddressForm: {
    gap: Spacing.sm,
  },
  formLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.gray500,
    textTransform: 'uppercase',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: Radius.sm,
  },
  activeTypeBtn: {
    backgroundColor: Colors.red,
    borderColor: Colors.red,
  },
  typeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.gray500,
  },
  activeTypeBtnText: {
    color: '#fff',
  },
  addrInput: {
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: Radius.sm,
    height: 40,
    paddingHorizontal: 12,
    fontSize: 12,
  },
  formRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  formActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: Radius.sm,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.gray500,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: Colors.red,
    borderRadius: Radius.sm,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  addressesList: {
    gap: Spacing.sm,
  },
  noAddressText: {
    color: Colors.gray500,
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: Spacing.md,
  },
  addressCard: {
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  selectedAddressCard: {
    borderColor: Colors.red,
    backgroundColor: Colors.redBg,
  },
  addressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  addressTag: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.gray500,
    backgroundColor: Colors.gray100,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    textTransform: 'uppercase',
  },
  addressLines: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  addressSub: {
    fontSize: 11,
    color: Colors.gray500,
    marginTop: 2,
  },
  paymentMethodsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  paymentMethodCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    textAlign: 'center',
  },
  selectedPaymentMethod: {
    borderColor: Colors.red,
    backgroundColor: Colors.redBg,
  },
  paymentMethodLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 6,
  },
  selectedPaymentLabel: {
    color: Colors.red,
  },
  paymentMethodDesc: {
    fontSize: 8,
    color: Colors.gray400,
    textAlign: 'center',
    marginTop: 2,
  },
  summaryItemsList: {
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
    paddingBottom: Spacing.md,
    marginBottom: Spacing.md,
  },
  summaryItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryItemName: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  summaryItemQty: {
    fontSize: 11,
    color: '#555555',
    marginTop: 2,
  },
  summaryItemPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  totalsWrapper: {
    gap: Spacing.xs,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 11,
    color: Colors.gray500,
    fontWeight: '600',
  },
  totalVal: {
    fontSize: 11,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  grandTotalBorder: {
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  grandTotalVal: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.red,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
    padding: Spacing.base,
  },
  placeOrderBtn: {
    backgroundColor: Colors.red,
    height: 48,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledBtn: {
    opacity: 0.6,
  },
  placeOrderText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
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
