import { Check, LucideIcon } from "lucide-react";
import { Icon } from "@/components/atoms";

export interface SelectableCardProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  selected?: boolean;
  onSelect?: () => void;
  // "vertical" (default): centered icon/title/subtitle, e.g. stakeholder/event-type pickers.
  // "horizontal": left-aligned title+subtitle+meta with a checkmark on the right, e.g. a pass-type picker.
  layout?: "vertical" | "horizontal";
  meta?: string; // e.g. a price badge, horizontal layout only
  // Greyed out + unclickable — e.g. a pass that's enabled but outside its
  // own registration window. Still shown (not hidden), just not bookable.
  disabled?: boolean;
}

export function SelectableCard({
  icon,
  title,
  subtitle,
  selected = false,
  onSelect,
  layout = "vertical",
  meta,
  disabled = false,
}: SelectableCardProps) {
  const borderClasses = disabled
    ? "border-border-light bg-bg-light opacity-60 cursor-not-allowed"
    : selected
      ? "border-primary bg-primary-light"
      : "border-border-light bg-surface-light hover:border-border-hover";

  if (layout === "horizontal") {
    return (
      <button
        type="button"
        role="radio"
        aria-checked={selected}
        aria-disabled={disabled}
        disabled={disabled}
        onClick={disabled ? undefined : onSelect}
        className={`focus-visible:ring-primary flex w-full items-center justify-between gap-4 rounded-md border-2 p-6 text-left transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none ${borderClasses}`}
      >
        <div className="space-y-1">
          <p className="text-body text-text-primary font-semibold">{title}</p>
          {subtitle && (
            <p className="text-small text-text-secondary">{subtitle}</p>
          )}
          {meta && (
            <p className="text-small text-success font-semibold">{meta}</p>
          )}
        </div>
        <span
          className={`flex size-6 shrink-0 items-center justify-center rounded-full ${
            selected ? "bg-primary text-white" : "border-border-light border"
          }`}
        >
          {selected && <Icon icon={Check} size="sm" />}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`focus-visible:ring-primary flex flex-col items-center gap-2 rounded-md border-2 p-6 text-center transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${borderClasses}`}
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
