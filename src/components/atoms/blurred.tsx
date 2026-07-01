import { HTMLAttributes } from "react";

export interface BlurredProps extends HTMLAttributes<HTMLSpanElement> {
  label?: string;
}

export function Blurred({ label, className = "", children, ...props }: BlurredProps) {
  return (
    <span className="inline-flex items-center">
      <span
        aria-hidden="true"
        className={`select-none rounded-sm bg-bg-light px-1 text-transparent blur-sm ${className}`}
        {...props}
      >
        {children}
      </span>
      {label && <span className="sr-only">{label}</span>}
    </span>
  );
}
