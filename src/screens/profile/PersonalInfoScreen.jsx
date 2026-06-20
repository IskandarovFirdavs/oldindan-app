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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import ScreenHeader from "../../components/ScreenHeader";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { updateProfile, BASE_URL } from "../../api";
import { getAccessToken } from "../../api/client";
import { File } from "expo-file-system";

export default function PersonalInfoScreen({ navigation }) {
  const { theme } = useTheme();
  const { user, refreshProfile } = useAuth();
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [email, setEmail] = useState(user?.email || "");
  const [avatarUri, setAvatarUri] = useState(
    user?.avatar
      ? user.avatar.startsWith("http")
        ? user.avatar
        : `${BASE_URL}${user.avatar}`
      : null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  // HAMMASI SHU YERGA - handleSave funksiyasi
  const handleSave = async () => {
    setError("");
    setLoading(true);
    try {
      const uriChanged = avatarUri && !avatarUri.startsWith("http");
      if (uriChanged) {
        // Yangi API - File class
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

        await refreshProfile();
        Alert.alert("Saved", "Your profile has been updated.");
        navigation.goBack();
      } else {
        await updateProfile({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          bio: bio.trim(),
          email: email.trim() || undefined,
        });
        await refreshProfile();
        Alert.alert("Saved", "Your profile has been updated.");
        navigation.goBack();
      }
    } catch (e) {
      setError(e.message);
      console.log("XATO:", e);
    } finally {
      setLoading(false);
    }
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
          <Input
            label="Email (optional)"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: { padding: 24 },
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
  error: { marginBottom: 12, fontSize: 13 },
});
