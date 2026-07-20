"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { EventsShell } from "@/components/layout";
import { isAdmin } from "@/lib/auth/session";
import { useSession } from "@/hooks/use-session";
import {
  getCategories,
  getEventTypes,
  getModes,
  getStatuses,
} from "@/lib/api/lookups";

export default function EventsAppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const session = useSession();

  useEffect(() => {
    if (
      session &&
      !isAdmin(session) &&
      pathname.startsWith("/my-organized-events")
    ) {
      router.replace("/my-events");
    }
  }, [session, pathname, router]);

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
