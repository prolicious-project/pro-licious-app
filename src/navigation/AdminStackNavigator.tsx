// src/navigation/AdminStackNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';

import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminVendorsScreen from '../screens/admin/AdminVendorsScreen';
import AdminRidersScreen from '../screens/admin/AdminRidersScreen';
import AdminTicketsScreen from '../screens/admin/AdminTicketsScreen';
import AdminAuditLogsScreen from '../screens/admin/AdminAuditLogsScreen';

export type AdminTabParamList = {
  AdminDashboard: undefined;
  AdminVendors: undefined;
  AdminRiders: undefined;
  AdminTickets: undefined;
  AdminAuditLogs: undefined;
};

const Tab = createBottomTabNavigator<AdminTabParamList>();

export default function AdminStackNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          if (route.name === 'AdminDashboard') iconName = 'grid';
          else if (route.name === 'AdminVendors') iconName = 'business';
          else if (route.name === 'AdminRiders') iconName = 'bicycle';
          else if (route.name === 'AdminTickets') iconName = 'ticket';
          else if (route.name === 'AdminAuditLogs') iconName = 'document-text';
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
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{ tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen
        name="AdminVendors"
        component={AdminVendorsScreen}
        options={{ tabBarLabel: 'Vendors' }}
      />
      <Tab.Screen
        name="AdminRiders"
        component={AdminRidersScreen}
        options={{ tabBarLabel: 'Riders' }}
      />
      <Tab.Screen
        name="AdminTickets"
        component={AdminTicketsScreen}
        options={{ tabBarLabel: 'Tickets' }}
      />
      <Tab.Screen
        name="AdminAuditLogs"
        component={AdminAuditLogsScreen}
        options={{ tabBarLabel: 'Audit' }}
      />
    </Tab.Navigator>
  );
}
