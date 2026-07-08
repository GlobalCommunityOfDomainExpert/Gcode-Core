const TOKEN_KEY = "gcode_token";
const USER_ID_KEY = "gcode_user_id";
const ROLE_KEY = "gcode_role";

export function setSession(
  token: string,
  userId: number,
  roleName: string,
): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_ID_KEY, String(userId));
  localStorage.setItem(ROLE_KEY, roleName);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(ROLE_KEY);
}
