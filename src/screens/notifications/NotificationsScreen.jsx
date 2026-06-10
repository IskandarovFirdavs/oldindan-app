import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import DetailModal from '../../components/DetailModal';
import Button from '../../components/Button';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import { formatDateTime } from '../../utils/helpers';

export default function NotificationsScreen({ navigation }) {
  const { theme } = useTheme();
  const { notifications, loading, markRead, markAllRead, refresh } = useNotifications();
  const [selected, setSelected] = useState(null);

  const openNotification = async (item) => {
    if (!item.is_read) {
      await markRead(item.id);
    }
    setSelected(item);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.item,
        {
          backgroundColor: item.is_read ? theme.colors.card : `${theme.colors.primary}12`,
          borderColor: theme.colors.border,
        },
      ]}
      onPress={() => openNotification(item)}
    >
      {!item.is_read && <View style={[styles.unreadDot, { backgroundColor: theme.colors.primary }]} />}
      <View style={styles.itemContent}>
        <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.message, { color: theme.colors.textSecondary }]} numberOfLines={2}>
          {item.message}
        </Text>
        <Text style={[styles.time, { color: theme.colors.textSecondary }]}>
          {formatDateTime(item.created_at)}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader
        title="Notifications"
        onBack={() => navigation.goBack()}
        right={
          notifications.some((n) => !n.is_read) ? (
            <TouchableOpacity onPress={markAllRead}>
              <Text style={[styles.readAll, { color: theme.colors.primary }]}>Read all</Text>
            </TouchableOpacity>
          ) : null
        }
      />

      {loading ? (
        <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          onRefresh={refresh}
          refreshing={loading}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="notifications-off-outline" size={56} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No notifications yet
              </Text>
            </View>
          }
        />
      )}

      <DetailModal
        visible={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.title || 'Notification'}
      >
        {selected && (
          <View>
            <Text style={[styles.detailMsg, { color: theme.colors.text }]}>{selected.message}</Text>
            <Text style={[styles.detailTime, { color: theme.colors.textSecondary }]}>
              {formatDateTime(selected.created_at)}
            </Text>
            {selected.data?.booking_id ? (
              <Button
                title="View booking"
                variant="outline"
                onPress={() => {
                  setSelected(null);
                  navigation.navigate('MainTabs', { screen: 'BookingsTab' });
                }}
                style={{ marginTop: 16 }}
              />
            ) : null}
          </View>
        )}
      </DetailModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  readAll: { fontSize: 14, fontWeight: '700' },
  loader: { marginTop: 60 },
  list: { padding: 16, flexGrow: 1 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    gap: 10,
  },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  itemContent: { flex: 1 },
  title: { fontSize: 15, fontWeight: '700' },
  message: { fontSize: 13, marginTop: 4, lineHeight: 18 },
  time: { fontSize: 11, marginTop: 6 },
  empty: { alignItems: 'center', marginTop: 80, gap: 12 },
  emptyText: { fontSize: 15 },
  detailMsg: { fontSize: 15, lineHeight: 22 },
  detailTime: { fontSize: 12, marginTop: 12 },
});
