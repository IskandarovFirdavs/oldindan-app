import { API_PATHS } from "./config";
import { apiRequest, setTokens } from "./client";

const base = API_PATHS.accounts;

export async function requestRegisterOTP(phone) {
  return apiRequest(`${base}/consumer/request-register-otp/`, {
    method: "POST",
    body: { phone },
    auth: false,
  });
}

export async function registerConsumer(payload) {
  const data = await apiRequest(`${base}/consumer/register/`, {
    method: "POST",
    body: payload,
    auth: false,
  });
  await setTokens(data.access, data.refresh);
  return data;
}

export async function loginConsumer(phone, password) {
  const data = await apiRequest(`${base}/consumer/login/`, {
    method: "POST",
    body: { phone, password },
    auth: false,
  });
  await setTokens(data.access, data.refresh);
  return data;
}

export async function forgotPasswordRequest(phone) {
  return apiRequest(`${base}/consumer/forgot-password/request/`, {
    method: "POST",
    body: { phone },
    auth: false,
  });
}

export async function forgotPasswordConfirm(payload) {
  return apiRequest(`${base}/consumer/forgot-password/confirm/`, {
    method: "POST",
    body: payload,
    auth: false,
  });
}

export async function getProfile() {
  return apiRequest(`${base}/me/`);
}

export async function updateProfile(payload) {
  return apiRequest(`${base}/me/`, {
    method: "PATCH",
    body: payload,
  });
}

export async function updateProfileWithAvatar(formData) {
  return apiRequest(`${base}/me/`, {
    method: "PATCH",
    body: formData,
    isFormData: true,
  });
}

export async function verifyRegisterOTP(phone, code) {
  return apiRequest(`${base}/consumer/verify-register-otp/`, {
    method: "POST",
    body: { phone, code },
    auth: false,
  });
}

export async function verifyForgotPasswordOTP(phone, code) {
  return apiRequest(`${base}/consumer/verify-forgot-password-otp/`, {
    method: "POST",
    body: { phone, code },
    auth: false,
  });
}

export async function requestEmailOTP(email) {
  return apiRequest(`${base}/consumer/request-email-otp/`, {
    method: "POST",
    body: { email },
    auth: false,
  });
}

export async function verifyEmailOTP(email, code) {
  return apiRequest(`${base}/consumer/verify-email-otp/`, {
    method: "POST",
    body: { email, code },
    auth: false,
  });
}
