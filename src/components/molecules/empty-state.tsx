import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { Icon } from "@/components/atoms";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-md border border-border-light bg-surface-light px-6 py-12 text-center">
      {icon && (
        <div className="flex size-12 items-center justify-center rounded-full bg-bg-light text-text-secondary">
          <Icon icon={icon} size="lg" />
        </div>
      )}
      <div className="space-y-1">
        <h3 className="text-large font-semibold text-text-primary">{title}</h3>
        {description && <p className="text-body text-text-secondary">{description}</p>}
      </div>
      {action}
    </div>
  );
}
