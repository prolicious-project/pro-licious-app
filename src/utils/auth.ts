// src/utils/auth.ts
// Shared authentication utilities to avoid code duplication

import { Alert } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { logout } from '../store/slices/authSlice';

/**
 * Navigate to Login screen from any navigator depth.
 * Uses CommonActions.reset which propagates up through nested navigators
 * (e.g. from a tab inside CustomerTabs to the root stack).
 */
const resetToLogin = (navigation: any) => {
  // Traverse up to find the topmost parent navigator (RootNavigator)
  let root = navigation;
  while (root.getParent()) {
    root = root.getParent();
  }
  root.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    })
  );
};

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
        resetToLogin(navigation);
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
  resetToLogin(navigation);
};
