// src/navigation/RiderStackNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';

import RiderDashboardScreen from '../screens/rider/RiderDashboardScreen';
import RiderEarningsScreen from '../screens/rider/RiderEarningsScreen';
import RiderHistoryScreen from '../screens/rider/RiderHistoryScreen';
import RiderProfileScreen from '../screens/rider/RiderProfileScreen';

export type RiderTabParamList = {
  RiderDashboard: undefined;
  RiderEarnings: undefined;
  RiderHistory: undefined;
  RiderProfile: undefined;
};

const Tab = createBottomTabNavigator<RiderTabParamList>();

export default function RiderStackNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          if (route.name === 'RiderDashboard') iconName = 'bicycle';
          else if (route.name === 'RiderEarnings') iconName = 'wallet';
          else if (route.name === 'RiderHistory') iconName = 'time';
          else if (route.name === 'RiderProfile') iconName = 'person';
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
        name="RiderDashboard"
        component={RiderDashboardScreen}
        options={{ tabBarLabel: 'Orders' }}
      />
      <Tab.Screen
        name="RiderEarnings"
        component={RiderEarningsScreen}
        options={{ tabBarLabel: 'Earnings' }}
      />
      <Tab.Screen
        name="RiderHistory"
        component={RiderHistoryScreen}
        options={{ tabBarLabel: 'History' }}
      />
      <Tab.Screen
        name="RiderProfile"
        component={RiderProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}
