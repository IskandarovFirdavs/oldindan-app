import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { BRAND } from '../theme/colors';

export default function Logo({ size = 64, showText = true }) {
  const { theme } = useTheme();
  return (
    <View style={styles.wrap}>
      <View style={[styles.iconBox, { width: size, height: size, borderRadius: size * 0.22 }]}>
        <Ionicons name="restaurant" size={size * 0.5} color="#FFF" />
      </View>
      {showText && <Text style={[styles.title, { color: theme.colors.text }]}>Oldindan</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 10 },
  iconBox: {
    backgroundColor: BRAND.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
