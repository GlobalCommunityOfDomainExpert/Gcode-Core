"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck } from "lucide-react";
import { AppShell } from "./app-shell";
import { Navbar } from "./navbar";
import { Sidebar, SidebarLink } from "./sidebar";
import { clearSession, Session } from "@/lib/auth/session";

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

export interface AuthedShellProps {
  session: Session;
  children: ReactNode;
}

export function AuthedShell({ session, children }: AuthedShellProps) {
  const router = useRouter();

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
