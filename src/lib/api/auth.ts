import { apiRequest } from "./client";

export function signUp(
  email: string,
  fullName: string,
  password: string,
): Promise<{ user_id: number; test_otp: string }> {
  return apiRequest("/auth/sign-up", {
    method: "POST",
    body: { email, full_name: fullName, password },
  });
}

export function verifyOtp(
  email: string,
  otpCode: string,
  purpose: string,
): Promise<{ message: string }> {
  return apiRequest("/auth/verify-otp", {
    method: "POST",
    body: { email:email, otp_code: otpCode, purpose },
  });
}

export function selectStakeholder(
  userId: number,
  email: string,
  roleName: string,
): Promise<{ message: string; token: string }> {
  return apiRequest("/auth/select-stakeholder", {
    method: "POST",
    body: { user_id: userId, email, role_name: roleName },
  });
}

export function signIn(
  email: string,
  password: string,
): Promise<{ user_id: number; role_name: string; token: string }> {
  return apiRequest("/auth/sign-in", {
    method: "POST",
    body: { email, password },
  });
}

export function oauthLoginGoogle(
  idToken: string,
): Promise<{ user_id: number; role_name: string; token: string }> {
  return apiRequest("/auth/oauth-login", {
    method: "POST",
    body: { id_token: idToken },
  });
}

export function requestPasswordReset(
  email: string,
): Promise<{ message: string }> {
  return apiRequest("/auth/forgot-password", {
    method: "POST",
    body: { email, origin: window.location.origin },
  });
}

export function resetPassword(
  token: string,
  newPassword: string,
): Promise<{ message: string }> {
  return apiRequest("/auth/reset-password", {
    method: "POST",
    body: { token, new_password: newPassword },
  });
}
