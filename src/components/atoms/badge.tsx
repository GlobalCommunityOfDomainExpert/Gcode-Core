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
  sm: "h-5 px-1 text-small",
  md: "h-6 px-2 text-small",
};

const toneClasses: Record<BadgeVariant, Record<BadgeTone, string>> = {
  solid: {
    neutral: "bg-text-secondary text-white",
    primary: "bg-primary text-white",
    success: "bg-success text-white",
    warning: "bg-warning text-text-primary",
    danger: "bg-danger text-white",
  },
  outline: {
    neutral: "bg-transparent border border-border-light text-text-secondary",
    primary: "bg-transparent border border-primary text-primary",
    success: "bg-transparent border border-success text-success",
    warning: "bg-transparent border border-warning text-warning",
    danger: "bg-transparent border border-danger text-danger",
  },
  muted: {
    neutral: "bg-bg-light text-text-secondary",
    primary: "bg-primary-light text-primary",
    success: "bg-success-light text-success",
    warning: "bg-warning-light text-warning",
    danger: "bg-danger-light text-danger",
  },
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
      className={`inline-flex items-center justify-center rounded-sm leading-none font-medium ${toneClasses[variant][tone]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
