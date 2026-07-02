import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { Icon } from "@/components/atoms";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="border-border-light bg-surface-light flex flex-col items-center gap-3 rounded-md border px-6 py-12 text-center">
      {icon && (
        <div className="bg-bg-light text-text-secondary flex size-12 items-center justify-center rounded-full">
          <Icon icon={icon} size="lg" />
        </div>
      )}
      <div className="space-y-1">
        <h3 className="text-large text-text-primary font-semibold">{title}</h3>
        {description && (
          <p className="text-body text-text-secondary">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
