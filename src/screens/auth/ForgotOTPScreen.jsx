// ForgotOTPScreen.js
import React, { useState } from "react";
import { Text, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../../components/ScreenHeader";
import OTPInput from "../../components/OTPInput";
import OTPTimer from "../../components/OTPTimer";
import Button from "../../components/Button";
import { useTheme } from "../../context/ThemeContext";
import { forgotPasswordRequest, verifyForgotPasswordOTP } from "../../api";

export default function ForgotOTPScreen({ navigation, route }) {
  const { phone } = route.params;
  const { theme } = useTheme();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleNext = async () => {
    setError("");
    if (code.length !== 6) {
      setError("Enter the 6-digit code");
      return;
    }

    setVerifying(true);
    try {
      await verifyForgotPasswordOTP(phone, code); // <-- TO'G'RI API
      const otpExpiresAt = Date.now() + 300000;
      navigation.navigate("ForgotNewPassword", { phone, code, otpExpiresAt });
    } catch (e) {
      const msg = e.message || "Invalid code. Please try again.";
      setError(msg);
      setCode("");

      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 5) {
        setIsBlocked(true);
        // Backend matnini o'chirmang
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError("");
    setCode("");
    setIsBlocked(false);
    setAttempts(0);
    try {
      await forgotPasswordRequest(phone);
    } catch (e) {
      setError(e.message);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
    >
      <ScreenHeader title="Verify code" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.body}
      >
        <Text style={[styles.desc, { color: theme.colors.textSecondary }]}>
          Enter the code sent to your phone
        </Text>
        <OTPInput value={code} onChange={setCode} />
        {error ? (
          <Text style={[styles.error, { color: theme.colors.error }]}>
            {error}
          </Text>
        ) : null}
        <OTPTimer onResend={handleResend} resendLoading={resendLoading} />
        <Button
          title="Continue"
          onPress={handleNext}
          style={styles.btn}
          disabled={code.length !== 6 || verifying || isBlocked}
          loading={verifying}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  body: { flex: 1, padding: 28 },
  desc: { textAlign: "center", marginBottom: 32, fontSize: 15 },
  error: { textAlign: "center", marginTop: 12, fontSize: 13 },
  btn: { marginTop: 32 },
});
