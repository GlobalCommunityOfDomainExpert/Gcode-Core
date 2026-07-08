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
  userId: number,
  otpCode: string,
  purpose: string,
): Promise<{ message: string }> {
  return apiRequest("/auth/verify-otp", {
    method: "POST",
    body: { user_id: userId, otp_code: otpCode, purpose },
  });
}

export function selectStakeholder(
  userId: number,
  roleName: string,
): Promise<{ message: string }> {
  return apiRequest("/auth/select-stakeholder", {
    method: "POST",
    body: { user_id: userId, role_name: roleName },
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
