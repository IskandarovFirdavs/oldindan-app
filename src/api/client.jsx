import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './config';

const TOKEN_KEY = '@oldindan_access';
const REFRESH_KEY = '@oldindan_refresh';

export async function getAccessToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function getRefreshToken() {
  return AsyncStorage.getItem(REFRESH_KEY);
}

export async function setTokens(access, refresh) {
  await AsyncStorage.multiSet([
    [TOKEN_KEY, access],
    [REFRESH_KEY, refresh],
  ]);
}

export async function clearTokens() {
  await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_KEY]);
}

function buildUrl(path, params) {
  const url = `${BASE_URL}${path}`;
  if (!params || Object.keys(params).length === 0) return url;
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  return qs ? `${url}?${qs}` : url;
}

export function parseApiError(data, status) {
  if (!data) return `Request failed (${status})`;
  if (typeof data === 'string') return data;
  if (data.detail) {
    return typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
  }
  const firstKey = Object.keys(data)[0];
  if (firstKey) {
    const val = data[firstKey];
    if (Array.isArray(val)) return val[0];
    if (typeof val === 'string') return val;
  }
  return 'Something went wrong';
}

export async function apiRequest(path, options = {}) {
  const { method = 'GET', body, params, auth = true, headers = {}, isFormData = false } = options;

  const reqHeaders = { ...headers };
  if (!isFormData) {
    reqHeaders['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = await getAccessToken();
    if (token) reqHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path, params), {
    method,
    headers: reqHeaders,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const error = new Error(parseApiError(data, response.status));
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export function unwrapList(data) {
  if (Array.isArray(data)) return data;
  if (data?.results) return data.results;
  return data ? [data] : [];
}
