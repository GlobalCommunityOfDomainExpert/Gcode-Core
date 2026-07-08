"use client";

import { ReactNode, useEffect } from "react";
import { CalendarCheck } from "lucide-react";
import { AppShell, Navbar, Sidebar, SidebarLink } from "@/components/layout";
import {
  getCategories,
  getEventTypes,
  getModes,
  getStatuses,
} from "@/lib/api/lookups";

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

const sidebarUser = {
  name: "Arjun Sharma",
  role: "Expert",
  avatarInitials: "AS",
};

export default function AppLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Warm the lookup-table caches immediately so components that need
    // them later (e.g. the event wizard's type step) get a cache hit.
    getEventTypes();
    getStatuses();
    getModes();
    getCategories();
  }, []);

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
            />
          }
        />
      }
      sidebar={
        <Sidebar
          links={sidebarLinks}
          user={sidebarUser}
          profileCompletion={100}
        />
      }
    >
      {children}
    </AppShell>
  );
}
