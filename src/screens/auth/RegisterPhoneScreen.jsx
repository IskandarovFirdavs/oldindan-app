import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Logo from "../../components/Logo";
import PhoneInput from "../../components/PhoneInput";
import Button from "../../components/Button";
import { useTheme } from "../../context/ThemeContext";
import { requestRegisterOTP } from "../../api";

export default function RegisterPhoneScreen({ navigation }) {
  const { theme } = useTheme();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    setError("");
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 9) {
      setError("Enter a valid phone number (e.g., 90 123 45 67)");
      return;
    }
    const apiPhone = "+998" + digits;
    setLoading(true);
    try {
      await requestRegisterOTP(apiPhone);
      navigation.navigate("RegisterOTP", { phone: apiPhone });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Logo size={72} />
          <Text
            style={[styles.subtitle, { color: theme.colors.textSecondary }]}
          >
            Create your account
          </Text>

          <View style={styles.form}>
            <PhoneInput
              label="Phone number"
              value={phone}
              onChange={setPhone}
            />
            {error ? (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {error}
              </Text>
            ) : null}
            <Button
              title="Next"
              onPress={handleNext}
              loading={loading}
              style={styles.btn}
            />
          </View>

          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
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
  scroll: {
    flexGrow: 1,
    padding: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  subtitle: { marginTop: 8, marginBottom: 36, fontSize: 15 },
  form: { width: "100%", marginBottom: 24 },
  errorText: { marginTop: 8, fontSize: 13, textAlign: "center" },
  btn: { marginTop: 20, width: "100%" },
  link: { fontSize: 14, fontWeight: "600" },
});
