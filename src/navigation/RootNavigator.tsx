// src/navigation/RootNavigator.tsx
// Central navigation gating: unauthenticated → Auth screens, authenticated → role-based dashboards
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootState } from '../store/store';
import { setCredentials } from '../store/slices/authSlice';
import { api } from '../lib/axios';

// Auth screens
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';

// Customer tab navigator
import CustomerTabNavigator from './CustomerTabNavigator';

// Dashboard stacks
import VendorStackNavigator from './VendorStackNavigator';
import RiderStackNavigator from './RiderStackNavigator';
import AdminStackNavigator from './AdminStackNavigator';

import LoadingSpinner from '../components/LoadingSpinner';

export type RootStackParamList = {
  Login: { returnToCheckout?: boolean } | undefined;
  Signup: undefined;
  CustomerTabs: undefined;
  VendorStack: undefined;
  RiderStack: undefined;
  AdminStack: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isAuthenticated, isGuest, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [bootstrapping, setBootstrapping] = useState(true);

  // On app start: restore session from AsyncStorage
  // Uses Promise.race to guarantee setBootstrapping(false) fires within 6s
  // even if the backend is cold-starting or the network is restricted.
  useEffect(() => {
    const SESSION_TIMEOUT_MS = 6000;

    const restoreSession = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          // Race the API call against a timeout so the app never hangs
          const timeoutPromise = new Promise<null>((resolve) =>
            setTimeout(() => resolve(null), SESSION_TIMEOUT_MS)
          );
          const apiPromise = api
            .get('/api/auth/me', {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => res.data?.data ?? null)
            .catch(() => null);

          const userData = await Promise.race([apiPromise, timeoutPromise]);
          if (userData) {
            dispatch(setCredentials({ user: userData as any, token }));
          } else {
            // Timed out or API failed — clear stale token and show Login
            await AsyncStorage.removeItem('token');
          }
        }
      } catch (e) {
        // Storage read error — clear and proceed to Login
        try { await AsyncStorage.removeItem('token'); } catch {}
      } finally {
        setBootstrapping(false);
      }
    };

    restoreSession();
  }, []);

  if (bootstrapping) {
    return <LoadingSpinner fullScreen />;
  }

  const getInitialRoute = (): keyof RootStackParamList => {
    if (isAuthenticated) {
      switch (user?.role) {
        case 'SUPER_ADMIN':
        case 'ADMIN':
          return 'AdminStack';
        case 'VENDOR':
          return 'VendorStack';
        case 'RIDER':
          return 'RiderStack';
        default:
          return 'CustomerTabs';
      }
    }
    // Guest users go straight to customer browsing, others see Login
    if (isGuest) return 'CustomerTabs';
    return 'Login';
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={getInitialRoute()}
        screenOptions={{ headerShown: false, animation: 'fade' }}
      >
        {/* Auth */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />

        {/* Customer — accessible by both authenticated users and guests */}
        <Stack.Screen name="CustomerTabs" component={CustomerTabNavigator} />

        {/* Role dashboards */}
        <Stack.Screen name="VendorStack" component={VendorStackNavigator} />
        <Stack.Screen name="RiderStack" component={RiderStackNavigator} />
        <Stack.Screen name="AdminStack" component={AdminStackNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
