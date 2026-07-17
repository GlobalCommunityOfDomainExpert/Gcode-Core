const TOKEN_KEY = "gcode_token";

export interface Session {
  token: string;
  userId: number;
  roleName: string;
  fullName: string;
  // No `email` JWT claim exists on the live backend yet — undefined until
  // AUTH_PKG's token issuance (sign-in/sign-up/oauth/select-stakeholder)
  // adds one. Decoded here so every caller starts working the moment it does.
  email?: string;
}

export function setSession(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
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
      email: payload.email || undefined,
    };
  } catch {
    clearSession();
    return null;
  }
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export const ADMIN_ROLE = "ADMIN";

export function isAdmin(session: Session | null): boolean {
  return session?.roleName === ADMIN_ROLE;
}
