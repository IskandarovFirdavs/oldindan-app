import { API_PATHS } from './config';
import { apiRequest, unwrapList } from './client';

const base = API_PATHS.bookings;

export async function getMyBookings(params = {}) {
  const data = await apiRequest(`${base}/my/`, { params });
  return unwrapList(data);
}

export async function getMyBookingDetail(id) {
  return apiRequest(`${base}/my/${id}/`);
}

export async function createBooking(payload) {
  return apiRequest(`${base}/create/`, {
    method: 'POST',
    body: payload,
  });
}

export async function cancelBooking(id, note = '') {
  return apiRequest(`${base}/my/${id}/cancel/`, {
    method: 'POST',
    body: { note },
  });
}

export async function getTableSlots(tableId, date) {
  return apiRequest(`${base}/slots/`, {
    params: { table_id: tableId, date },
    auth: false,
  });
}

export async function getAvailableSlots(branchId, tableId, date, duration = 60) {
  return apiRequest(`${base}/available-slots/`, {
    params: { branch_id: branchId, table_id: tableId, date, duration },
    auth: false,
  });
}

export async function getBookingMessages(bookingId) {
  const data = await apiRequest(`${base}/${bookingId}/messages/`);
  return unwrapList(data);
}

export async function sendBookingMessage(bookingId, text) {
  return apiRequest(`${base}/${bookingId}/messages/send/`, {
    method: 'POST',
    body: { text },
  });
}
