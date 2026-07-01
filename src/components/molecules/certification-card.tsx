import { LucideIcon } from "lucide-react";
import { Button, Icon } from "@/components/atoms";

export interface CertificationCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel: string;
  onAction?: () => void;
  earned?: boolean;
}

export function CertificationCard({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  earned = false,
}: CertificationCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-md border border-border-light bg-surface-light p-4 transition-shadow hover:shadow-md">
      <div
        className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
          earned ? "bg-success-light text-success" : "bg-bg-light text-text-secondary"
        }`}
      >
        <Icon icon={icon} size="md" />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="text-body font-semibold text-text-primary">{title}</h4>
        <p className="truncate text-small text-text-secondary">{description}</p>
      </div>
      <Button variant="secondary" size="sm" onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  );
}
