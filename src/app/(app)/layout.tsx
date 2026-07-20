"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/use-session";

export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (!session) {
      router.replace("/sign-in");
    }
  }, [session, router]);

  if (!session) return null;

  return <>{children}</>;
}
