"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu, X } from "lucide-react";
import { Button, Icon } from "@/components/atoms";
import { Dropdown, DropdownItem } from "@/components/molecules";

export interface NavLink {
  label: string;
  href: string;
}

export interface NavbarProps {
  logo?: ReactNode;
  links?: NavLink[];
  resourcesLabel?: string;
  resourcesItems?: DropdownItem[];
  ctaLabel?: string;
  onCtaClick?: () => void;
  hasUnreadNotifications?: boolean;
  onNotificationClick?: () => void;
  /** Extra content appended to the mobile menu panel below the primary links (e.g. a "bare" Sidebar). */
  mobileFooter?: ReactNode;
}

const defaultLinks: NavLink[] = [
  { label: "Explore", href: "/explore" },
  { label: "Events", href: "/events" },
];

const defaultResourcesItems: DropdownItem[] = [
  { label: "Blogs", href: "/blogs" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Refund Policy", href: "/refund-policy" },
];

export function Navbar({
  logo = <span className="text-body font-extrabold text-white">GCODE</span>,
  links = defaultLinks,
  resourcesLabel = "Resources",
  resourcesItems = defaultResourcesItems,
  ctaLabel = "Get Started",
  onCtaClick,
  hasUnreadNotifications = false,
  onNotificationClick,
  mobileFooter,
}: NavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="relative bg-primary">
      <div className="mx-auto flex h-16 items-center justify-between gap-4 px-7">
        <div className="flex items-center gap-8">
          <Link href="/" className="shrink-0">
            {logo}
          </Link>
          <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`text-body font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary ${
                    isActive ? "text-white" : "text-white/70 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Dropdown
              trigger={
                <span className="cursor-pointer text-body font-medium text-white/70 hover:text-white">
                  {resourcesLabel} ▾
                </span>
              }
              items={resourcesItems}
            />
          </nav>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={onNotificationClick}
            aria-label="Notifications"
            className="relative rounded-sm p-2 text-white/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          >
            <Icon icon={Bell} size="sm" />
            {hasUnreadNotifications && (
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-danger" />
            )}
          </button>
          <Button variant="accent" size="sm" onClick={onCtaClick}>
            {ctaLabel}
          </Button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={onNotificationClick}
            aria-label="Notifications"
            className="relative rounded-sm p-2 text-white/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          >
            <Icon icon={Bell} size="sm" />
            {hasUnreadNotifications && (
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-danger" />
            )}
          </button>
          <Button variant="accent" size="sm" onClick={onCtaClick}>
            {ctaLabel}
          </Button>
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="rounded-sm p-2 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          >
            <Icon icon={mobileOpen ? X : Menu} size="md" />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <>
          <div
            className="fixed inset-x-0 bottom-0 top-16 z-30 bg-primary/40 md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-x-0 top-full z-40 max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-white/10 bg-primary shadow-lg md:hidden">
            <nav aria-label="Primary" className="space-y-1 px-4 py-3">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-sm px-2 py-2 text-body font-medium text-white/80 hover:bg-white/10 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
              {resourcesItems
                .filter((item): item is DropdownItem & { href: string } => !item.divider && !!item.href)
                .map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-sm px-2 py-2 text-body font-medium text-white/80 hover:bg-white/10 hover:text-white"
                  >
                    {item.label}
                  </Link>
                ))}
            </nav>
            {mobileFooter && (
              <div className="border-t border-white/10 bg-bg-light">{mobileFooter}</div>
            )}
          </div>
        </>
      )}
    </header>
  );
}
