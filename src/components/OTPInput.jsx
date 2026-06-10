import React, { useRef, useEffect } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function OTPInput({ value, onChange, length = 6 }) {
  const { theme } = useTheme();
  const refs = useRef([]);

  useEffect(() => {
    refs.current = refs.current.slice(0, length);
  }, [length]);

  const digits = value.padEnd(length, ' ').split('').slice(0, length);

  const focusIndex = (i) => {
    refs.current[i]?.focus();
  };

  const handleChange = (text, index) => {
    const digit = text.replace(/\D/g, '').slice(-1);
    const arr = digits.map((d) => (d === ' ' ? '' : d));
    arr[index] = digit;
    const next = arr.join('').trim();
    onChange(next.replace(/\s/g, ''));

    if (digit && index < length - 1) {
      focusIndex(index + 1);
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index]?.trim() && index > 0) {
      focusIndex(index - 1);
    }
  };

  return (
    <View style={styles.row}>
      {Array.from({ length }).map((_, i) => (
        <TextInput
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          style={[
            styles.box,
            {
              backgroundColor: theme.colors.inputBg,
              borderColor: digits[i]?.trim() ? theme.colors.primary : theme.colors.border,
              color: theme.colors.text,
            },
          ]}
          value={digits[i]?.trim() || ''}
          onChangeText={(t) => handleChange(t, i)}
          onKeyPress={(e) => handleKeyPress(e, i)}
          keyboardType="number-pad"
          maxLength={1}
          selectTextOnFocus
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  box: {
    width: 46,
    height: 54,
    borderRadius: 12,
    borderWidth: 1.5,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
  },
});
