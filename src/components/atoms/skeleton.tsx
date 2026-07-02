import { HTMLAttributes } from "react";

export type SkeletonVariant = "base" | "pulse";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
}

export function Skeleton({
  variant = "pulse",
  className = "",
  ...props
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`bg-bg-light rounded-sm ${variant === "pulse" ? "animate-pulse" : ""} ${className}`}
      {...props}
    />
  );
}
