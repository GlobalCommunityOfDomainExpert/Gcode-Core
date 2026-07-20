"use client";

import { useSyncExternalStore } from "react";
import { getSession, Session } from "@/lib/auth/session";

// getSession() reads localStorage, which doesn't exist during SSR — the
// server snapshot is always null, and React re-renders with the real client
// value immediately after hydration. Never notifies (session changes come
// from explicit navigation, not from something this needs to subscribe to).
function subscribe() {
  return () => {};
}

function getServerSnapshot(): Session | null {
  return null;
}

export function useSession(): Session | null {
  return useSyncExternalStore(subscribe, getSession, getServerSnapshot);
}
