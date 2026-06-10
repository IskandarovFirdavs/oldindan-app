import React from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { formatPhoneDisplay } from '../utils/helpers';

export default function PhoneInput({ value, onChange, error }) {
  const { theme } = useTheme();

  const handleChange = (text) => {
    const digits = text.replace(/\D/g, '');
    const normalized = digits.startsWith('998') ? digits.slice(0, 12) : `998${digits}`.slice(0, 12);
    onChange(normalized.replace(/^998/, '').length ? normalized : digits.slice(0, 12));
  };

  const display = formatPhoneDisplay(value.startsWith('998') ? value : `998${value}`);

  return (
    <View>
      <View style={[styles.row, { backgroundColor: theme.colors.inputBg, borderColor: error ? theme.colors.error : theme.colors.border }]}>
        <Text style={[styles.prefix, { color: theme.colors.text }]}>+998</Text>
        <TextInput
          style={[styles.input, { color: theme.colors.text }]}
          value={display.replace('+998 ', '')}
          onChangeText={handleChange}
          placeholder="90 123 45 67"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="phone-pad"
          maxLength={14}
        />
      </View>
      {error ? <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 56,
  },
  prefix: { fontSize: 17, fontWeight: '600', marginRight: 8 },
  input: { flex: 1, fontSize: 17, letterSpacing: 0.5 },
  error: { marginTop: 6, fontSize: 13 },
});
