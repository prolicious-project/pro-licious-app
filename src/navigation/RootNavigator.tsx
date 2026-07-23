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
  Login: undefined;
  Signup: undefined;
  CustomerTabs: undefined;
  VendorStack: undefined;
  RiderStack: undefined;
  AdminStack: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [bootstrapping, setBootstrapping] = useState(true);

  // On app start: restore session from AsyncStorage
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const res = await api.get('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const userData = res.data?.data;
          if (userData) {
            dispatch(setCredentials({ user: userData, token }));
          }
        }
      } catch (e) {
        await AsyncStorage.removeItem('token');
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
    if (!isAuthenticated) return 'Login';
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

        {/* Customer */}
        <Stack.Screen name="CustomerTabs" component={CustomerTabNavigator} />

        {/* Role dashboards */}
        <Stack.Screen name="VendorStack" component={VendorStackNavigator} />
        <Stack.Screen name="RiderStack" component={RiderStackNavigator} />
        <Stack.Screen name="AdminStack" component={AdminStackNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
