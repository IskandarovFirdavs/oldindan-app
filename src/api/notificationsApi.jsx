import { API_PATHS } from './config';
import { apiRequest, unwrapList } from './client';

const base = API_PATHS.notifications;

export async function getNotifications(params = {}) {
  const data = await apiRequest(`${base}/notifications/`, { params });
  return unwrapList(data);
}

export async function getUnreadCount() {
  return apiRequest(`${base}/notifications/unread-count/`);
}

export async function markNotificationRead(id) {
  return apiRequest(`${base}/notifications/${id}/mark-read/`, { method: 'PATCH' });
}

export async function markAllNotificationsRead() {
  return apiRequest(`${base}/notifications/mark-all-read/`, { method: 'POST' });
}
