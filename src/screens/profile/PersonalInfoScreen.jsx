import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { File } from "expo-file-system";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "../../components/ScreenHeader";
import Input from "../../components/Input";
import Button from "../../components/Button";
import OTPInput from "../../components/OTPInput";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import {
  updateProfile,
  BASE_URL,
  requestRegisterOTP,
  verifyRegisterOTP,
  requestEmailOTP,
  verifyEmailOTP,
} from "../../api";
import { getAccessToken } from "../../api/client";

export default function PersonalInfoScreen({ navigation }) {
  const { theme } = useTheme();
  const { user, refreshProfile } = useAuth();

  // Profile fields
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [avatarUri, setAvatarUri] = useState(
    user?.avatar
      ? user.avatar.startsWith("http")
        ? user.avatar
        : `${BASE_URL}${user.avatar}`
      : null,
  );

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Modal state for phone/email edit
  const [modalVisible, setModalVisible] = useState(false);
  const [editType, setEditType] = useState(null);
  const [newValue, setNewValue] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");

  // Avatar picker
  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow access to your photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  // Save profile (name, bio, avatar)
  const handleSave = async () => {
    setError("");
    setLoading(true);
    try {
      const uriChanged = avatarUri && !avatarUri.startsWith("http");
      if (uriChanged) {
        const file = new File(avatarUri);
        const base64 = await file.base64();
        const filename = avatarUri.split("/").pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";

        const token = await getAccessToken();
        const response = await fetch(`${BASE_URL}/api/accounts/me/`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            bio: bio.trim(),
            email: email.trim() || undefined,
            avatar_base64: `data:${type};base64,${base64}`,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Update failed");
        }
      } else {
        await updateProfile({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          bio: bio.trim(),
          email: email.trim() || undefined,
        });
      }
      await refreshProfile();
      Alert.alert("Saved", "Your profile has been updated.");
      navigation.goBack();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Open edit modal for phone or email
  const openEditModal = (type) => {
    setEditType(type);
    setNewValue(type === "phone" ? phone : email);
    setOtpStep(false);
    setOtpCode("");
    setOtpError("");
    setModalVisible(true);
  };

  // handleSendOTP funksiyasi
  const handleSendOTP = async () => {
    if (!newValue.trim()) {
      setOtpError(`${editType === "phone" ? "Phone" : "Email"} is required`);
      return;
    }

    setOtpLoading(true);
    setOtpError("");
    try {
      if (editType === "phone") {
        await requestRegisterOTP(newValue);
      } else {
        await requestEmailOTP(newValue);
      }
      setOtpStep(true);
      Alert.alert("OTP Sent", `Verification code sent to ${newValue}`);
    } catch (e) {
      setOtpError(e.message || "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  // handleVerifyOTP funksiyasi
  const handleVerifyOTP = async () => {
    if (otpCode.length !== 6) {
      setOtpError("Enter 6-digit code");
      return;
    }

    setOtpLoading(true);
    setOtpError("");
    try {
      if (editType === "phone") {
        await verifyRegisterOTP(newValue, otpCode);
      } else {
        await verifyEmailOTP(newValue, otpCode);
      }

      const updateData = {};
      if (editType === "phone") {
        updateData.phone = newValue;
        setPhone(newValue);
      } else {
        updateData.email = newValue;
        setEmail(newValue);
      }

      await updateProfile(updateData);
      await refreshProfile();

      Alert.alert(
        "Success",
        `${editType === "phone" ? "Phone" : "Email"} updated successfully`,
      );
      setModalVisible(false);
    } catch (e) {
      setOtpError(e.message || "Invalid OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  // Close modal and reset
  const closeModal = () => {
    setModalVisible(false);
    setEditType(null);
    setNewValue("");
    setOtpStep(false);
    setOtpCode("");
    setOtpError("");
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
    >
      <ScreenHeader title="Personal info" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar */}
          <TouchableOpacity onPress={pickAvatar} style={styles.avatarWrap}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View
                style={[
                  styles.avatarPlaceholder,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Text style={styles.avatarLetter}>
                  {(firstName[0] || "U").toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={[styles.changePhoto, { color: theme.colors.primary }]}>
              Change photo
            </Text>
          </TouchableOpacity>

          {/* Name */}
          <Input
            label="First name"
            value={firstName}
            onChangeText={setFirstName}
          />
          <Input
            label="Last name"
            value={lastName}
            onChangeText={setLastName}
          />

          {/* Phone - readonly with edit button */}
          <View style={styles.fieldContainer}>
            <View style={styles.fieldLabel}>
              <Text
                style={[
                  styles.fieldLabelText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Phone
              </Text>
              <TouchableOpacity onPress={() => openEditModal("phone")}>
                <Text
                  style={[styles.editLink, { color: theme.colors.primary }]}
                >
                  Change
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={[
                styles.fieldValue,
                {
                  backgroundColor: theme.colors.inputBg,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text
                style={[styles.fieldValueText, { color: theme.colors.text }]}
              >
                {phone ? `${phone}` : "Not set"}
              </Text>
            </View>
          </View>

          {/* Email - readonly with edit button */}
          <View style={styles.fieldContainer}>
            <View style={styles.fieldLabel}>
              <Text
                style={[
                  styles.fieldLabelText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Email
              </Text>
              <TouchableOpacity onPress={() => openEditModal("email")}>
                <Text
                  style={[styles.editLink, { color: theme.colors.primary }]}
                >
                  Change
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={[
                styles.fieldValue,
                {
                  backgroundColor: theme.colors.inputBg,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text
                style={[styles.fieldValueText, { color: theme.colors.text }]}
              >
                {email || "Not set"}
              </Text>
            </View>
          </View>

          {/* Bio */}
          <Input
            label="Bio"
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself..."
            multiline
          />

          {error ? (
            <Text style={[styles.error, { color: theme.colors.error }]}>
              {error}
            </Text>
          ) : null}
          <Button title="Save changes" onPress={handleSave} loading={loading} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Edit Modal for Phone/Email */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.card },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Change {editType === "phone" ? "Phone" : "Email"}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {!otpStep ? (
              <>
                <Text
                  style={[
                    styles.modalDesc,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Enter your new{" "}
                  {editType === "phone" ? "phone number" : "email address"}
                </Text>
                <TextInput
                  style={[
                    styles.modalInput,
                    {
                      backgroundColor: theme.colors.inputBg,
                      color: theme.colors.text,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  value={newValue}
                  onChangeText={setNewValue}
                  placeholder={
                    editType === "phone" ? "+998901234567" : "email@example.com"
                  }
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType={
                    editType === "phone" ? "phone-pad" : "email-address"
                  }
                  autoCapitalize="none"
                />
                {otpError ? (
                  <Text
                    style={[styles.otpError, { color: theme.colors.error }]}
                  >
                    {otpError}
                  </Text>
                ) : null}
                <Button
                  title="Send OTP"
                  onPress={handleSendOTP}
                  loading={otpLoading}
                  style={styles.modalBtn}
                />
                <TouchableOpacity onPress={closeModal} style={styles.cancelBtn}>
                  <Text
                    style={[
                      styles.cancelText,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text
                  style={[
                    styles.modalDesc,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Enter 6-digit code sent to {newValue}
                </Text>
                <OTPInput value={otpCode} onChange={setOtpCode} />
                {otpError ? (
                  <Text
                    style={[styles.otpError, { color: theme.colors.error }]}
                  >
                    {otpError}
                  </Text>
                ) : null}
                <Button
                  title="Verify & Update"
                  onPress={handleVerifyOTP}
                  loading={otpLoading}
                  style={styles.modalBtn}
                />
                <TouchableOpacity
                  onPress={() => setOtpStep(false)}
                  style={styles.backBtn}
                >
                  <Text
                    style={[styles.backText, { color: theme.colors.primary }]}
                  >
                    ← Back to change
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: { padding: 24, paddingBottom: 40 },
  avatarWrap: { alignItems: "center", marginBottom: 24 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: { fontSize: 40, fontWeight: "800", color: "#FFF" },
  changePhoto: { marginTop: 10, fontSize: 14, fontWeight: "600" },
  fieldContainer: { marginBottom: 16 },
  fieldLabel: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  fieldLabelText: { fontSize: 14, fontWeight: "500" },
  editLink: { fontSize: 14, fontWeight: "600" },
  fieldValue: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 48,
    justifyContent: "center",
  },
  fieldValueText: { fontSize: 16 },
  error: { marginBottom: 12, fontSize: 13, textAlign: "center" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: "700" },
  modalDesc: { fontSize: 14, marginBottom: 16, textAlign: "center" },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    fontSize: 16,
    marginBottom: 16,
  },
  modalBtn: { marginTop: 8 },
  otpError: { textAlign: "center", marginTop: 8, fontSize: 13 },
  cancelBtn: { alignSelf: "center", marginTop: 12 },
  cancelText: { fontSize: 14 },
  backBtn: { alignSelf: "center", marginTop: 12 },
  backText: { fontSize: 14, fontWeight: "600" },
});
