import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { IconButton } from './Button';

export default function ScreenHeader({
  title,
  onBack,
  right,
  showNotification = false,
  onNotificationPress,
  notificationBadge = 0,
}) {
  const { theme } = useTheme();

  return (
    <View style={[styles.row, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
      <View style={styles.left}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backPlaceholder} />
        )}
      </View>
      <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
        {title}
      </Text>
      <View style={[styles.right, right ? styles.rightWide : null]}>
        {showNotification ? (
          <IconButton
            badge={notificationBadge}
            onPress={onNotificationPress}
            icon={<Ionicons name="notifications-outline" size={24} color={theme.colors.text} />}
          />
        ) : null}
        {right || <View style={styles.backPlaceholder} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  left: { width: 44 },
  right: { width: 44, alignItems: 'flex-end' },
  rightWide: { width: 'auto', minWidth: 44, paddingRight: 8 },
  backBtn: { padding: 4 },
  backPlaceholder: { width: 32 },
  title: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700' },
});
