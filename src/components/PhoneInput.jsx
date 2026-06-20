// PhoneInput.js
import React from "react";
import { View, TextInput, StyleSheet, Text } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function PhoneInput({ value, onChange, error, label }) {
  const { theme } = useTheme();

  const handleChange = (text) => {
    // Faqat raqamlarni olamiz
    const digits = text.replace(/\D/g, "");
    // Maksimal 9 ta raqam (998 dan keyingi qism)
    const clean = digits.slice(0, 9);
    onChange(clean);
  };

  const getDisplayValue = () => {
    if (!value) return "";
    const digits = value.replace(/\D/g, "");
    // Faqat 9 ta raqamni ko'rsatamiz
    return digits.slice(0, 9);
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.row,
          {
            backgroundColor: theme.colors.inputBg,
            borderColor: error ? theme.colors.error : theme.colors.border,
          },
        ]}
      >
        <Text style={[styles.prefix, { color: theme.colors.text }]}>+998</Text>
        <TextInput
          style={[styles.input, { color: theme.colors.text }]}
          value={getDisplayValue()}
          onChangeText={handleChange}
          placeholder="90 123 45 67"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="phone-pad"
          maxLength={9}
        />
      </View>
      {error ? (
        <Text style={[styles.error, { color: theme.colors.error }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 56,
  },
  prefix: { fontSize: 17, fontWeight: "600", marginRight: 8 },
  input: { flex: 1, fontSize: 17, letterSpacing: 0.5 },
  error: { marginTop: 6, fontSize: 13 },
});
