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
    <div className="border-border-light bg-surface-light flex items-center gap-4 rounded-md border p-4 transition-shadow hover:shadow-md">
      <div
        className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
          earned
            ? "bg-success-light text-success"
            : "bg-bg-light text-text-secondary"
        }`}
      >
        <Icon icon={icon} size="md" />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="text-body text-text-primary font-semibold">{title}</h4>
        <p className="text-small text-text-secondary truncate">{description}</p>
      </div>
      <Button variant="secondary" size="sm" onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  );
}
