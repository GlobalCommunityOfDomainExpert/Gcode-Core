import { HTMLAttributes } from "react";

export type SectionLabelProps = HTMLAttributes<HTMLDivElement>;

export function SectionLabel({
  className = "",
  children,
  ...props
}: SectionLabelProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`} {...props}>
      <span className="text-small text-text-secondary shrink-0 font-semibold tracking-wide uppercase">
        {children}
      </span>
      <span className="bg-border-light h-px flex-1" />
    </div>
  );
}
