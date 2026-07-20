"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/use-session";
import { getSession } from "@/lib/auth/session";

export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    // Re-check directly rather than trusting `session` alone — a dev-mode
    // double-effect pass (React Strict Mode) can observe a stale/transient
    // null from the store hook even though the real session is fine, and a
    // false redirect here is far more disruptive than a redundant read.
    if (!session && !getSession()) {
      router.replace("/sign-in");
    }
  }, [session, router]);

  if (!session) return null;

  return <>{children}</>;
}
