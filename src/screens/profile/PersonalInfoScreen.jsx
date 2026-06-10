import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import ScreenHeader from '../../components/ScreenHeader';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { updateProfile, updateProfileWithAvatar, BASE_URL } from '../../api';

export default function PersonalInfoScreen({ navigation }) {
  const { theme } = useTheme();
  const { user, refreshProfile } = useAuth();
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarUri, setAvatarUri] = useState(
    user?.avatar
      ? user.avatar.startsWith('http')
        ? user.avatar
        : `${BASE_URL}${user.avatar}`
      : null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    setError('');
    setLoading(true);
    try {
      const uriChanged = avatarUri && !avatarUri.startsWith('http');
      if (uriChanged) {
        const form = new FormData();
        form.append('first_name', firstName.trim());
        form.append('last_name', lastName.trim());
        form.append('bio', bio.trim());
        if (email.trim()) form.append('email', email.trim());
        form.append('avatar', {
          uri: avatarUri,
          name: 'avatar.jpg',
          type: 'image/jpeg',
        });
        await updateProfileWithAvatar(form);
      } else {
        await updateProfile({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          bio: bio.trim(),
          email: email.trim() || undefined,
        });
      }
      await refreshProfile();
      Alert.alert('Saved', 'Your profile has been updated.');
      navigation.goBack();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader title="Personal info" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={pickAvatar} style={styles.avatarWrap}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.avatarLetter}>{(firstName[0] || 'U').toUpperCase()}</Text>
              </View>
            )}
            <Text style={[styles.changePhoto, { color: theme.colors.primary }]}>Change photo</Text>
          </TouchableOpacity>

          <Input label="First name" value={firstName} onChangeText={setFirstName} />
          <Input label="Last name" value={lastName} onChangeText={setLastName} />
          <Input label="Email (optional)" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <Input label="Bio" value={bio} onChangeText={setBio} placeholder="Tell us about yourself..." multiline />
          {error ? <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text> : null}
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
  avatarWrap: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { fontSize: 40, fontWeight: '800', color: '#FFF' },
  changePhoto: { marginTop: 10, fontSize: 14, fontWeight: '600' },
  error: { marginBottom: 12, fontSize: 13 },
});
