"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AppShell } from "./app-shell";
import { Navbar, NavLink } from "./navbar";
import { ProfileMenu, ProfileMenuUser } from "@/components/molecules";
import { clearSession, isAdmin, Session } from "@/lib/auth/session";
import { initials } from "@/lib/auth/format";

function buildEventsNavLinks(session: Session | null): NavLink[] {
  const base: NavLink[] = [
    { label: "Home", href: "https://gcode.in" },
    { label: "Events", href: "/events" },
  ];
  if (!session) return base;
  if (isAdmin(session)) {
    return [
      ...base,
      {
        label: "My Events",
        children: [
          { label: "Attending", href: "/my-events" },
          { label: "Organizing", href: "/my-organized-events" },
        ],
      },
    ];
  }
  return [...base, { label: "My Events", href: "/my-events" }];
}

export interface EventsShellProps {
  session: Session | null;
  children: ReactNode;
}

export function EventsShell({ session, children }: EventsShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const links = buildEventsNavLinks(session);
  const transparent = pathname === "/events";

  if (!session) {
    return (
      <AppShell
        navbar={
          <Navbar
            links={links}
            ctaLabel="Register"
            onCtaClick={() => router.push("/sign-up")}
            secondaryCtaLabel="Sign In"
            onSecondaryCtaClick={() => router.push("/sign-in")}
            transparent={transparent}
          />
        }
        sidebar={null}
      >
        <div className={transparent ? "" : "mt-10"}>{children}</div>
      </AppShell>
    );
  }

  const user: ProfileMenuUser = {
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
          links={links}
          hasUnreadNotifications
          transparent={transparent}
          accountMenu={
            <div className="flex items-center gap-4">
              {isAdmin(session) && (
                <Link
                  href="/my-organized-events/new"
                  className="text-body focus-visible:ring-offset-primary font-medium whitespace-nowrap text-white/90 transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  + Host Event
                </Link>
              )}
              <ProfileMenu
                variant="navbar"
                user={user}
                onViewProfile={() => router.push("/profile")}
                onLogout={handleLogout}
              />
            </div>
          }
          mobileFooter={
            <div className="space-y-3 p-3">
              {isAdmin(session) && (
                <Link
                  href="/my-organized-events/new"
                  className="text-body text-primary block font-medium"
                >
                  + Host Event
                </Link>
              )}
              <ProfileMenu
                variant="sidebar"
                user={user}
                onViewProfile={() => router.push("/profile")}
                onLogout={handleLogout}
              />
            </div>
          }
        />
      }
      sidebar={null}
    >
      <div className={transparent ? "" : "mt-10"}>{children}</div>
    </AppShell>
  );
}
