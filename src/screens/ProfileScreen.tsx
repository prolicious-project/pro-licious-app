// src/screens/ProfileScreen.tsx
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
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { api } from '../lib/axios';
import { Colors, Spacing, Radius, Shadow } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import LoadingSpinner from '../components/LoadingSpinner';
import { handleLogoutWithConfirm } from '../utils/auth';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const [profile, setProfile] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Profile edit state
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [editGender, setEditGender] = useState('OTHER');

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  const fetchProfileData = async () => {
    try {
      const [profileRes, addrRes, notifRes] = await Promise.all([
        api.get('/api/customer/profile'),
        api.get('/api/customer/addresses'),
        api.get('/api/customer/notifications'),
      ]);
      const prof = profileRes.data?.data;
      setProfile(prof);
      setEditName(prof?.name || '');
      setEditGender(prof?.gender || 'OTHER');

      setAddresses(addrRes.data?.data || []);
      setNotifications(notifRes.data?.data || []);
    } catch (e) {
      console.error('Error fetching profile data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      if (!isAuthenticated) {
        navigation.navigate('Login');
        return;
      }
      if (user && user.role && user.role !== 'CUSTOMER') {
        // Route to dashboard based on role
        if (user.role === 'VENDOR') navigation.replace('VendorStack');
        else if (user.role === 'RIDER') navigation.replace('RiderStack');
        else if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') navigation.replace('AdminStack');
        return;
      }
      fetchProfileData();
    }
  }, [isAuthenticated, isFocused]);

  const handleUpdateProfile = async () => {
    if (!editName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    setError('');
    setUpdating(true);
    try {
      await api.patch('/api/customer/profile', {
        name: editName,
        gender: editGender,
      });
      setEditMode(false);
      await fetchProfileData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAddress = (id: number) => {
    Alert.alert('Delete Address', 'Are you sure you want to delete this address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/api/customer/addresses/${id}`);
            await fetchProfileData();
          } catch (e) {
            console.error('Error deleting address:', e);
          }
        },
      },
    ]);
  };

  const handleMarkRead = async (id: number) => {
    try {
      await api.patch(`/api/customer/notifications/${id}/read`);
      await fetchProfileData();
    } catch (e) {
      console.error('Error marking notification read:', e);
    }
  };

  const handleLogout = () => {
    handleLogoutWithConfirm(dispatch, navigation);
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarIconCircle}>
              <Ionicons name="person-circle" size={68} color={Colors.red} />
            </View>
            <Text style={styles.profileName}>{profile?.name}</Text>
            <Text style={styles.profileRole}>Customer Account</Text>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {editMode ? (
            <View style={styles.editForm}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.profileInput}
                value={editName}
                onChangeText={setEditName}
              />

              <Text style={styles.inputLabel}>Gender</Text>
              <View style={styles.genderSelectRow}>
                {['MALE', 'FEMALE', 'OTHER'].map((g) => (
                  <TouchableOpacity
                    key={g}
                    onPress={() => setEditGender(g)}
                    style={[styles.genderBtn, editGender === g && styles.activeGenderBtn]}
                  >
                    <Text style={[styles.genderBtnText, editGender === g && styles.activeGenderBtnText]}>
                      {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.editActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setEditMode(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleUpdateProfile} disabled={updating}>
                  <Text style={styles.saveBtnText}>{updating ? 'Saving...' : 'Save'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.detailsList}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Phone</Text>
                <Text style={styles.detailVal}>{profile?.phone || 'N/A'}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Email</Text>
                <Text style={styles.detailVal}>{profile?.email || 'N/A'}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Gender</Text>
                <Text style={styles.detailVal}>{profile?.gender || 'OTHER'}</Text>
              </View>

              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.editProfileBtn} onPress={() => setEditMode(true)}>
                  <Ionicons name="create-outline" size={16} color={Colors.gray700} />
                  <Text style={styles.editProfileBtnText}>Edit Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.signOutBtn} onPress={handleLogout}>
                  <Ionicons name="log-out-outline" size={16} color={Colors.red} />
                  <Text style={styles.signOutBtnText}>Sign Out</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Addresses */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>✓ Saved Addresses</Text>
          {addresses.length === 0 ? (
            <Text style={styles.noDataText}>No saved addresses yet.</Text>
          ) : (
            <View style={styles.addressesList}>
              {addresses.map((addr) => (
                <View key={addr.id} style={styles.addressRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.addressTypeTag}>
                      {addr.addressType} {addr.isDefault && '• DEFAULT'}
                    </Text>
                    <Text style={styles.addressText}>
                      {addr.houseNumber}, {addr.street}
                    </Text>
                    <Text style={styles.addressCity}>
                      {addr.city}, {addr.state} - {addr.pincode}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteAddrBtn}
                    onPress={() => handleDeleteAddress(addr.id)}
                  >
                    <Ionicons name="trash-outline" size={16} color={Colors.gray400} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Notifications */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>✓ Notifications</Text>
          {notifications.length === 0 ? (
            <Text style={styles.noDataText}>No notifications yet.</Text>
          ) : (
            <View style={styles.notificationsList}>
              {notifications.map((n) => (
                <View key={n.id} style={[styles.notificationRow, n.isRead && styles.readNotification]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.notificationTitle}>{n.title}</Text>
                    <Text style={styles.notificationMsg}>{n.message}</Text>
                    <Text style={styles.notificationTime}>
                      {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  {!n.isRead && (
                    <TouchableOpacity
                      style={styles.markReadBtn}
                      onPress={() => handleMarkRead(n.id)}
                    >
                      <Ionicons name="checkmark-done" size={16} color={Colors.red} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  scrollContent: {
    padding: Spacing.base,
    gap: Spacing.base,
    paddingBottom: Spacing['3xl'],
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.gray100,
    ...Shadow.sm,
  },
  avatarWrapper: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  avatarIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.redBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.redBorder,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  profileRole: {
    fontSize: 11,
    color: Colors.gray500,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  errorBox: {
    backgroundColor: Colors.redBg,
    borderWidth: 1,
    borderColor: Colors.redBorder,
    padding: 10,
    borderRadius: Radius.md,
    marginBottom: Spacing.base,
  },
  errorText: {
    color: Colors.red,
    fontSize: 12,
    fontWeight: '600',
  },
  editForm: {
    gap: Spacing.sm,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.gray500,
    textTransform: 'uppercase',
  },
  profileInput: {
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: Radius.sm,
    height: 40,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  genderSelectRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  genderBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: Radius.sm,
  },
  activeGenderBtn: {
    backgroundColor: Colors.red,
    borderColor: Colors.red,
  },
  genderBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.gray500,
  },
  activeGenderBtnText: {
    color: '#fff',
  },
  editActions: {
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
  detailsList: {
    gap: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
    paddingTop: Spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.gray400,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  detailVal: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '800',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  editProfileBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: Radius.md,
  },
  editProfileBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.gray700,
  },
  signOutBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    borderWidth: 1,
    borderColor: Colors.redBorder,
    backgroundColor: Colors.redBg,
    borderRadius: Radius.md,
  },
  signOutBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.red,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.gray100,
    ...Shadow.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.md,
  },
  noDataText: {
    color: Colors.gray400,
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: Spacing.md,
  },
  addressesList: {
    gap: Spacing.md,
  },
  addressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  addressTypeTag: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.gray700,
    backgroundColor: Colors.gray100,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    textTransform: 'uppercase',
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  addressCity: {
    fontSize: 11,
    color: Colors.gray500,
    marginTop: 2,
  },
  deleteAddrBtn: {
    padding: 6,
  },
  notificationsList: {
    gap: Spacing.sm,
  },
  notificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.redBorder,
    backgroundColor: 'rgba(239, 68, 68, 0.03)',
  },
  readNotification: {
    borderColor: Colors.gray100,
    backgroundColor: '#fff',
    opacity: 0.6,
  },
  notificationTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  notificationMsg: {
    fontSize: 11,
    color: Colors.gray500,
    marginTop: 2,
    lineHeight: 15,
  },
  notificationTime: {
    fontSize: 9,
    color: Colors.gray400,
    marginTop: 4,
  },
  markReadBtn: {
    padding: 6,
  },
});
