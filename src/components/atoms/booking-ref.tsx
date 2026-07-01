import { HTMLAttributes } from "react";

export type BookingRefProps = HTMLAttributes<HTMLSpanElement>;

export function BookingRef({ className = "", children, ...props }: BookingRefProps) {
  return (
    <span
      className={`inline-block max-w-full truncate rounded-sm bg-bg-light px-2 py-1 font-mono text-small text-text-primary ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
