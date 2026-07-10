const TOKEN_KEY = "gcode_token";

export interface Session {
  token: string;
  userId: number;
  roleName: string;
  fullName: string;
}

export function setSession(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getSession(): Session | null {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
    );
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      clearSession();
      return null;
    }
    return {
      token,
      userId: Number(payload.sub),
      roleName: payload.role ?? "NONE",
      fullName: payload.full_name ?? "",
    };
  } catch {
    clearSession();
    return null;
  }
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
}
