import { HTMLAttributes } from "react";

export type AvatarVariant = "circle" | "square";
export type AvatarSize = "sm" | "md" | "lg";
export type AvatarStatus = "online" | "offline" | "away";

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt: string;
  initials?: string;
  variant?: AvatarVariant;
  size?: AvatarSize;
  status?: AvatarStatus;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: "size-8 text-small",
  md: "size-10 text-body",
  lg: "size-12 text-large",
};

const variantClasses: Record<AvatarVariant, string> = {
  circle: "rounded-full",
  square: "rounded-md",
};

const statusClasses: Record<AvatarStatus, string> = {
  online: "bg-success",
  offline: "bg-text-secondary",
  away: "bg-warning",
};

const statusLabel: Record<AvatarStatus, string> = {
  online: "Online",
  offline: "Offline",
  away: "Away",
};

export function Avatar({
  src,
  alt,
  initials,
  variant = "circle",
  size = "md",
  status,
  className = "",
  ...props
}: AvatarProps) {
  return (
    <div
      className={`relative inline-flex shrink-0 ${sizeClasses[size]} ${className}`}
      {...props}
    >
      <div
        className={`flex h-full w-full items-center justify-center overflow-hidden bg-bg-light font-medium text-text-secondary ${variantClasses[variant]}`}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={alt} className="h-full w-full object-cover" />
        ) : (
          <span aria-hidden="true">{initials}</span>
        )}
      </div>
      {status && (
        <span
          role="img"
          aria-label={statusLabel[status]}
          className={`absolute bottom-0 right-0 size-2.5 rounded-full ring-2 ring-surface-light ${statusClasses[status]}`}
        />
      )}
    </div>
  );
}
