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
import Input from "../../components/Input";
import Button from "../../components/Button";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

export default function LoginScreen({ navigation }) {
  const { theme } = useTheme();
  const { login } = useAuth();
  const [phone, setPhone] = useState(""); // Faqat 9 ta raqam saqlanadi (90 123 45 67)
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setError("");

    // Telefon raqamidan faqat raqamlarni olamiz
    const digits = phone.replace(/\D/g, "");

    // Agar 9 ta raqam bo'lsa, +998 qo'shamiz
    if (digits.length !== 9) {
      setError("Enter a valid phone number (e.g., 90 123 45 67)");
      return;
    }

    // +998 ni qo'shamiz
    const finalPhone = "+998" + digits;

    if (!password) {
      setError("Enter your password");
      return;
    }

    setLoading(true);
    try {
      await login(finalPhone, password);
    } catch (e) {
      setError(e.message || "Invalid phone or password");
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
            Welcome back
          </Text>

          <PhoneInput label="Phone number" value={phone} onChange={setPhone} />

          <View style={styles.spacer} />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Your password"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            rightIcon={showPassword ? "eye-off" : "eye"}
            onRightIconPress={() => setShowPassword(!showPassword)}
          />

          {error ? (
            <Text style={[styles.error, { color: theme.colors.error }]}>
              {error}
            </Text>
          ) : null}

          <TouchableOpacity
            onPress={() => navigation.navigate("ForgotPhone")}
            style={styles.forgot}
          >
            <Text style={[styles.forgotText, { color: theme.colors.primary }]}>
              Forgot password?
            </Text>
          </TouchableOpacity>

          <Button
            title="Log in"
            onPress={handleLogin}
            loading={loading}
            style={styles.btn}
          />

          <TouchableOpacity
            onPress={() => navigation.navigate("RegisterPhone")}
          >
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
  scroll: { flexGrow: 1, padding: 28, justifyContent: "center" },
  subtitle: {
    textAlign: "center",
    marginTop: 8,
    marginBottom: 32,
    fontSize: 15,
  },
  spacer: { height: 16 },
  error: { marginTop: 8, fontSize: 13, textAlign: "center" },
  forgot: { alignSelf: "flex-end", marginTop: 4, marginBottom: 8 },
  forgotText: { fontSize: 14, fontWeight: "600" },
  btn: { marginTop: 12 },
  link: { textAlign: "center", marginTop: 24, fontSize: 14, fontWeight: "600" },
});
