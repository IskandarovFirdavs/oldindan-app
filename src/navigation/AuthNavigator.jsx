import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterPhoneScreen from '../screens/auth/RegisterPhoneScreen';
import RegisterOTPScreen from '../screens/auth/RegisterOTPScreen';
import RegisterDetailsScreen from '../screens/auth/RegisterDetailsScreen';
import ForgotPhoneScreen from '../screens/auth/ForgotPhoneScreen';
import ForgotOTPScreen from '../screens/auth/ForgotOTPScreen';
import ForgotNewPasswordScreen from '../screens/auth/ForgotNewPasswordScreen';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      initialRouteName="Login"
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="RegisterPhone" component={RegisterPhoneScreen} />
      <Stack.Screen name="RegisterOTP" component={RegisterOTPScreen} />
      <Stack.Screen name="RegisterDetails" component={RegisterDetailsScreen} />
      <Stack.Screen name="ForgotPhone" component={ForgotPhoneScreen} />
      <Stack.Screen name="ForgotOTP" component={ForgotOTPScreen} />
      <Stack.Screen name="ForgotNewPassword" component={ForgotNewPasswordScreen} />
    </Stack.Navigator>
  );
}
