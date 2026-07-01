"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, ChevronRight, LayoutDashboard, LogOut, LucideIcon, User } from "lucide-react";
import { Avatar, Icon, Progress } from "@/components/atoms";

export interface SidebarLink {
  label: string;
  href: string;
  icon?: LucideIcon;
}

export interface SidebarUser {
  name: string;
  role: string;
  avatarInitials: string;
  avatarSrc?: string;
}

export interface SidebarProps {
  logo?: ReactNode;
  links?: SidebarLink[];
  user: SidebarUser;
  profileCompletion?: number;
  onViewProfile?: () => void;
  onLogout?: () => void;
  /** "panel" renders the persistent desktop aside (hidden below lg). "bare" renders just the content, for embedding elsewhere (e.g. Navbar's mobile menu). */
  variant?: "panel" | "bare";
  onNavigate?: () => void;
}

const defaultLinks: SidebarLink[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Bookings", href: "/bookings", icon: CalendarCheck },
];

function ProfileMenu({ user, onViewProfile, onLogout }: Pick<SidebarProps, "user" | "onViewProfile" | "onLogout">) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClick(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      {open && (
        <div
          role="menu"
          className="absolute bottom-full left-0 mb-2 w-full min-w-48 rounded-md border border-border-light bg-surface-light py-1 shadow-md"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onViewProfile?.();
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-body text-text-primary hover:bg-bg-light"
          >
            <Icon icon={User} size="sm" />
            View Profile
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onLogout?.();
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-body text-danger hover:bg-danger-light"
          >
            <Icon icon={LogOut} size="sm" />
            Logout
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-bg-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <Avatar alt={user.name} src={user.avatarSrc} initials={user.avatarInitials} size="sm" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-small font-semibold text-text-primary">
            {user.name}
          </span>
          <span className="block truncate text-small text-text-secondary">{user.role}</span>
        </span>
        <Icon
          icon={ChevronRight}
          size="sm"
          className={`shrink-0 text-text-secondary transition-transform ${open ? "-rotate-90" : "rotate-90"}`}
        />
      </button>
    </div>
  );
}

export function Sidebar({
  logo,
  links = defaultLinks,
  user,
  profileCompletion,
  onViewProfile,
  onLogout,
  variant = "panel",
  onNavigate,
}: SidebarProps) {
  const pathname = usePathname();

  const body = (
    <>
      {logo && <div className="flex h-16 items-center px-4">{logo}</div>}

      <nav aria-label="Sidebar" className="flex-1 space-y-1 px-3 pt-3">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-3 rounded-sm px-3 py-2 text-body font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                isActive
                  ? "bg-primary-light text-primary"
                  : "text-text-secondary hover:bg-bg-light hover:text-text-primary"
              }`}
            >
              {link.icon && <Icon icon={link.icon} size="sm" />}
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-border-light p-3">
        {profileCompletion !== undefined && profileCompletion < 100 && (
          <div className="space-y-1 px-2">
            <p className="text-small text-text-secondary">Profile {profileCompletion}% complete</p>
            <Progress value={profileCompletion} label="Profile completion" />
          </div>
        )}
        <ProfileMenu user={user} onViewProfile={onViewProfile} onLogout={onLogout} />
      </div>
    </>
  );

  if (variant === "bare") {
    return <div className="flex flex-col">{body}</div>;
  }

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border-light bg-surface-light lg:flex">
      {body}
    </aside>
  );
}
