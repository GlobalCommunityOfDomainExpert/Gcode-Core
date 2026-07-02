import { HTMLAttributes } from "react";

export type BookingRefProps = HTMLAttributes<HTMLSpanElement>;

export function BookingRef({
  className = "",
  children,
  ...props
}: BookingRefProps) {
  return (
    <span
      className={`bg-bg-light text-small text-text-primary inline-block max-w-full truncate rounded-sm px-2 py-1 font-mono ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
