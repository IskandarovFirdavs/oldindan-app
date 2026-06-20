import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { BASE_URL } from "../../api/config";

const MENU = [
  {
    id: "personal",
    icon: "person-outline",
    label: "Personal info",
    screen: "PersonalInfo",
  },
  {
    id: "payment",
    icon: "card-outline",
    label: "Payment methods",
    screen: "PaymentMethods",
  },
  {
    id: "history",
    icon: "time-outline",
    label: "Booking history",
    screen: "BookingHistory",
  },
  {
    id: "invite",
    icon: "gift-outline",
    label: "Invite a friend",
    screen: "InviteFriend",
  },
  {
    id: "support",
    icon: "headset-outline",
    label: "Support",
    screen: "Support",
  },
  {
    id: "extra",
    icon: "ellipsis-horizontal-circle-outline",
    label: "Extra",
    screen: "Extra",
  },
];

export default function ProfileScreen({ navigation }) {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user } = useAuth();

  const avatarUri = user?.avatar
    ? user.avatar.startsWith("http")
      ? user.avatar
      : `${BASE_URL}${user.avatar}`
    : null;

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.profileHeader}>
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
                {(user?.first_name?.[0] || "U").toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={[styles.name, { color: theme.colors.text }]}>
            {user?.full_name ||
              `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
              "Guest"}
          </Text>
        </View>

        <View
          style={[
            styles.themeRow,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.themeLeft}>
            <Ionicons
              name={isDark ? "moon" : "sunny"}
              size={22}
              color={theme.colors.primary}
            />
            <Text style={[styles.themeLabel, { color: theme.colors.text }]}>
              {isDark ? "Dark mode" : "Light mode"}
            </Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.primary,
            }}
            thumbColor="#FFF"
          />
        </View>

        <View
          style={[
            styles.menu,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          {MENU.map((item, i) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                i < MENU.length - 1 && {
                  borderBottomColor: theme.colors.border,
                  borderBottomWidth: StyleSheet.hairlineWidth,
                },
              ]}
              onPress={() => navigation.navigate(item.screen)}
            >
              <Ionicons
                name={item.icon}
                size={22}
                color={theme.colors.primary}
              />
              <Text style={[styles.menuLabel, { color: theme.colors.text }]}>
                {item.label}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 32 },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  avatar: { width: 96, height: 96, borderRadius: 48 },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: { fontSize: 36, fontWeight: "800", color: "#FFF" },
  name: { fontSize: 22, fontWeight: "800", marginTop: 14 },
  bio: { fontSize: 14, marginTop: 6, textAlign: "center", lineHeight: 20 },
  phone: { fontSize: 14, marginTop: 4 },
  themeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  themeLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  themeLabel: { fontSize: 16, fontWeight: "600" },
  menu: {
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },
  menuLabel: { flex: 1, fontSize: 16, fontWeight: "500" },
});
