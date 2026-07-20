"use client";

import { ReactNode, useEffect, useState } from "react";
import { AuthedShell } from "@/components/layout";
import { getSession, Session } from "@/lib/auth/session";

export default function ProfileLayout({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    setSession(getSession());
  }, []);

  if (!session) return null;

  return <AuthedShell session={session}>{children}</AuthedShell>;
}
