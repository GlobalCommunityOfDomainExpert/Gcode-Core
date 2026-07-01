import { HTMLAttributes } from "react";

export type SectionLabelProps = HTMLAttributes<HTMLDivElement>;

export function SectionLabel({ className = "", children, ...props }: SectionLabelProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`} {...props}>
      <span className="shrink-0 text-small font-semibold uppercase tracking-wide text-text-secondary">
        {children}
      </span>
      <span className="h-px flex-1 bg-border-light" />
    </div>
  );
}
