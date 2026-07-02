"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheck,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  LucideIcon,
  User,
} from "lucide-react";
import { Avatar, Icon, Progress } from "@/components/atoms";

export interface SidebarLink {
  label: string;
  href?: string;
  icon?: LucideIcon;
  badge?: string;
  children?: { label: string; href: string }[];
  /** Renders a small uppercase section heading above this link, starting a new group. */
  groupLabel?: string;
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

function ProfileMenu({
  user,
  onViewProfile,
  onLogout,
}: Pick<SidebarProps, "user" | "onViewProfile" | "onLogout">) {
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
          className="border-border-light bg-surface-light absolute bottom-full left-0 mb-2 w-full min-w-48 rounded-md border py-1 shadow-md"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onViewProfile?.();
              setOpen(false);
            }}
            className="text-body text-text-primary hover:bg-bg-light flex w-full items-center gap-2 px-3 py-2 text-left"
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
            className="text-body text-danger hover:bg-danger-light flex w-full items-center gap-2 px-3 py-2 text-left"
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
        className="hover:bg-bg-light focus-visible:ring-primary flex w-full items-center gap-3 rounded-md p-2 text-left focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <Avatar
          alt={user.name}
          src={user.avatarSrc}
          initials={user.avatarInitials}
          size="sm"
        />
        <span className="min-w-0 flex-1">
          <span className="text-small text-text-primary block truncate font-semibold">
            {user.name}
          </span>
          <span className="text-small text-text-secondary block truncate">
            {user.role}
          </span>
        </span>
        <Icon
          icon={ChevronRight}
          size="sm"
          className={`text-text-secondary shrink-0 transition-transform ${open ? "-rotate-90" : "rotate-90"}`}
        />
      </button>
    </div>
  );
}

function SidebarGroup({
  link,
  pathname,
  onNavigate,
}: {
  link: SidebarLink;
  pathname: string;
  onNavigate?: () => void;
}) {
  const children = link.children ?? [];
  const hasActiveChild = children.some((child) => child.href === pathname);
  const [open, setOpen] = useState(hasActiveChild);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className={`text-body focus-visible:ring-primary flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left font-medium transition-colors hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${
          hasActiveChild
            ? "bg-primary-light text-primary"
            : "text-text-secondary hover:bg-bg-light hover:text-text-primary"
        }`}
      >
        {link.icon && <Icon icon={link.icon} size="sm" />}
        <span className="flex-1">{link.label}</span>
        <Icon
          icon={ChevronDown}
          size="sm"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="border-border-light mt-1 flex flex-col gap-1 border-l pl-6">
          {children.map((child) => {
            const isActive = child.href === pathname;
            return (
              <Link
                key={child.href}
                href={child.href}
                onClick={onNavigate}
                aria-current={isActive ? "page" : undefined}
                className={`text-small focus-visible:ring-primary rounded-sm px-3 py-1.5 font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-text-secondary hover:bg-bg-light hover:text-text-primary"
                }`}
              >
                {child.label}
              </Link>
            );
          })}
        </div>
      )}
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
        {links.map((link) => (
          // [PROBLEM]:  Grouped Navigation Layout needs re-work
          <div key={link.label}>
            {link.groupLabel && (
              <p className="text-small text-text-secondary mt-5 mb-1 px-3 font-bold tracking-widest uppercase">
                {link.groupLabel}
              </p>
            )}
            {link.children ? (
              <SidebarGroup
                link={link}
                pathname={pathname}
                onNavigate={onNavigate}
              />
            ) : (
              <Link
                href={link.href ?? "#"}
                onClick={onNavigate}
                aria-current={pathname === link.href ? "page" : undefined}
                className={`text-body focus-visible:ring-primary flex items-center gap-3 rounded-sm px-3 py-2 font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${
                  pathname === link.href
                    ? "bg-primary-light text-primary"
                    : "text-text-secondary hover:bg-bg-light hover:text-text-primary"
                }`}
              >
                {link.icon && <Icon icon={link.icon} size="sm" />}
                <span className="flex-1">{link.label}</span>
                {link.badge && (
                  <span className="bg-primary-light text-small text-primary rounded-full px-1.5 py-0.5 font-semibold">
                    {link.badge}
                  </span>
                )}
              </Link>
            )}
          </div>
        ))}
      </nav>

      <div className="border-border-light space-y-3 border-t p-3">
        {profileCompletion !== undefined && profileCompletion < 100 && (
          <div className="space-y-1 px-2">
            <p className="text-small text-text-secondary">
              Profile {profileCompletion}% complete
            </p>
            <Progress value={profileCompletion} label="Profile completion" />
          </div>
        )}
        <ProfileMenu
          user={user}
          onViewProfile={onViewProfile}
          onLogout={onLogout}
        />
      </div>
    </>
  );

  if (variant === "bare") {
    return <div className="flex flex-col">{body}</div>;
  }

  return (
    <aside className="border-border-light bg-surface-light hidden w-64 shrink-0 flex-col border-r lg:flex">
      {body}
    </aside>
  );
}
