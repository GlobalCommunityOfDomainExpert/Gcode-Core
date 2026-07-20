import { HTMLAttributes } from "react";

export type BadgeVariant = "solid" | "outline" | "muted";
export type BadgeTone =
  "neutral" | "primary" | "success" | "warning" | "danger";
export type BadgeSize = "sm" | "md";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  tone?: BadgeTone;
  size?: BadgeSize;
}

const sizeClasses: Record<BadgeSize, string> = {
  sm: "h-5 px-2 text-small",
  md: "h-6 px-2.5 text-small",
};

// All three variants render as a solid, fully-saturated fill — no
// transparent/hollow badge and no washed-out pastel tint. "outline" and
// "muted" are kept as distinct props (for call-site intent) but share the
// same vibrant coloring as "solid".
const solidClasses: Record<BadgeTone, string> = {
  // The brand red (secondary) sits almost on top of "danger" in hue — a
  // "neutral" badge in that color reads as an error. Use the brand navy
  // instead: still vibrant/intentional, no false alarm.
  neutral: "bg-primary text-white",
  primary: "bg-primary text-white",
  success: "bg-success text-white",
  warning: "bg-warning text-text-primary",
  danger: "bg-danger text-white",
};

const toneClasses: Record<BadgeVariant, Record<BadgeTone, string>> = {
  solid: solidClasses,
  outline: solidClasses,
  muted: solidClasses,
};

export function Badge({
  variant = "solid",
  tone = "neutral",
  size = "md",
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full leading-none font-medium ${toneClasses[variant][tone]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
