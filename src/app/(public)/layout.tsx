"use client";

import { ReactNode, useEffect, useState } from "react";
import { AuthedShell, GuestShell } from "@/components/layout";
import { getSession, Session } from "@/lib/auth/session";

export default function PublicLayout({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    setSession(getSession());
  }, []);

  if (session) {
    return <AuthedShell session={session}>{children}</AuthedShell>;
  }

  return <GuestShell>{children}</GuestShell>;
}
