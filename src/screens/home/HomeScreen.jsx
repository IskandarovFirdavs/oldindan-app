import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import BranchCard from '../../components/BranchCard';
import { IconButton } from '../../components/Button';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import { getBranches } from '../../api';
import { BRAND } from '../../theme/colors';

const TASHKENT = { latitude: 41.2995, longitude: 69.2401 };

export default function HomeScreen({ navigation }) {
  const { theme } = useTheme();
  const { unreadCount } = useNotifications();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(TASHKENT);

  const load = useCallback(async (coords) => {
    setLoading(true);
    try {
      const params = coords
        ? { lat: coords.latitude, lng: coords.longitude }
        : {};
      const data = await getBranches(params);
      setBranches(data);
    } catch {
      setBranches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          const coords = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          };
          setLocation(coords);
          await load(coords);
          return;
        }
      } catch {
        /* use default */
      }
      await load(TASHKENT);
    })();
  }, [load]);

  const nearby = branches.slice(0, 5);
  const popular = [...branches].slice(0, 8);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={[styles.topBar, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity style={styles.cityBtn}>
          <Ionicons name="location" size={18} color={theme.colors.primary} />
          <Text style={[styles.city, { color: theme.colors.text }]}>Tashkent</Text>
          <Ionicons name="chevron-down" size={16} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.topRight}>
          <IconButton
            badge={unreadCount}
            onPress={() => navigation.navigate('Notifications')}
            icon={<Ionicons name="notifications-outline" size={24} color={theme.colors.text} />}
          />
          <TouchableOpacity onPress={() => navigation.navigate('SearchTab')} hitSlop={8}>
            <Ionicons name="search" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.mapWrap}>
          <MapView
            style={styles.map}
            initialRegion={{
              ...location,
              latitudeDelta: 0.08,
              longitudeDelta: 0.08,
            }}
            region={{
              ...location,
              latitudeDelta: 0.08,
              longitudeDelta: 0.08,
            }}
          >
            {branches
              .filter((b) => b.latitude && b.longitude)
              .map((b) => (
                <Marker
                  key={b.id}
                  coordinate={{ latitude: b.latitude, longitude: b.longitude }}
                  title={b.brand_name}
                  description={b.name}
                  pinColor={BRAND.red}
                  onCalloutPress={() =>
                    navigation.navigate('BranchDetail', { branchId: b.id })
                  }
                />
              ))}
          </MapView>
        </View>

        {loading ? (
          <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
        ) : (
          <>
            <Section
              title="Near you"
              theme={theme}
              data={nearby}
              onPress={(b) => navigation.navigate('BranchDetail', { branchId: b.id })}
              horizontal
            />
            <Section
              title="Popular places"
              theme={theme}
              data={popular}
              onPress={(b) => navigation.navigate('BranchDetail', { branchId: b.id })}
            />
            <Section
              title="Top rated"
              theme={theme}
              data={branches.slice(0, 6)}
              onPress={(b) => navigation.navigate('BranchDetail', { branchId: b.id })}
              horizontal
            />
          </>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, theme, data, onPress, horizontal }) {
  if (!data.length) return null;

  if (horizontal) {
    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{title}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
          {data.map((b) => (
            <BranchCard key={b.id} branch={b} onPress={() => onPress(b)} compact />
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{title}</Text>
      {data.map((b) => (
        <BranchCard key={`${title}-${b.id}`} branch={b} onPress={() => onPress(b)} />
      ))}
    </View>
  );
}

const mapHeight = Dimensions.get('window').height * 0.32;

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  cityBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  city: { fontSize: 16, fontWeight: '700' },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  mapWrap: { height: mapHeight, margin: 16, borderRadius: 16, overflow: 'hidden' },
  map: { flex: 1 },
  loader: { marginVertical: 40 },
  section: { paddingHorizontal: 16, marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 12 },
  hScroll: { paddingRight: 16 },
});
