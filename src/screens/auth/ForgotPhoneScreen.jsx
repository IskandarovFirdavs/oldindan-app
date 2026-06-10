import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../../components/ScreenHeader';
import PhoneInput from '../../components/PhoneInput';
import Button from '../../components/Button';
import { useTheme } from '../../context/ThemeContext';
import { forgotPasswordRequest } from '../../api';
import { isValidUzPhone, phoneToApi } from '../../utils/helpers';

export default function ForgotPhoneScreen({ navigation }) {
  const { theme } = useTheme();
  const [phone, setPhone] = useState('998');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    setError('');
    const apiPhone = phoneToApi(phone);
    if (!isValidUzPhone(apiPhone)) {
      setError('Enter a valid phone number');
      return;
    }
    setLoading(true);
    try {
      await forgotPasswordRequest(apiPhone);
      navigation.navigate('ForgotOTP', { phone: apiPhone });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader title="Reset password" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.body}>
        <Text style={[styles.desc, { color: theme.colors.textSecondary }]}>
          Enter your phone number to receive a reset code
        </Text>
        <PhoneInput value={phone} onChange={setPhone} error={error} />
        <Button title="Send code" onPress={handleNext} loading={loading} style={styles.btn} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  body: { flex: 1, padding: 28 },
  desc: { marginBottom: 24, fontSize: 15, lineHeight: 22 },
  btn: { marginTop: 24 },
});
