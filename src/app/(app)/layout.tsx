"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthedShell } from "@/components/layout";
import {
  getCategories,
  getEventTypes,
  getModes,
  getStatuses,
} from "@/lib/api/lookups";
import { getSession, Session } from "@/lib/auth/session";

export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [session, setSessionState] = useState<Session | null | "loading">(
    "loading",
  );

  useEffect(() => {
    const current = getSession();
    if (!current) {
      router.replace("/sign-in");
      return;
    }
    setSessionState(current);
  }, [router]);

  useEffect(() => {
    // Warm the lookup-table caches immediately so components that need
    // them later (e.g. the event wizard's type step) get a cache hit.
    getEventTypes();
    getStatuses();
    getModes();
    getCategories();
  }, []);

  if (session === "loading" || session === null) return null;

  return <AuthedShell session={session}>{children}</AuthedShell>;
}
