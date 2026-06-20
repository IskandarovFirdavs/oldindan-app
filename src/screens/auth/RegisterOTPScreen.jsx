import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../../components/ScreenHeader";
import OTPInput from "../../components/OTPInput";
import OTPTimer from "../../components/OTPTimer";
import Button from "../../components/Button";
import { useTheme } from "../../context/ThemeContext";
import { requestRegisterOTP, verifyRegisterOTP } from "../../api";

export default function RegisterOTPScreen({ navigation, route }) {
  const { phone } = route.params;
  const { theme } = useTheme();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  const handleNext = async () => {
    setError("");
    if (code.length !== 6) {
      setError("Enter the 6-digit code");
      return;
    }

    setVerifying(true);
    try {
      await verifyRegisterOTP(phone, code);
      // OTP vaqtini qo'shib o'tkazish
      const otpExpiresAt = Date.now() + 300000; // 5 daqiqa
      navigation.navigate("RegisterDetails", {
        phone,
        code,
        otpExpiresAt,
      });
    } catch (e) {
      const msg = e.message || "Invalid code. Please try again.";
      setError(msg);
      setCode("");

      if (
        msg.includes("tugadi") ||
        msg.includes("blocked") ||
        msg.includes("attempts") ||
        msg.includes("ko'p") ||
        msg.includes("urinish") ||
        msg.includes("qoldi")
      ) {
        setIsBlocked(true);
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
    try {
      await requestRegisterOTP(phone);
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
      <ScreenHeader title="Verify phone" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.body}
      >
        <Text style={[styles.desc, { color: theme.colors.textSecondary }]}>
          Enter the 6-digit code sent to your phone
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
  desc: { textAlign: "center", marginBottom: 32, fontSize: 15, lineHeight: 22 },
  error: { textAlign: "center", marginTop: 12, fontSize: 13 },
  btn: { marginTop: 32 },
});
