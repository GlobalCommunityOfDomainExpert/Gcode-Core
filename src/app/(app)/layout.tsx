"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

  if (session === "loading" || session === null) return null;

  return <>{children}</>;
}
