import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../../components/ScreenHeader';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useTheme } from '../../context/ThemeContext';
import {
  getBranchDetail,
  getBranchFloors,
  getBranchTables,
  getTableSlots,
  createBooking,
} from '../../api';
import { buildIsoDateTime, formatDateForApi, getTodayStr } from '../../utils/helpers';

export default function BookingCreateScreen({ navigation, route }) {
  const { branchId, branchName } = route.params;
  const { theme } = useTheme();

  const [branch, setBranch] = useState(null);
  const [floors, setFloors] = useState([]);
  const [tables, setTables] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [floorId, setFloorId] = useState(null);
  const [zoneId, setZoneId] = useState(null);
  const [tableId, setTableId] = useState(null);
  const [guestCount, setGuestCount] = useState('2');
  const [childrenCount, setChildrenCount] = useState('0');
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [specialRequest, setSpecialRequest] = useState('');
  const [date] = useState(getTodayStr());
  const [error, setError] = useState('');

  const zones = useMemo(() => {
    const floor = floors.find((f) => f.id === floorId);
    return floor?.zones?.filter((z) => z.is_active) || [];
  }, [floors, floorId]);

  const filteredTables = useMemo(() => {
    let list = tables;
    if (floorId) list = list.filter((t) => t.floor === floorId);
    if (zoneId) list = list.filter((t) => t.zone === zoneId);
    return list;
  }, [tables, floorId, zoneId]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [b, f, t] = await Promise.all([
          getBranchDetail(branchId),
          getBranchFloors(branchId),
          getBranchTables(branchId),
        ]);
        setBranch(b);
        setFloors(f);
        setTables(t);
        if (f.length) setFloorId(f[0].id);
      } catch {
        setError('Failed to load branch data');
      } finally {
        setLoading(false);
      }
    })();
  }, [branchId]);

  const loadSlots = useCallback(async () => {
    if (!tableId) return;
    try {
      const data = await getTableSlots(tableId, date);
      setSlots(data.slots || []);
      setSelectedSlots([]);
    } catch {
      setSlots([]);
    }
  }, [tableId, date]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  const toggleSlot = (slot) => {
    if (slot.status !== 'available') return;
    setSelectedSlots((prev) => {
      const idx = prev.indexOf(slot.start);
      if (idx >= 0) {
        const next = [...prev];
        next.splice(idx, 1);
        return next;
      }
      const availableStarts = slots.filter((s) => s.status === 'available').map((s) => s.start);
      const newSel = [...prev, slot.start].sort();
      const indices = newSel.map((s) => availableStarts.indexOf(s));
      const consecutive = indices.every((v, i) => i === 0 || v === indices[i - 1] + 1);
      if (!consecutive) return [slot.start];
      if (newSel.length > 6) return prev;
      return newSel;
    });
  };

  const slotColor = (status, selected) => {
    if (selected) return theme.colors.primary;
    if (status === 'available') return theme.colors.success;
    if (status === 'past') return theme.colors.border;
    return theme.colors.error;
  };

  const handleSubmit = async () => {
    setError('');
    if (!floorId || !tableId) {
      setError('Select floor and table');
      return;
    }
    if (!selectedSlots.length) {
      setError('Select at least one time slot');
      return;
    }
    const sorted = [...selectedSlots].sort();
    const lastSlot = slots.find((s) => s.start === sorted[sorted.length - 1]);
    if (!lastSlot) {
      setError('Invalid slot selection');
      return;
    }

    setSubmitting(true);
    try {
      const result = await createBooking({
        branch: branchId,
        floor: floorId,
        zone: zoneId || null,
        table: tableId,
        guest_count: parseInt(guestCount, 10) || 1,
        children_count: parseInt(childrenCount, 10) || 0,
        booking_start: buildIsoDateTime(date, sorted[0]),
        booking_end: buildIsoDateTime(date, lastSlot.end),
        special_request: specialRequest,
      });
      navigation.replace('BookingSuccess', {
        bookingNumber: result.booking_number,
        branchName: branchName || branch?.name,
      });
    } catch (e) {
      setError(e.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
        <ScreenHeader title="Book a table" onBack={() => navigation.goBack()} />
        <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <ScreenHeader title="Book a table" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={[styles.branchLabel, { color: theme.colors.textSecondary }]}>
          {branchName || branch?.name}
        </Text>

        <PickerRow label="Floor" theme={theme}>
          {floors.map((f) => (
            <Chip
              key={f.id}
              label={f.name}
              selected={floorId === f.id}
              onPress={() => { setFloorId(f.id); setZoneId(null); setTableId(null); }}
              theme={theme}
            />
          ))}
        </PickerRow>

        {zones.length > 0 && (
          <PickerRow label="Zone" theme={theme}>
            <Chip label="Any" selected={!zoneId} onPress={() => setZoneId(null)} theme={theme} />
            {zones.map((z) => (
              <Chip
                key={z.id}
                label={z.name}
                selected={zoneId === z.id}
                onPress={() => { setZoneId(z.id); setTableId(null); }}
                theme={theme}
              />
            ))}
          </PickerRow>
        )}

        <PickerRow label="Table" theme={theme}>
          {filteredTables.map((t) => (
            <Chip
              key={t.id}
              label={`${t.name} (${t.seats})`}
              selected={tableId === t.id}
              onPress={() => setTableId(t.id)}
              theme={theme}
            />
          ))}
        </PickerRow>

        <View style={styles.row2}>
          <View style={styles.half}>
            <Input label="Guests" value={guestCount} onChangeText={setGuestCount} keyboardType="number-pad" />
          </View>
          <View style={styles.half}>
            <Input label="Children" value={childrenCount} onChangeText={setChildrenCount} keyboardType="number-pad" />
          </View>
        </View>

        {tableId ? (
          <>
            <Text style={[styles.label, { color: theme.colors.text }]}>Select time ({date})</Text>
            <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
              Tap consecutive slots (max 3 hours). Green = available.
            </Text>
            <View style={styles.slotsGrid}>
              {slots.map((slot) => {
                const selected = selectedSlots.includes(slot.start);
                return (
                  <TouchableOpacity
                    key={slot.start}
                    style={[
                      styles.slot,
                      {
                        backgroundColor: `${slotColor(slot.status, selected)}22`,
                        borderColor: slotColor(slot.status, selected),
                        opacity: slot.status === 'past' ? 0.4 : 1,
                      },
                    ]}
                    onPress={() => toggleSlot(slot)}
                    disabled={slot.status !== 'available'}
                  >
                    <Text style={[styles.slotText, { color: theme.colors.text }]}>{slot.start}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        ) : null}

        <Input
          label="Special request"
          value={specialRequest}
          onChangeText={setSpecialRequest}
          placeholder="Window seat, birthday, allergies..."
          multiline
        />

        {error ? <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text> : null}
        <Button title="Confirm booking" onPress={handleSubmit} loading={submitting} style={styles.btn} />
      </ScrollView>
    </SafeAreaView>
  );
}

function PickerRow({ label, theme, children }) {
  return (
    <View style={styles.pickerSection}>
      <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {children}
      </ScrollView>
    </View>
  );
}

function Chip({ label, selected, onPress, theme }) {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        {
          backgroundColor: selected ? theme.colors.primary : theme.colors.inputBg,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
        },
      ]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, { color: selected ? '#FFF' : theme.colors.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40 },
  loader: { marginTop: 60 },
  branchLabel: { fontSize: 14, marginBottom: 16, fontWeight: '600' },
  pickerSection: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  hint: { fontSize: 12, marginBottom: 10 },
  chips: { gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: { fontSize: 14, fontWeight: '600' },
  row2: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  slot: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    minWidth: 72,
    alignItems: 'center',
  },
  slotText: { fontSize: 13, fontWeight: '600' },
  error: { marginBottom: 12, fontSize: 13 },
  btn: { marginTop: 8 },
});
