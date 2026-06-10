import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { OTP_EXPIRY_SECONDS } from '../api/config';

export default function OTPTimer({ onResend, resendLoading }) {
  const { theme } = useTheme();
  const [seconds, setSeconds] = useState(OTP_EXPIRY_SECONDS);

  useEffect(() => {
    setSeconds(OTP_EXPIRY_SECONDS);
  }, [resendLoading]);

  useEffect(() => {
    if (seconds <= 0) return undefined;
    const id = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [seconds]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const canResend = seconds <= 0;

  return (
    <TouchableOpacity
      onPress={canResend ? onResend : undefined}
      disabled={!canResend || resendLoading}
      style={styles.wrap}
    >
      <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
        {canResend
          ? resendLoading
            ? 'Sending...'
            : 'Did not receive code? Resend'
          : `Resend code in ${mins}:${String(secs).padStart(2, '0')}`}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginTop: 20 },
  text: { fontSize: 14 },
});
