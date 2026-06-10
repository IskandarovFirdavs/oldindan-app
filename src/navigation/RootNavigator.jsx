import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import BranchDetailScreen from '../screens/branch/BranchDetailScreen';
import BookingCreateScreen from '../screens/booking/BookingCreateScreen';
import BookingSuccessScreen from '../screens/booking/BookingSuccessScreen';
import BookingChatScreen from '../screens/booking/BookingChatScreen';
import BookingHistoryScreen from '../screens/booking/BookingHistoryScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import PersonalInfoScreen from '../screens/profile/PersonalInfoScreen';
import PaymentMethodsScreen from '../screens/profile/PaymentMethodsScreen';
import InviteFriendScreen from '../screens/profile/InviteFriendScreen';
import SupportScreen from '../screens/profile/SupportScreen';
import ExtraScreen from '../screens/profile/ExtraScreen';

const Stack = createNativeStackNavigator();

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="BranchDetail" component={BranchDetailScreen} />
      <Stack.Screen name="BookingCreate" component={BookingCreateScreen} />
      <Stack.Screen name="BookingSuccess" component={BookingSuccessScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="BookingChat" component={BookingChatScreen} />
      <Stack.Screen name="BookingHistory" component={BookingHistoryScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
      <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
      <Stack.Screen name="InviteFriend" component={InviteFriendScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen name="Extra" component={ExtraScreen} />
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  const { isAuthenticated, loading } = useAuth();
  const { theme, isDark } = useTheme();

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.border,
    },
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      {isAuthenticated ? <MainStack /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
