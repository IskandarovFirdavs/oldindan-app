import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getNotifications, getUnreadCount, markAllNotificationsRead, markNotificationRead } from '../api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);
const POLL_INTERVAL = 30000;

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const prevUnread = useRef(0);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const [list, countData] = await Promise.all([
        getNotifications(),
        getUnreadCount(),
      ]);
      setNotifications(list);
      const count = countData?.unread_count ?? 0;
      setUnreadCount(count);
      prevUnread.current = count;
    } catch {
      /* silent */
    }
  }, [isAuthenticated]);

  const refreshUnread = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const countData = await getUnreadCount();
      const count = countData?.unread_count ?? 0;
      if (count > prevUnread.current) {
        await refresh();
      } else {
        setUnreadCount(count);
        prevUnread.current = count;
      }
    } catch {
      /* silent */
    }
  }, [isAuthenticated, refresh]);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return undefined;
    }
    setLoading(true);
    refresh().finally(() => setLoading(false));
    const id = setInterval(refreshUnread, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [isAuthenticated, refresh, refreshUnread]);

  const markRead = async (id) => {
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      refresh,
      markRead,
      markAllRead,
    }),
    [notifications, unreadCount, loading, refresh],
  );

  return (
    <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}

/** Booking IDs with unread chat-related notifications */
export function useUnreadBookingChats() {
  const { notifications } = useNotifications();
  return useMemo(() => {
    const set = new Set();
    notifications
      .filter((n) => !n.is_read && n.data?.booking_id)
      .forEach((n) => set.add(n.data.booking_id));
    return set;
  }, [notifications]);
}
