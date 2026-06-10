import React from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function BranchCard({ branch, onPress, compact }) {
  const { theme } = useTheme();
  const imageUri = branch.first_image || branch.images?.[0]?.image;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        compact && styles.compact,
        { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={[styles.image, compact && styles.imageCompact]} />
      ) : (
        <View style={[styles.placeholder, compact && styles.imageCompact, { backgroundColor: theme.colors.inputBg }]}>
          <Ionicons name="restaurant-outline" size={32} color={theme.colors.textSecondary} />
        </View>
      )}
      <View style={styles.info}>
        <Text style={[styles.brand, { color: theme.colors.primary }]} numberOfLines={1}>
          {branch.brand_name}
        </Text>
        <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>
          {branch.name}
        </Text>
        {!compact && branch.address ? (
          <Text style={[styles.address, { color: theme.colors.textSecondary }]} numberOfLines={2}>
            {branch.address}
          </Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
    gap: 12,
  },
  compact: { width: 260, marginRight: 12 },
  image: { width: 72, height: 72, borderRadius: 12 },
  imageCompact: { width: 56, height: 56 },
  placeholder: {
    width: 72,
    height: 72,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1 },
  brand: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  name: { fontSize: 16, fontWeight: '700', marginTop: 2 },
  address: { fontSize: 12, marginTop: 4, lineHeight: 16 },
});
