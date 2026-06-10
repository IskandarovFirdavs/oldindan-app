import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import { useTheme } from '../../context/ThemeContext';
import { formatBookingNumber } from '../../utils/helpers';
import { BRAND } from '../../theme/colors';

export default function BookingSuccessScreen({ navigation, route }) {
  const { bookingNumber, branchName } = route.params;
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.iconCircle, { backgroundColor: `${theme.colors.success}22` }]}>
          <Ionicons name="checkmark-circle" size={72} color={theme.colors.success} />
        </View>
        <Text style={[styles.title, { color: theme.colors.text }]}>Booking confirmed!</Text>
        <Text style={[styles.sub, { color: theme.colors.textSecondary }]}>
          Show this number at reception
        </Text>

        <View style={[styles.numberBox, { backgroundColor: theme.colors.card, borderColor: BRAND.red }]}>
          <Text style={[styles.numberLabel, { color: theme.colors.textSecondary }]}>Booking number</Text>
          <Text style={[styles.number, { color: BRAND.red }]}>
            {formatBookingNumber(bookingNumber)}
          </Text>
        </View>

        {branchName ? (
          <Text style={[styles.branch, { color: theme.colors.text }]}>{branchName}</Text>
        ) : null}

        <Button
          title="View my bookings"
          onPress={() => navigation.navigate('MainTabs', { screen: 'BookingsTab' })}
          style={styles.btn}
        />
        <Button
          title="Back to home"
          variant="outline"
          onPress={() => navigation.navigate('MainTabs', { screen: 'HomeTab' })}
          style={styles.btn2}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 8 },
  sub: { fontSize: 15, marginBottom: 32, textAlign: 'center' },
  numberBox: {
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 40,
    alignItems: 'center',
    marginBottom: 16,
  },
  numberLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: 8 },
  number: { fontSize: 40, fontWeight: '900', letterSpacing: 4 },
  branch: { fontSize: 16, fontWeight: '600', marginBottom: 32 },
  btn: { width: '100%', marginBottom: 12 },
  btn2: { width: '100%' },
});
