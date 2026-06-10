import React, { useState } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../../components/ScreenHeader';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { forgotPasswordConfirm } from '../../api';

export default function ForgotNewPasswordScreen({ navigation, route }) {
  const { phone, code } = route.params;
  const { theme } = useTheme();
  const { login } = useAuth();
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== passwordRepeat) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await forgotPasswordConfirm({
        phone,
        code,
        new_password: password,
        new_password_repeat: passwordRepeat,
      });
      await login(phone, password);
      Alert.alert('Success', 'Password reset successfully. You are now logged in.');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader title="New password" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Input
            label="New password"
            value={password}
            onChangeText={setPassword}
            placeholder="Min. 8 characters"
            secureTextEntry
          />
          <Input
            label="Repeat new password"
            value={passwordRepeat}
            onChangeText={setPasswordRepeat}
            placeholder="Repeat password"
            secureTextEntry
          />
          {error ? <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text> : null}
          <Button title="Reset & log in" onPress={handleSubmit} loading={loading} style={styles.btn} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: { padding: 24 },
  error: { marginBottom: 12, fontSize: 13 },
  btn: { marginTop: 8 },
});
