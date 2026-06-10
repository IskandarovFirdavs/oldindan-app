import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import ScreenHeader from '../../components/ScreenHeader';
import StatusBadge from '../../components/StatusBadge';
import DetailModal from '../../components/DetailModal';
import { useTheme } from '../../context/ThemeContext';
import { getMyBookings } from '../../api';
import { formatBookingNumber, formatDateTime } from '../../utils/helpers';

export default function BookingHistoryScreen({ navigation }) {
  const { theme } = useTheme();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    try {
      const data = await getMyBookings({ past: 'true' });
      setBookings(data);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load]),
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader title="Booking history" onBack={() => navigation.goBack()} />
      {loading ? (
        <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
              onPress={() => setSelected(item)}
            >
              <View style={styles.row}>
                <Text style={[styles.branch, { color: theme.colors.text }]}>{item.branch_name}</Text>
                <StatusBadge status={item.status} />
              </View>
              <Text style={[styles.time, { color: theme.colors.textSecondary }]}>
                {formatDateTime(item.booking_start)}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: theme.colors.textSecondary }]}>No past bookings yet</Text>
          }
        />
      )}

      <DetailModal visible={!!selected} onClose={() => setSelected(null)} title="Booking details">
        {selected && (
          <View>
            <Text style={[styles.histLabel, { color: theme.colors.textSecondary }]}>Booking number</Text>
            <Text style={[styles.histNumber, { color: theme.colors.text }]}>
              {formatBookingNumber(selected.booking_number)}
            </Text>
            <Text style={[styles.histRow, { color: theme.colors.text }]}>
              {selected.branch_name} · {selected.table_name}
            </Text>
            <Text style={[styles.histRow, { color: theme.colors.textSecondary }]}>
              {formatDateTime(selected.booking_start)} — {formatDateTime(selected.booking_end)}
            </Text>
            <View style={{ marginTop: 8 }}>
              <StatusBadge status={selected.status} />
            </View>
          </View>
        )}
      </DetailModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  loader: { marginTop: 60 },
  list: { padding: 16, flexGrow: 1 },
  card: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  branch: { fontSize: 16, fontWeight: '700', flex: 1 },
  time: { fontSize: 13, marginTop: 6 },
  empty: { textAlign: 'center', marginTop: 60, fontSize: 15 },
  histLabel: { fontSize: 12, marginBottom: 4 },
  histNumber: { fontSize: 22, fontWeight: '800', letterSpacing: 2, marginBottom: 12 },
  histRow: { fontSize: 14, marginBottom: 4 },
});
