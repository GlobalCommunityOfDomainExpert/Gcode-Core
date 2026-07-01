import { Button } from "@/components/atoms";

export interface RoleCTAProps {
  title: string;
  description?: string;
  actionLabel: string;
  onAction?: () => void;
}

export function RoleCTA({ title, description, actionLabel, onAction }: RoleCTAProps) {
  return (
    <div className="flex flex-col items-center justify-between gap-4 rounded-md border border-border-light bg-bg-light p-6 sm:flex-row">
      <div className="text-center sm:text-left">
        <h4 className="text-large font-semibold text-text-primary">{title}</h4>
        {description && <p className="text-body text-text-secondary">{description}</p>}
      </div>
      <Button variant="primary" onClick={onAction} className="shrink-0">
        {actionLabel}
      </Button>
    </div>
  );
}
