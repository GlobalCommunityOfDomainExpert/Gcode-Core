import { Check, Lock, LucideIcon } from "lucide-react";
import { Icon, Tooltip } from "@/components/atoms";
import { TicketNotches } from "./ticket-frame";

export interface SelectableCardMetaItem {
  icon: LucideIcon;
  label: string;
  tone?: "success" | "warning" | "secondary";
}

export type SelectableCardTint = "gold" | "blue" | "red" | "green";

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
  // "ticket": renders a light-tinted ticket border with edge notches and a
  // perforation divider, with metaItems moved into the stub — horizontal layout only, opt-in.
  shape?: "default" | "ticket";
  // Light background/border tint for shape="ticket", used to visually tell
  // multiple pass cards apart. Reuses existing brand/semantic tokens where
  // possible (red -> secondary, green -> success); "blue" is the one new
  // token added for this. Ignored unless shape="ticket".
  tint?: SelectableCardTint;
}

const metaToneClasses: Record<
  NonNullable<SelectableCardMetaItem["tone"]>,
  string
> = {
  success: "text-success",
  warning: "text-warning",
  secondary: "text-text-secondary",
};

const ticketTintClasses: Record<
  SelectableCardTint,
  {
    border: string;
    borderStrong: string;
    hoverBorder: string;
    bg: string;
    icon: string;
    // CSS custom property (Tailwind theme color) used to paint the divider's
    // dot pattern via a background gradient — see dividerStyle() below.
    dividerVar: string;
  }
> = {
  gold: {
    border: "border-ticket/15",
    borderStrong: "border-ticket/35",
    hoverBorder: "hover:border-ticket/35",
    bg: "bg-ticket-light/50",
    icon: "text-ticket",
    dividerVar: "--color-ticket",
  },
  blue: {
    border: "border-ticket-blue/15",
    borderStrong: "border-ticket-blue/35",
    hoverBorder: "hover:border-ticket-blue/35",
    bg: "bg-ticket-blue-light/50",
    icon: "text-ticket-blue",
    dividerVar: "--color-ticket-blue",
  },
  red: {
    border: "border-secondary/15",
    borderStrong: "border-secondary/35",
    hoverBorder: "hover:border-secondary/35",
    bg: "bg-secondary-light/50",
    icon: "text-secondary",
    dividerVar: "--color-secondary",
  },
  green: {
    border: "border-success/15",
    borderStrong: "border-success/35",
    hoverBorder: "hover:border-success/35",
    bg: "bg-success-light/50",
    icon: "text-success",
    dividerVar: "--color-success",
  },
};

// A straight, evenly-spaced dot pattern painted via a background gradient
// rather than `border-style: dotted` — browsers render native dotted
// borders as unevenly sized/spaced circles at small widths, which reads as
// a crooked line. A repeating-linear-gradient guarantees a perfectly
// straight, uniform line of dots regardless of browser or direction.
function dividerStyle(cssVar: string, direction: "to right" | "to bottom") {
  return {
    backgroundImage: `repeating-linear-gradient(${direction}, color-mix(in oklab, var(${cssVar}) 45%, transparent) 0 3px, transparent 3px 7px)`,
  };
}

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
  shape = "default",
  tint = "gold",
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

    if (shape === "ticket") {
      const tone = ticketTintClasses[tint];
      const ticketBorderClasses = disabled
        ? `${tone.border} bg-bg-light opacity-60 cursor-not-allowed`
        : selected
          ? `${tone.borderStrong} ${tone.bg} cursor-pointer`
          : `${tone.border} ${tone.bg} ${tone.hoverBorder} cursor-pointer`;

      return (
        <button
          type="button"
          role="radio"
          aria-checked={selected}
          aria-disabled={disabled}
          disabled={disabled}
          onClick={disabled ? undefined : onSelect}
          className={`focus-visible:ring-primary relative grid min-h-36 w-full grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-md border p-4 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none ${ticketBorderClasses}`}
        >
          <TicketNotches size={16} orientation="vertical" />
          {selected && !disabled && (
            <span
              aria-hidden="true"
              className={`absolute top-2 right-2.5 ${tone.icon}`}
            >
              <Icon icon={Check} size="sm" />
            </span>
          )}
          <div className="flex max-w-full min-w-0 flex-col items-start gap-1 text-left">
            <p className="text-body text-text-primary font-semibold">{title}</p>
            {subtitle && (
              <p className="text-small text-text-secondary">{subtitle}</p>
            )}
            {statusLabel &&
              (lockMessage ? (
                <Tooltip content={lockMessage} position="top">
                  <span className="border-border-light text-text-secondary bg-surface-light text-small inline-flex items-center gap-1 rounded-full border px-2 py-0.5">
                    <Icon icon={Lock} size="sm" />
                    {statusLabel}
                  </span>
                </Tooltip>
              ) : (
                <span className="border-border-light text-text-secondary bg-surface-light text-small inline-flex items-center gap-1 rounded-full border px-2 py-0.5">
                  <Icon icon={Lock} size="sm" />
                  {statusLabel}
                </span>
              ))}
          </div>
          {/* Equal 1fr columns on both sides guarantee this vertical divider
              always sits exactly at the card's horizontal center — the same
              X as the top/bottom notches — regardless of how much content
              is on either side. */}
          <div
            aria-hidden="true"
            className="mx-1 w-0.5 self-stretch"
            style={dividerStyle(tone.dividerVar, "to bottom")}
          />
          <div className="flex flex-col items-center gap-1">
            {metaItems && metaItems.length > 0 ? (
              metaItems.map((item, index) => (
                <span
                  key={index}
                  className={`inline-flex items-center gap-1 font-semibold ${
                    index === 0
                      ? `text-body font-bold ${metaToneClasses[item.tone ?? "success"]}`
                      : "text-small text-text-secondary"
                  }`}
                >
                  <Icon icon={item.icon} size="sm" />
                  {item.label}
                </span>
              ))
            ) : meta ? (
              <p className="text-small text-success font-semibold">{meta}</p>
            ) : null}
          </div>
        </button>
      );
    }

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
