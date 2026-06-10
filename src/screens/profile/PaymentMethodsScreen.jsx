import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import { useTheme } from '../../context/ThemeContext';

const MOCK_CARDS = [
  { id: 1, brand: 'Visa', last4: '4242', expiry: '12/28' },
];

export default function PaymentMethodsScreen({ navigation }) {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader title="Payment methods" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        {MOCK_CARDS.map((card) => (
          <View
            key={card.id}
            style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
          >
            <Ionicons name="card" size={28} color={theme.colors.primary} />
            <View style={styles.cardInfo}>
              <Text style={[styles.cardBrand, { color: theme.colors.text }]}>{card.brand}</Text>
              <Text style={[styles.cardNum, { color: theme.colors.textSecondary }]}>
                •••• {card.last4} · Exp {card.expiry}
              </Text>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={[styles.addBtn, { borderColor: theme.colors.primary }]}
          onPress={() => {}}
        >
          <Ionicons name="add-circle-outline" size={24} color={theme.colors.primary} />
          <Text style={[styles.addText, { color: theme.colors.primary }]}>Add credit card</Text>
        </TouchableOpacity>

        <Text style={[styles.note, { color: theme.colors.textSecondary }]}>
          Payment integration coming soon. This screen is ready for when card processing is connected.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardInfo: { flex: 1 },
  cardBrand: { fontSize: 16, fontWeight: '700' },
  cardNum: { fontSize: 14, marginTop: 4 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginTop: 8,
  },
  addText: { fontSize: 15, fontWeight: '700' },
  note: { fontSize: 13, marginTop: 24, lineHeight: 20, textAlign: 'center' },
});
