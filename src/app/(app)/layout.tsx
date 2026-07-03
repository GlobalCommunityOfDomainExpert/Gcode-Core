"use client";

import { ReactNode } from "react";
import {
  CalendarCheck,
  // CalendarClock,
  // LayoutDashboard,
  // Share2,
  // Settings,
  // Wallet,
} from "lucide-react";
import { AppShell, Navbar, Sidebar, SidebarLink } from "@/components/layout";

const sidebarLinks: SidebarLink[] = [
  // {
  //   label: "Dashboard",
  //   groupLabel: "Main",
  //   href: "/dashboard",
  //   icon: LayoutDashboard,
  //   badge: "12",
  // },
  // { label: "My Bookings", href: "/my-bookings", icon: CalendarClock },
  {
    label: "My Events",
    icon: CalendarCheck,
    children: [
      { label: "Attending", href: "/my-events" },
      { label: "Organizing", href: "/my-organized-events" },
    ],
  },
  // { label: "Payouts", href: "/payouts", icon: Wallet },
  // {
  //   label: "Settings",
  //   groupLabel: "Account",
  //   href: "/settings",
  //   icon: Settings,
  // },
  // { label: "Refer", href: "/refer", icon: Share2 },
];

const sidebarUser = {
  name: "Arjun Sharma",
  role: "Expert",
  avatarInitials: "AS",
};

export default function AppLayout({ children }: { children: ReactNode }) {
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
