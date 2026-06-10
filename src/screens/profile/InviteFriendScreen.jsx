import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import Button from '../../components/Button';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { getInviteCode } from '../../utils/helpers';

export default function InviteFriendScreen({ navigation }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const code = getInviteCode(user?.id);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join me on Oldindan! Use my invite code ${code} when you sign up and discover the best restaurants in Tashkent.`,
      });
    } catch {
      /* cancelled */
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader title="Invite a friend" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <View style={[styles.iconBox, { backgroundColor: `${theme.colors.primary}18` }]}>
          <Ionicons name="gift" size={48} color={theme.colors.primary} />
        </View>
        <Text style={[styles.title, { color: theme.colors.text }]}>Share Oldindan</Text>
        <Text style={[styles.desc, { color: theme.colors.textSecondary }]}>
          Invite friends to discover and book the best restaurants & cafes in Tashkent.
        </Text>

        <View style={[styles.codeBox, { backgroundColor: theme.colors.card, borderColor: theme.colors.primary }]}>
          <Text style={[styles.codeLabel, { color: theme.colors.textSecondary }]}>Your invite code</Text>
          <Text style={[styles.code, { color: theme.colors.primary }]}>{code}</Text>
        </View>

        <Button title="Share invite code" onPress={handleShare} style={styles.btn} />

        <Text style={[styles.note, { color: theme.colors.textSecondary }]}>
          Rewards program coming soon — invite tracking will be connected to your account.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1, padding: 28, alignItems: 'center' },
  iconBox: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 8 },
  desc: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  codeBox: {
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 40,
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  codeLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  code: { fontSize: 28, fontWeight: '900', letterSpacing: 2, marginTop: 8 },
  btn: { width: '100%' },
  note: { fontSize: 13, marginTop: 24, textAlign: 'center', lineHeight: 20 },
});
