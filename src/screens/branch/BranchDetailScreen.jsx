import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import Button from '../../components/Button';
import { useTheme } from '../../context/ThemeContext';
import { getBranchDetail } from '../../api';
import { workingHoursLabel } from '../../utils/helpers';

const { width } = Dimensions.get('window');

export default function BranchDetailScreen({ navigation, route }) {
  const { branchId } = route.params;
  const { theme } = useTheme();
  const [branch, setBranch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIndex, setImgIndex] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBranchDetail(branchId);
      setBranch(data);
    } catch {
      setBranch(null);
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
        <ScreenHeader title="" onBack={() => navigation.goBack()} />
        <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
      </SafeAreaView>
    );
  }

  if (!branch) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
        <ScreenHeader title="Not found" onBack={() => navigation.goBack()} />
        <Text style={[styles.error, { color: theme.colors.textSecondary }]}>Branch not found</Text>
      </SafeAreaView>
    );
  }

  const images = branch.images?.length
    ? branch.images.map((i) => i.image)
    : branch.first_image
      ? [branch.first_image]
      : [];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <ScreenHeader title="" onBack={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.gallery}>
          {images.length ? (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                  const idx = Math.round(e.nativeEvent.contentOffset.x / width);
                  setImgIndex(idx);
                }}
              >
                {images.map((uri, i) => (
                  <Image key={i} source={{ uri }} style={styles.heroImage} />
                ))}
              </ScrollView>
              {images.length > 1 && (
                <View style={styles.dots}>
                  {images.map((_, i) => (
                    <View
                      key={i}
                      style={[styles.dot, { backgroundColor: i === imgIndex ? theme.colors.primary : '#FFF8' }]}
                    />
                  ))}
                </View>
              )}
            </>
          ) : (
            <View style={[styles.placeholder, { backgroundColor: theme.colors.inputBg }]}>
              <Ionicons name="restaurant" size={64} color={theme.colors.textSecondary} />
            </View>
          )}
        </View>

        <View style={styles.content}>
          <Text style={[styles.brand, { color: theme.colors.primary }]}>{branch.brand_name}</Text>
          <Text style={[styles.name, { color: theme.colors.text }]}>{branch.name}</Text>
          {branch.address ? (
            <View style={styles.row}>
              <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.address, { color: theme.colors.textSecondary }]}>{branch.address}</Text>
            </View>
          ) : null}

          <InfoBlock title="Working hours" theme={theme}>
            <Text style={[styles.infoText, { color: theme.colors.text }]}>
              {workingHoursLabel(branch.working_hours)}
            </Text>
          </InfoBlock>

          <InfoBlock title="Booking hours" theme={theme}>
            <Text style={[styles.infoText, { color: theme.colors.text }]}>
              {workingHoursLabel(branch.booking_hours || branch.working_hours)}
            </Text>
          </InfoBlock>

          {branch.phone ? (
            <InfoBlock title="Contact" theme={theme}>
              <Text style={[styles.infoText, { color: theme.colors.text }]}>{branch.phone}</Text>
            </InfoBlock>
          ) : null}
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
        <Button
          title="Book now"
          onPress={() => navigation.navigate('BookingCreate', { branchId: branch.id, branchName: branch.name })}
          style={styles.bookBtn}
        />
      </View>
    </SafeAreaView>
  );
}

function InfoBlock({ title, theme, children }) {
  return (
    <View style={[styles.block, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <Text style={[styles.blockTitle, { color: theme.colors.textSecondary }]}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  loader: { marginTop: 60 },
  error: { textAlign: 'center', marginTop: 40 },
  gallery: { position: 'relative' },
  heroImage: { width, height: 240 },
  placeholder: { width, height: 240, alignItems: 'center', justifyContent: 'center' },
  dots: {
    position: 'absolute',
    bottom: 12,
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 6,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  content: { padding: 20 },
  brand: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  name: { fontSize: 26, fontWeight: '800', marginTop: 4, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  address: { fontSize: 14, flex: 1 },
  block: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  blockTitle: { fontSize: 12, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase' },
  infoText: { fontSize: 14, lineHeight: 22 },
  footer: {
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  bookBtn: { width: '100%' },
});
