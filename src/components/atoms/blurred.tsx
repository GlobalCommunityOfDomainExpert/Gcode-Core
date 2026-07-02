import { HTMLAttributes } from "react";

export interface BlurredProps extends HTMLAttributes<HTMLSpanElement> {
  label?: string;
}

export function Blurred({
  label,
  className = "",
  children,
  ...props
}: BlurredProps) {
  return (
    <span className="inline-flex items-center">
      <span
        aria-hidden="true"
        className={`bg-bg-light rounded-sm px-1 text-transparent blur-sm select-none ${className}`}
        {...props}
      >
        {children}
      </span>
      {label && <span className="sr-only">{label}</span>}
    </span>
  );
}
