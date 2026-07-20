"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { EventsShell } from "@/components/layout";
import { getSession, isAdmin, Session } from "@/lib/auth/session";
import {
  getCategories,
  getEventTypes,
  getModes,
  getStatuses,
} from "@/lib/api/lookups";

export default function EventsAppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const current = getSession();
    if (current && !isAdmin(current) && pathname.startsWith("/my-organized-events")) {
      router.replace("/my-events");
      return;
    }
    setSession(current);
  }, [router, pathname]);

  useEffect(() => {
    // Warm the lookup-table caches immediately so components that need
    // them later (e.g. the event wizard's type step) get a cache hit.
    getEventTypes();
    getStatuses();
    getModes();
    getCategories();
  }, []);

  return <EventsShell session={session}>{children}</EventsShell>;
}
