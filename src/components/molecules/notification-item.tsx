import { ReactNode } from "react";
import { Avatar } from "@/components/atoms";

export interface NotificationItemProps {
  avatarInitials: string;
  avatarSrc?: string;
  description: ReactNode;
  timestamp: string;
  unread?: boolean;
}

export function NotificationItem({
  avatarInitials,
  avatarSrc,
  description,
  timestamp,
  unread = false,
}: NotificationItemProps) {
  return (
    <div
      className={`flex items-start gap-3 rounded-sm p-2 ${unread ? "bg-primary-light" : ""}`}
    >
      <Avatar alt="" initials={avatarInitials} src={avatarSrc} size="sm" />
      <div className="min-w-0 flex-1">
        <p
          className={`text-body ${unread ? "font-semibold text-text-primary" : "text-text-primary"}`}
        >
          {description}
        </p>
        <p className="text-small text-text-secondary">{timestamp}</p>
      </div>
      {unread && <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />}
    </div>
  );
}
