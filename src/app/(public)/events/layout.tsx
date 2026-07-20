"use client";

import { ReactNode, useEffect, useState } from "react";
import { EventsShell } from "@/components/layout";
import { getSession, Session } from "@/lib/auth/session";

export default function EventsLayout({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    setSession(getSession());
  }, []);

  return <EventsShell session={session}><div className="">{children}</div></EventsShell>;
}
