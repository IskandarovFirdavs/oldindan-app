import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Logo from '../../components/Logo';
import PhoneInput from '../../components/PhoneInput';
import Button from '../../components/Button';
import { useTheme } from '../../context/ThemeContext';
import { requestRegisterOTP } from '../../api';
import { isValidUzPhone, phoneToApi } from '../../utils/helpers';

export default function RegisterPhoneScreen({ navigation }) {
  const { theme } = useTheme();
  const [phone, setPhone] = useState('998');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const apiPhone = phoneToApi(phone);

  const handleNext = async () => {
    setError('');
    if (!isValidUzPhone(apiPhone)) {
      setError('Enter a valid Uzbekistan phone number');
      return;
    }
    setLoading(true);
    try {
      await requestRegisterOTP(apiPhone);
      navigation.navigate('RegisterOTP', { phone: apiPhone });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Logo size={72} />
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Create your account
          </Text>

          <View style={styles.form}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Phone number</Text>
            <PhoneInput value={phone} onChange={setPhone} error={error} />
            <Button title="Next" onPress={handleNext} loading={loading} style={styles.btn} />
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.link, { color: theme.colors.primary }]}>
              Already have an account? Log in
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, padding: 28, alignItems: 'center', justifyContent: 'center' },
  subtitle: { marginTop: 8, marginBottom: 36, fontSize: 15 },
  form: { width: '100%', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  btn: { marginTop: 20, width: '100%' },
  link: { fontSize: 14, fontWeight: '600' },
});
