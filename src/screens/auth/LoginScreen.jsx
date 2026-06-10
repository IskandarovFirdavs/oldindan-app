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
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { isValidUzPhone, phoneToApi } from '../../utils/helpers';

export default function LoginScreen({ navigation }) {
  const { theme } = useTheme();
  const { login } = useAuth();
  const [phone, setPhone] = useState('998');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    const apiPhone = phoneToApi(phone);
    if (!isValidUzPhone(apiPhone)) {
      setError('Enter a valid phone number');
      return;
    }
    if (!password) {
      setError('Enter your password');
      return;
    }
    setLoading(true);
    try {
      await login(apiPhone, password);
    } catch (e) {
      setError(e.message || 'Invalid phone or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Logo size={72} />
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Welcome back</Text>

          <PhoneInput value={phone} onChange={setPhone} />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Your password"
            secureTextEntry
          />
          {error ? <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text> : null}

          <TouchableOpacity onPress={() => navigation.navigate('ForgotPhone')} style={styles.forgot}>
            <Text style={[styles.forgotText, { color: theme.colors.primary }]}>Forgot password?</Text>
          </TouchableOpacity>

          <Button title="Log in" onPress={handleLogin} loading={loading} style={styles.btn} />

          <TouchableOpacity onPress={() => navigation.navigate('RegisterPhone')}>
            <Text style={[styles.link, { color: theme.colors.primary }]}>
              Don't have an account? Register
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
  scroll: { flexGrow: 1, padding: 28, justifyContent: 'center' },
  subtitle: { textAlign: 'center', marginTop: 8, marginBottom: 32, fontSize: 15 },
  error: { marginTop: 8, fontSize: 13, textAlign: 'center' },
  forgot: { alignSelf: 'flex-end', marginTop: 4, marginBottom: 8 },
  forgotText: { fontSize: 14, fontWeight: '600' },
  btn: { marginTop: 12 },
  link: { textAlign: 'center', marginTop: 24, fontSize: 14, fontWeight: '600' },
});
