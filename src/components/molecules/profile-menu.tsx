"use client";

import { useRef, useState } from "react";
import { ChevronDown, ChevronRight, LogOut, User } from "lucide-react";
import { Avatar, Icon } from "@/components/atoms";
import { useClickOutside } from "@/hooks/use-click-outside";

export interface ProfileMenuUser {
  name: string;
  role: string;
  avatarInitials: string;
  avatarSrc?: string;
}

export interface ProfileMenuProps {
  user: ProfileMenuUser;
  onViewProfile?: () => void;
  onLogout?: () => void;
  /**
   * "sidebar": full-width row anchored at the bottom of the desktop Sidebar (and the
   * mobile menu's bare Sidebar embed); menu opens upward, above the trigger.
   * "navbar": compact trigger sized for the header bar; menu opens downward, styled
   * for the primary-colored header background.
   */
  variant?: "sidebar" | "navbar";
}

export function ProfileMenu({
  user,
  onViewProfile,
  onLogout,
  variant = "sidebar",
}: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useClickOutside(rootRef, open, () => setOpen(false));

  if (variant === "navbar") {
    return (
      <div ref={rootRef} className="relative">
        {open && (
          <div
            role="menu"
            className="border-border-light bg-surface-light absolute top-full right-0 mt-2 w-48 rounded-md border py-1 shadow-md"
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
          className="focus-visible:ring-offset-primary flex items-center gap-2 rounded-md p-1.5 text-left text-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <Avatar
            alt={user.name}
            src={user.avatarSrc}
            initials={user.avatarInitials}
            size="sm"
          />
          <span className="hidden min-w-0 text-left md:inline">
            <span className="text-small block truncate font-semibold text-white">
              {user.name}
            </span>
            <span className="text-small block truncate text-white/70">
              {user.role}
            </span>
          </span>
          <Icon
            icon={ChevronDown}
            size="sm"
            className={`hidden shrink-0 text-white/70 transition-transform md:block ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>
    );
  }

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
