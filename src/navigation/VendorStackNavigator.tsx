// src/navigation/VendorStackNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';

import VendorDashboardScreen from '../screens/vendor/VendorDashboardScreen';
import VendorOrdersScreen from '../screens/vendor/VendorOrdersScreen';
import VendorMenuScreen from '../screens/vendor/VendorMenuScreen';
import VendorProfileScreen from '../screens/vendor/VendorProfileScreen';
import VendorSettlementsScreen from '../screens/vendor/VendorSettlementsScreen';

export type VendorTabParamList = {
  VendorDashboard: undefined;
  VendorOrders: { status?: string } | undefined;
  VendorMenu: undefined;
  VendorSettlements: undefined;
  VendorProfile: undefined;
};

const Tab = createBottomTabNavigator<VendorTabParamList>();

export default function VendorStackNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          if (route.name === 'VendorDashboard') iconName = 'grid';
          else if (route.name === 'VendorOrders') iconName = 'receipt';
          else if (route.name === 'VendorMenu') iconName = 'restaurant';
          else if (route.name === 'VendorSettlements') iconName = 'cash';
          else if (route.name === 'VendorProfile') iconName = 'settings';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.red,
        tabBarInactiveTintColor: Colors.gray400,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: Colors.gray100,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="VendorDashboard"
        component={VendorDashboardScreen}
        options={{ tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen
        name="VendorOrders"
        component={VendorOrdersScreen}
        options={{ tabBarLabel: 'Orders' }}
      />
      <Tab.Screen
        name="VendorMenu"
        component={VendorMenuScreen}
        options={{ tabBarLabel: 'Menu' }}
      />
      <Tab.Screen
        name="VendorSettlements"
        component={VendorSettlementsScreen}
        options={{ tabBarLabel: 'Payouts' }}
      />
      <Tab.Screen
        name="VendorProfile"
        component={VendorProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}
