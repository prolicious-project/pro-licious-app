// src/utils/auth.ts
// Shared authentication utilities to avoid code duplication

import { Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { logout } from '../store/slices/authSlice';

/**
 * Helper function to handle logout with confirmation dialog
 * Used by ProfileScreen and Customer screens
 */
export const handleLogoutWithConfirm = (dispatch: any, navigation: any) => {
  Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Sign Out',
      style: 'destructive',
      onPress: () => {
        dispatch(logout());
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      },
    },
  ]);
};

/**
 * Helper function for immediate logout without confirmation
 * Used by Admin, Rider, and Vendor screens
 */
export const handleLogoutImmediate = (dispatch: any, navigation: any) => {
  dispatch(logout());
  navigation.reset({
    index: 0,
    routes: [{ name: 'Login' }],
  });
};
