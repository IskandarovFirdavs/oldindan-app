import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BOOKING_STATUS } from '../api/config';

export default function StatusBadge({ status }) {
  const cfg = BOOKING_STATUS[status] || { label: status, color: '#6B7280' };

  return (
    <View style={[styles.badge, { backgroundColor: `${cfg.color}22` }]}>
      <View style={[styles.dot, { backgroundColor: cfg.color }]} />
      <Text style={[styles.text, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: 12, fontWeight: '600' },
});
