import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import { useTheme } from '../../context/ThemeContext';

const FAQ = [
  { q: 'How do I check in?', a: 'Show your booking number (#XXXXXX) at reception when you arrive.' },
  { q: 'Can I cancel a booking?', a: 'Yes, open your active booking and contact the restaurant via chat.' },
  { q: 'How long is my booking?', a: 'Select consecutive 30-minute slots — up to 3 hours total.' },
];

export default function SupportScreen({ navigation }) {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader title="Support" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <TouchableOpacity
          style={[styles.contactCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
          onPress={() => Linking.openURL('mailto:support@oldindan.uz')}
        >
          <Ionicons name="mail-outline" size={24} color={theme.colors.primary} />
          <View style={styles.contactInfo}>
            <Text style={[styles.contactTitle, { color: theme.colors.text }]}>Email us</Text>
            <Text style={[styles.contactSub, { color: theme.colors.textSecondary }]}>support@oldindan.uz</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.contactCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
          onPress={() => Linking.openURL('tel:+998712345678')}
        >
          <Ionicons name="call-outline" size={24} color={theme.colors.primary} />
          <View style={styles.contactInfo}>
            <Text style={[styles.contactTitle, { color: theme.colors.text }]}>Call us</Text>
            <Text style={[styles.contactSub, { color: theme.colors.textSecondary }]}>+998 71 234 56 78</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <Text style={[styles.faqTitle, { color: theme.colors.text }]}>FAQ</Text>
        {FAQ.map((item, i) => (
          <View
            key={i}
            style={[styles.faqItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
          >
            <Text style={[styles.faqQ, { color: theme.colors.text }]}>{item.q}</Text>
            <Text style={[styles.faqA, { color: theme.colors.textSecondary }]}>{item.a}</Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 20 },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  contactInfo: { flex: 1 },
  contactTitle: { fontSize: 16, fontWeight: '700' },
  contactSub: { fontSize: 13, marginTop: 2 },
  faqTitle: { fontSize: 18, fontWeight: '800', marginTop: 16, marginBottom: 12 },
  faqItem: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10 },
  faqQ: { fontSize: 15, fontWeight: '700', marginBottom: 6 },
  faqA: { fontSize: 14, lineHeight: 20 },
});
