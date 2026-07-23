// src/components/OrderStatusBadge.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  status: string;
}

type StatusConfig = {
  label: string;
  bg: string;
  text: string;
  border: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const STATUS_MAP: Record<string, StatusConfig> = {
  PLACED: { label: 'Placed', bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe', icon: 'receipt-outline' },
  ACCEPTED: { label: 'Accepted', bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0', icon: 'checkmark-circle-outline' },
  PREPARING: { label: 'Preparing', bg: '#fff7ed', text: '#c2410c', border: '#fed7aa', icon: 'flame-outline' },
  READY: { label: 'Ready', bg: '#fefce8', text: '#a16207', border: '#fef08a', icon: 'bag-check-outline' },
  PICKED_UP: { label: 'Picked Up', bg: '#f5f3ff', text: '#7c3aed', border: '#ddd6fe', icon: 'bicycle-outline' },
  OUT_FOR_DELIVERY: { label: 'On the way', bg: '#f5f3ff', text: '#7c3aed', border: '#ddd6fe', icon: 'bicycle-outline' },
  ARRIVED: { label: 'Arrived', bg: '#fef9c3', text: '#854d0e', border: '#fef08a', icon: 'location-outline' },
  DELIVERED: { label: 'Delivered', bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0', icon: 'checkmark-done-outline' },
  CANCELLED: { label: 'Cancelled', bg: '#fef2f2', text: '#dc2626', border: '#fecaca', icon: 'close-circle-outline' },
  REJECTED: { label: 'Rejected', bg: '#fef2f2', text: '#dc2626', border: '#fecaca', icon: 'close-circle-outline' },
};

export default function OrderStatusBadge({ status }: Props) {
  const config = STATUS_MAP[status] || {
    label: status,
    bg: '#f9fafb',
    text: '#374151',
    border: '#e5e7eb',
    icon: 'ellipse-outline' as keyof typeof Ionicons.glyphMap,
  };

  return (
    <View style={[styles.badge, { backgroundColor: config.bg, borderColor: config.border }]}>
      <Ionicons name={config.icon} size={11} color={config.text} />
      <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
