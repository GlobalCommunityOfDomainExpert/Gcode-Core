import { Lock, LucideIcon } from "lucide-react";
import { Icon, Tooltip } from "@/components/atoms";

export interface SelectableCardMetaItem {
  icon: LucideIcon;
  label: string;
  tone?: "success" | "warning" | "secondary";
}

export interface SelectableCardProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  selected?: boolean;
  onSelect?: () => void;
  // "vertical" (default): centered icon/title/subtitle, e.g. stakeholder/event-type pickers.
  // "horizontal": left-aligned icon/title+subtitle+meta with a radio dot on the right, e.g. a pass-type picker.
  layout?: "vertical" | "horizontal";
  // Plain-text meta line, horizontal layout only. Prefer `metaItems` when the
  // value is made up of distinct facts (price, spots, deadline) — a single
  // joined string reads as one blob, an icon per fact is scannable at a glance.
  meta?: string;
  metaItems?: SelectableCardMetaItem[];
  // Greyed out + unclickable — e.g. a pass that's enabled but outside its
  // own registration window. Still shown (not hidden), just not bookable.
  disabled?: boolean;
  // Short pill shown above meta when disabled, e.g. "Opens in 7d" — horizontal layout only.
  statusLabel?: string;
  // Tooltip content on the lock indicator explaining why it's disabled — horizontal layout only.
  lockMessage?: string;
}

const metaToneClasses: Record<
  NonNullable<SelectableCardMetaItem["tone"]>,
  string
> = {
  success: "text-success",
  warning: "text-warning",
  secondary: "text-text-secondary",
};

export function SelectableCard({
  icon,
  title,
  subtitle,
  selected = false,
  onSelect,
  layout = "vertical",
  meta,
  metaItems,
  disabled = false,
  statusLabel,
  lockMessage,
}: SelectableCardProps) {
  const borderClasses = disabled
    ? "border-border-light bg-bg-light opacity-60 cursor-not-allowed"
    : selected
      ? "border-primary bg-primary-light cursor-pointer"
      : "border-border-light bg-surface-light hover:border-border-hover cursor-pointer";

  if (layout === "horizontal") {
    const indicator = (
      <span
        className={`flex size-6 shrink-0 items-center justify-center rounded-full border ${
          disabled
            ? "border-border-light text-text-secondary"
            : selected
              ? "border-primary"
              : "border-border-light"
        }`}
      >
        {disabled ? (
          <Icon icon={Lock} size="sm" />
        ) : (
          selected && <span className="bg-primary size-2.5 rounded-full" />
        )}
      </span>
    );

    return (
      <button
        type="button"
        role="radio"
        aria-checked={selected}
        aria-disabled={disabled}
        disabled={disabled}
        onClick={disabled ? undefined : onSelect}
        className={`focus-visible:ring-primary flex w-full items-start justify-between gap-4 rounded-md border-2 p-6 text-left transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none ${borderClasses}`}
      >
        <div className="flex min-w-0 items-start gap-3">
          {icon && (
            <span className="bg-primary-light text-primary flex size-10 shrink-0 items-center justify-center rounded-full">
              <Icon icon={icon} size="md" />
            </span>
          )}
          <div className="min-w-0 space-y-1">
            <p className="text-body text-text-primary font-semibold">{title}</p>
            {subtitle && (
              <p className="text-small text-text-secondary">{subtitle}</p>
            )}
            {statusLabel && (
              <span className="border-border-light text-text-secondary bg-surface-light text-small inline-flex items-center gap-1 rounded-full border px-2 py-0.5">
                <Icon icon={Lock} size="sm" />
                {statusLabel}
              </span>
            )}
            {metaItems && metaItems.length > 0 ? (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5">
                {metaItems.map((item, index) => (
                  <span
                    key={index}
                    className={`text-small inline-flex items-center gap-1 font-semibold ${metaToneClasses[item.tone ?? "success"]}`}
                  >
                    <Icon icon={item.icon} size="sm" />
                    {item.label}
                  </span>
                ))}
              </div>
            ) : (
              meta && (
                <p className="text-small text-success font-semibold">{meta}</p>
              )
            )}
          </div>
        </div>
        {disabled && lockMessage ? (
          <Tooltip content={lockMessage} position="left">
            <span className="mt-1 inline-flex">{indicator}</span>
          </Tooltip>
        ) : (
          <span className="mt-1 inline-flex">{indicator}</span>
        )}
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
