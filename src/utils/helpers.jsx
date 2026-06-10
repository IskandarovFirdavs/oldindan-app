/** Format phone for display: +998 XX XXX XX XX */
export function formatPhoneDisplay(digits) {
  const d = digits.replace(/\D/g, '');
  if (d.length <= 3) return `+${d}`;
  if (d.length <= 5) return `+${d.slice(0, 3)} ${d.slice(3)}`;
  if (d.length <= 8) return `+${d.slice(0, 3)} ${d.slice(3, 5)} ${d.slice(5)}`;
  if (d.length <= 10) return `+${d.slice(0, 3)} ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8)}`;
  return `+${d.slice(0, 3)} ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8, 10)} ${d.slice(10, 12)}`;
}

/** Convert display input to API format: 998901234567 */
export function phoneToApi(displayDigits) {
  const d = displayDigits.replace(/\D/g, '');
  if (d.startsWith('998')) return d.slice(0, 12);
  if (d.startsWith('8') && d.length <= 10) return `998${d.slice(1)}`;
  if (d.length === 9) return `998${d}`;
  return d.slice(0, 12);
}

export function isValidUzPhone(apiPhone) {
  return /^998\d{9}$/.test(apiPhone);
}

export function formatBookingNumber(num) {
  if (!num) return '';
  return num.startsWith('#') ? num : `#${num}`;
}

export function formatDateTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export function formatDateForApi(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function buildIsoDateTime(dateStr, timeStr) {
  return `${dateStr}T${timeStr}:00+05:00`;
}

export function getTodayStr() {
  return formatDateForApi(new Date());
}

export function getInviteCode(userId) {
  const base = String(userId || 0).padStart(4, '0');
  return `OLDI-${base}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export function workingHoursLabel(hours) {
  if (!hours || typeof hours !== 'object') return 'Hours not set';
  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const labels = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };
  const parts = days
    .filter((d) => hours[d]?.length === 2)
    .map((d) => `${labels[d]} ${hours[d][0]}-${hours[d][1]}`);
  return parts.length ? parts.join(' · ') : 'Hours not set';
}
