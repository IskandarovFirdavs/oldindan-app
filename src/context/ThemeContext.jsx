import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkTheme, lightTheme } from '../theme/colors';

const ThemeContext = createContext(null);
const THEME_KEY = '@oldindan_theme';

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((val) => {
      if (val === 'dark') setIsDark(true);
      setReady(true);
    });
  }, []);

  const toggleTheme = useCallback(async () => {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
      return next;
    });
  }, []);

  const setDarkMode = useCallback(async (dark) => {
    setIsDark(dark);
    await AsyncStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
  }, []);

  const theme = isDark ? darkTheme : lightTheme;

  const value = useMemo(
    () => ({ theme, isDark, toggleTheme, setDarkMode, ready }),
    [theme, isDark, toggleTheme, setDarkMode, ready],
  );

  if (!ready) return null;

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
