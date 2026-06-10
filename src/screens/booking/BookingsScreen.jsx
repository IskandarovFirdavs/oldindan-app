import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import StatusBadge from '../../components/StatusBadge';
import DetailModal from '../../components/DetailModal';
import { IconButton } from '../../components/Button';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications, useUnreadBookingChats } from '../../context/NotificationContext';
import { getMyBookings } from '../../api';
import { ACTIVE_BOOKING_STATUSES } from '../../api/config';
import { formatBookingNumber, formatDateTime } from '../../utils/helpers';

export default function BookingsScreen({ navigation }) {
  const { theme } = useTheme();
  const { unreadCount } = useNotifications();
  const unreadChats = useUnreadBookingChats();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    try {
      const data = await getMyBookings();
      const current = data.filter((b) => ACTIVE_BOOKING_STATUSES.includes(b.status));
      setBookings(current);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load]),
  );

  const renderItem = ({ item }) => {
    const hasUnread = unreadChats.has(item.id);
    const showNumber = ACTIVE_BOOKING_STATUSES.includes(item.status);

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
        onPress={() => setSelected(item)}
        activeOpacity={0.85}
      >
        <View style={styles.cardTop}>
          <View style={styles.cardLeft}>
            {showNumber && (
              <Text style={[styles.number, { color: theme.colors.primary }]}>
                {formatBookingNumber(item.booking_number)}
              </Text>
            )}
            <Text style={[styles.branch, { color: theme.colors.text }]} numberOfLines={1}>
              {item.branch_name}
            </Text>
            <Text style={[styles.time, { color: theme.colors.textSecondary }]}>
              {formatDateTime(item.booking_start)}
            </Text>
          </View>
          <View style={styles.cardRight}>
            <StatusBadge status={item.status} />
            <IconButton
              badge={hasUnread ? 1 : 0}
              onPress={() => navigation.navigate('BookingChat', { bookingId: item.id, branchName: item.branch_name })}
              icon={<Ionicons name="chatbubble-outline" size={22} color={theme.colors.primary} />}
            />
          </View>
        </View>
        <View style={styles.meta}>
          <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
            {item.table_name} · {item.guest_count} guests
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>My Bookings</Text>
        <IconButton
          badge={unreadCount}
          onPress={() => navigation.navigate('Notifications')}
          icon={<Ionicons name="notifications-outline" size={24} color={theme.colors.text} />}
        />
      </View>

      {loading ? (
        <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(); }}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="calendar-outline" size={56} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No active bookings
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('HomeTab')}>
                <Text style={[styles.emptyLink, { color: theme.colors.primary }]}>Find a place</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      <DetailModal
        visible={!!selected}
        onClose={() => setSelected(null)}
        title="Booking details"
      >
        {selected && (
          <BookingDetailContent
            booking={selected}
            theme={theme}
            onChat={() => {
              setSelected(null);
              navigation.navigate('BookingChat', {
                bookingId: selected.id,
                branchName: selected.branch_name,
              });
            }}
          />
        )}
      </DetailModal>
    </SafeAreaView>
  );
}

function BookingDetailContent({ booking, theme, onChat }) {
  const showNumber = ACTIVE_BOOKING_STATUSES.includes(booking.status);

  return (
    <View style={styles.detail}>
      {showNumber && (
        <View style={[styles.detailNumber, { backgroundColor: `${theme.colors.primary}15` }]}>
          <Text style={[styles.detailNumberLabel, { color: theme.colors.textSecondary }]}>Booking #</Text>
          <Text style={[styles.detailNumberVal, { color: theme.colors.primary }]}>
            {formatBookingNumber(booking.booking_number)}
          </Text>
        </View>
      )}
      <DetailRow label="Status" theme={theme}>
        <StatusBadge status={booking.status} />
      </DetailRow>
      <DetailRow label="Restaurant" value={booking.branch_name} theme={theme} />
      <DetailRow label="Floor / Table" value={`${booking.floor_name} · ${booking.table_name}`} theme={theme} />
      {booking.zone_name ? <DetailRow label="Zone" value={booking.zone_name} theme={theme} /> : null}
      <DetailRow label="When" value={formatDateTime(booking.booking_start)} theme={theme} />
      <DetailRow label="Until" value={formatDateTime(booking.booking_end)} theme={theme} />
      <DetailRow label="Guests" value={`${booking.guest_count} (+ ${booking.children_count} children)`} theme={theme} />
      {booking.special_request ? (
        <DetailRow label="Request" value={booking.special_request} theme={theme} />
      ) : null}
      <TouchableOpacity style={[styles.chatBtn, { borderColor: theme.colors.primary }]} onPress={onChat}>
        <Ionicons name="chatbubble-outline" size={18} color={theme.colors.primary} />
        <Text style={[styles.chatBtnText, { color: theme.colors.primary }]}>Open chat</Text>
      </TouchableOpacity>
    </View>
  );
}

function DetailRow({ label, value, theme, children }) {
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
      {children || <Text style={[styles.detailValue, { color: theme.colors.text }]}>{value}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 22, fontWeight: '800' },
  loader: { marginTop: 60 },
  list: { padding: 16, flexGrow: 1 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between' },
  cardLeft: { flex: 1 },
  cardRight: { alignItems: 'flex-end', gap: 8 },
  number: { fontSize: 20, fontWeight: '900', letterSpacing: 1, marginBottom: 4 },
  branch: { fontSize: 16, fontWeight: '700' },
  time: { fontSize: 13, marginTop: 4 },
  meta: { marginTop: 10 },
  metaText: { fontSize: 12 },
  empty: { alignItems: 'center', marginTop: 80, gap: 12 },
  emptyText: { fontSize: 16 },
  emptyLink: { fontSize: 15, fontWeight: '700' },
  detail: { gap: 4 },
  detailNumber: { borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 12 },
  detailNumberLabel: { fontSize: 12, fontWeight: '600' },
  detailNumberVal: { fontSize: 32, fontWeight: '900', letterSpacing: 3, marginTop: 4 },
  detailRow: { paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#00000010' },
  detailLabel: { fontSize: 12, marginBottom: 4 },
  detailValue: { fontSize: 15, fontWeight: '500' },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  chatBtnText: { fontSize: 15, fontWeight: '700' },
});
