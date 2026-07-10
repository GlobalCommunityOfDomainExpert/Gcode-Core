"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck } from "lucide-react";
import { AppShell, Navbar, Sidebar, SidebarLink } from "@/components/layout";
import {
  getCategories,
  getEventTypes,
  getModes,
  getStatuses,
} from "@/lib/api/lookups";
import { clearSession, getSession, Session } from "@/lib/auth/session";

const sidebarLinks: SidebarLink[] = [
  {
    label: "My Events",
    icon: CalendarCheck,
    children: [
      { label: "Attending", href: "/my-events" },
      { label: "Organizing", href: "/my-organized-events" },
    ],
  },
];

function initials(fullName: string): string {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

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

  const sidebarUser = {
    name: session.fullName,
    role: session.roleName,
    avatarInitials: initials(session.fullName),
  };

  function handleLogout() {
    clearSession();
    router.push("/sign-in");
  }

  return (
    <AppShell
      navbar={
        <Navbar
          ctaLabel="Problem Feed"
          hasUnreadNotifications
          mobileFooter={
            <Sidebar
              variant="bare"
              links={sidebarLinks}
              user={sidebarUser}
              profileCompletion={100}
              onLogout={handleLogout}
            />
          }
        />
      }
      sidebar={
        <Sidebar
          links={sidebarLinks}
          user={sidebarUser}
          profileCompletion={100}
          onLogout={handleLogout}
        />
      }
    >
      {children}
    </AppShell>
  );
}
