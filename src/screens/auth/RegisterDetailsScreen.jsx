import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../../components/ScreenHeader";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

export default function RegisterDetailsScreen({ navigation, route }) {
  const { phone, code } = route.params;
  const { theme } = useTheme();
  const { register } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordRepeat, setShowPasswordRepeat] = useState(false);

  // Password match tekshirish
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [doPasswordsMatch, setDoPasswordsMatch] = useState(false);

  useEffect(() => {
    setIsPasswordValid(password.length >= 8);
    if (password.length >= 8 && passwordRepeat.length >= 8) {
      setDoPasswordsMatch(password === passwordRepeat);
    } else {
      setDoPasswordsMatch(false);
    }
  }, [password, passwordRepeat]);

  const handleRegister = async () => {
    setError("");
    if (!firstName.trim() || !lastName.trim()) {
      setError("First and last name are required");
      return;
    }
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
      await register({
        phone,
        code,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        password,
        password_repeat: passwordRepeat,
      });
    } catch (e) {
      setError(e.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
    >
      <ScreenHeader title="Your details" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Input
            label="First name"
            value={firstName}
            onChangeText={setFirstName}
            placeholder="John"
            autoCapitalize="words"
          />
          <Input
            label="Last name"
            value={lastName}
            onChangeText={setLastName}
            placeholder="Doe"
            autoCapitalize="words"
          />

          <Input
            label="Password"
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
            label="Repeat password"
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

          <Button
            title="Create account"
            onPress={handleRegister}
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
  error: { marginBottom: 12, fontSize: 13, textAlign: "center" },
  btn: { marginTop: 8 },
});
