import { LucideIcon } from "lucide-react";
import { Icon } from "@/components/atoms";

export interface SelectableCardProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  selected?: boolean;
  onSelect?: () => void;
}

export function SelectableCard({
  icon,
  title,
  subtitle,
  selected = false,
  onSelect,
}: SelectableCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`focus-visible:ring-primary flex flex-col items-center gap-2 rounded-md border-2 p-6 text-center transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${
        selected
          ? "border-primary bg-primary-light"
          : "border-border-light bg-surface-light hover:border-border-hover"
      }`}
    >
      {icon && (
        <Icon
          icon={icon}
          size="lg"
          className={selected ? "text-primary" : "text-text-secondary"}
        />
      )}
      <span className="text-body text-text-primary font-semibold">{title}</span>
      {subtitle && (
        <span className="text-small text-text-secondary">{subtitle}</span>
      )}
    </button>
  );
}
