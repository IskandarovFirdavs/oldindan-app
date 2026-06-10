import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
}) {
  const { theme } = useTheme();
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        {
          backgroundColor: isOutline || isGhost ? 'transparent' : theme.colors.primary,
          borderColor: isOutline ? theme.colors.primary : 'transparent',
          borderWidth: isOutline ? 1.5 : 0,
          opacity: disabled || loading ? 0.55 : 1,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={isOutline || isGhost ? theme.colors.primary : '#FFF'} />
      ) : (
        <Text
          style={[
            styles.text,
            { color: isOutline || isGhost ? theme.colors.primary : '#FFF' },
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export function IconButton({ icon, onPress, badge }) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity onPress={onPress} style={styles.iconBtn} activeOpacity={0.7}>
      {icon}
      {badge > 0 && (
        <View style={[styles.badge, { backgroundColor: theme.colors.badge }]}>
          <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  text: { fontSize: 16, fontWeight: '700' },
  iconBtn: { padding: 8, position: 'relative' },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
});
