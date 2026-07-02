import { ReactNode } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  LucideIcon,
  X,
} from "lucide-react";
import { Icon } from "@/components/atoms";

export type BannerTone = "info" | "success" | "warning" | "danger";

export interface BannerProps {
  tone?: BannerTone;
  icon?: LucideIcon;
  children: ReactNode;
  onDismiss?: () => void;
}

const toneClasses: Record<BannerTone, string> = {
  info: "bg-primary-light text-primary",
  success: "bg-success-light text-success",
  warning: "bg-warning-light text-warning",
  danger: "bg-danger-light text-danger",
};

const defaultIcon: Record<BannerTone, LucideIcon> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: AlertCircle,
};

export function Banner({
  tone = "info",
  icon,
  children,
  onDismiss,
}: BannerProps) {
  return (
    <div
      role="status"
      className={`text-body flex items-start gap-3 rounded-md px-4 py-3 ${toneClasses[tone]}`}
    >
      <Icon
        icon={icon ?? defaultIcon[tone]}
        size="sm"
        className="mt-0.5 shrink-0"
      />
      <div className="flex-1">{children}</div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="focus-visible:ring-primary shrink-0 rounded-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <Icon icon={X} size="sm" />
        </button>
      )}
    </div>
  );
}
