import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../../components/ScreenHeader";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { forgotPasswordConfirm } from "../../api";

export default function ForgotNewPasswordScreen({ navigation, route }) {
  const { phone, code } = route.params;
  const { theme } = useTheme();
  const { login } = useAuth();
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordRepeat, setShowPasswordRepeat] = useState(false);

  // Password match holatini tekshirish
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [doPasswordsMatch, setDoPasswordsMatch] = useState(false);

  // Password o'zgarganda tekshirish
  useEffect(() => {
    // Password validatsiyasi (min 8 belgi)
    setIsPasswordValid(password.length >= 8);

    // Passwordlar match qiladimi?
    if (password.length >= 8 && passwordRepeat.length >= 8) {
      setDoPasswordsMatch(password === passwordRepeat);
    } else {
      setDoPasswordsMatch(false);
    }
  }, [password, passwordRepeat]);

  const handleSubmit = async () => {
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== passwordRepeat) {
      setError("Passwords do not match");
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
      Alert.alert(
        "Success",
        "Password reset successfully. You are now logged in.",
      );
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
      <ScreenHeader title="New password" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Input
            label="New password"
            value={password}
            onChangeText={setPassword}
            placeholder="Min. 8 characters"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            rightIcon={showPassword ? "eye-off" : "eye"}
            onRightIconPress={() => setShowPassword(!showPassword)}
            error={
              password.length > 0 && password.length < 8
                ? "Password must be at least 8 characters"
                : ""
            }
            success={isPasswordValid}
          />
          <Input
            label="Repeat new password"
            value={passwordRepeat}
            onChangeText={setPasswordRepeat}
            placeholder="Repeat password"
            secureTextEntry={!showPasswordRepeat}
            autoCapitalize="none"
            autoCorrect={false}
            rightIcon={showPasswordRepeat ? "eye-off" : "eye"}
            onRightIconPress={() => setShowPasswordRepeat(!showPasswordRepeat)}
            error={
              passwordRepeat.length > 0 &&
              !doPasswordsMatch &&
              password.length >= 8
                ? "Passwords do not match"
                : ""
            }
            success={doPasswordsMatch}
          />
          {error ? (
            <Text style={[styles.error, { color: theme.colors.error }]}>
              {error}
            </Text>
          ) : null}

          {/* Match holatini ko'rsatish */}
          {password.length >= 8 && passwordRepeat.length >= 8 && (
            <Text
              style={[
                styles.matchStatus,
                {
                  color: doPasswordsMatch
                    ? theme.colors.success || "#4CAF50"
                    : theme.colors.error,
                },
              ]}
            ></Text>
          )}

          <Button
            title="Reset & log in"
            onPress={handleSubmit}
            loading={loading}
            style={styles.btn}
            disabled={!isPasswordValid || !doPasswordsMatch}
          />
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
  matchStatus: {
    textAlign: "center",
    marginTop: 4,
    marginBottom: 12,
    fontSize: 14,
    fontWeight: "600",
  },
  btn: { marginTop: 8 },
});
