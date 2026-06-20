import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  clearTokens,
  getAccessToken,
  getProfile,
  loginConsumer,
  registerConsumer,
} from "../api";

const AuthContext = createContext(null);
const USER_KEY = "@oldindan_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const persistUser = async (u) => {
    setUser(u);
    if (u) await AsyncStorage.setItem(USER_KEY, JSON.stringify(u));
    else await AsyncStorage.removeItem(USER_KEY);
  };

  const bootstrap = useCallback(async () => {
    try {
      const token = await getAccessToken();
      if (!token) {
        const cached = await AsyncStorage.getItem(USER_KEY);
        if (cached) await AsyncStorage.removeItem(USER_KEY);
        setUser(null);
        return;
      }
      const profile = await getProfile();
      await persistUser(profile);
    } catch {
      await clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = async (phone_number, password) => {
    const data = await loginConsumer(phone_number, password);
    await persistUser(data.user);
    return data;
  };

  const register = async (payload) => {
    const data = await registerConsumer(payload);
    await persistUser(data.user);
    return data;
  };

  const refreshProfile = async () => {
    const profile = await getProfile();
    await persistUser(profile);
    return profile;
  };

  const logout = async () => {
    await clearTokens();
    await AsyncStorage.removeItem(USER_KEY);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      refreshProfile,
      setUser: persistUser,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
