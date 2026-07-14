import {
  ArrowRight,
  Calendar,
  Clock,
  Image as ImageIcon,
  LucideIcon,
  MapPin,
  Users,
} from "lucide-react";
import NextLink from "next/link";
import {
  Badge,
  BadgeTone,
  Button,
  ButtonLink,
  Icon,
  Skeleton,
} from "@/components/atoms";
import { getEventColor } from "@/lib/event-color";
import { AvatarGroup, AvatarGroupItem } from "./avatar-group";

export interface EventCardTag {
  label: string;
  tone?: BadgeTone;
}

export interface EventCardProps {
  variant?: "default" | "featured";
  imageSrc?: string;
  imageAlt?: string;
  colorSeed: string;
  headerLabel?: string;
  tags: EventCardTag[];
  title: string;
  href?: string;
  date: string;
  location?: string;
  attendees?: AvatarGroupItem[];
  attendeesLabel?: string;
  urgencyLabel?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Event type name (e.g. "Webinar", "Hackathon") — picks which extra field below is most relevant. */
  eventType?: string;
  /** Session length (e.g. "1h 30m") — shown for talk/session formats when eventType is one of those. */
  durationText?: string;
  /** Remaining capacity — shown for competitive/limited-entry formats when eventType is one of those. */
  spotsLeft?: number;
}

// Different event formats care about different secondary info: a webinar's
// audience wants to know how long the session runs; a hackathon's audience
// wants to know if there's still room to join. Falls back to attendeesLabel
// (e.g. "N going") for formats without a more specific signal.
const SESSION_FORMAT_TYPES = ["Webinar", "Expert AMA"];
const COMPETITIVE_FORMAT_TYPES = ["Hackathon", "Ideathon"];

function resolveSecondaryInfo({
  eventType,
  durationText,
  spotsLeft,
  attendeesLabel,
}: Pick<
  EventCardProps,
  "eventType" | "durationText" | "spotsLeft" | "attendeesLabel"
>): { icon: LucideIcon; text: string } | null {
  if (eventType && SESSION_FORMAT_TYPES.includes(eventType) && durationText) {
    return { icon: Clock, text: durationText };
  }
  if (
    eventType &&
    COMPETITIVE_FORMAT_TYPES.includes(eventType) &&
    spotsLeft !== undefined
  ) {
    return {
      icon: Users,
      text: spotsLeft > 0 ? `${spotsLeft} spots left` : "Fully booked",
    };
  }
  if (attendeesLabel) {
    return { icon: Users, text: attendeesLabel };
  }
  return null;
}

function EventCardMedia({
  src,
  alt,
  colorSeed,
}: {
  src?: string;
  alt: string;
  colorSeed: string;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }

  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ backgroundColor: getEventColor(colorSeed) }}
    >
      <Icon icon={ImageIcon} size="lg" className="text-white/40" />
    </div>
  );
}

function EventCardTitle({
  title,
  href,
  className,
}: {
  title: string;
  href?: string;
  className: string;
}) {
  if (href) {
    return (
      <NextLink href={href} className={`${className} hover:underline`}>
        {title}
      </NextLink>
    );
  }
  return <h4 className={className}>{title}</h4>;
}

// Translucent-on-image pill colors for the "featured" variant's tags — kept
// separate from the shared Badge component since appending a className to
// override Badge's own bg-* utility isn't reliable (Tailwind resolves
// conflicting same-specificity classes by compiled rule order, not by
// position in the class string).
const overlayTagToneClass: Record<BadgeTone, string> = {
  neutral: "bg-white/15 text-white",
  primary: "bg-primary/80 text-white",
  success: "bg-success/90 text-white",
  warning: "bg-warning/90 text-text-primary",
  danger: "bg-danger/90 text-white",
};

export function EventCard({
  variant = "default",
  imageSrc,
  imageAlt,
  colorSeed,
  headerLabel,
  tags,
  title,
  href,
  date,
  location,
  attendees,
  attendeesLabel,
  urgencyLabel,
  actionLabel = "Book Tickets",
  onAction,
  eventType,
  durationText,
  spotsLeft,
}: EventCardProps) {
  const action = href ? (
    <ButtonLink href={href} variant="primary">
      {actionLabel} <Icon size="sm" icon={ArrowRight} />{" "}
    </ButtonLink>
  ) : (
    <Button variant="primary" onClick={onAction}>
      {actionLabel} <Icon size="sm" icon={ArrowRight} />
    </Button>
  );

  const secondaryInfo = resolveSecondaryInfo({
    eventType,
    durationText,
    spotsLeft,
    attendeesLabel,
  });

  if (variant === "featured") {
    const featuredClassName =
      "group relative block aspect-[12/5] h-full w-full overflow-hidden rounded-md transition-shadow hover:shadow-lg";

    const featuredContent = (
      <>
        <EventCardMedia
          src={imageSrc}
          alt={imageAlt ?? title}
          colorSeed={colorSeed}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/10" />

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex flex-wrap gap-2">
          
            </div>
            <h4 className="text-large font-bold text-white group-hover:underline">
              {title}
            </h4>
            <div className="space-y-1">
              <p className="text-small flex items-center gap-2 text-white/85">
                <Icon icon={Calendar} size="sm" />
                {date}
              </p>
              {location && (
                <p className="text-small flex items-center gap-2 text-white/85">
                  <Icon icon={MapPin} size="sm" />
                  {location}
                </p>
              )}
            </div>
          </div>
          {secondaryInfo && (
            <div className="text-small flex shrink-0 items-center gap-1.5 rounded-lg bg-black/40 px-3 py-2 font-semibold text-white backdrop-blur-sm">
              <Icon icon={secondaryInfo.icon} size="sm" />
              {secondaryInfo.text}
            </div>
          )}
        </div>
      </>
    );

    if (href) {
      return (
        <NextLink href={href} className={featuredClassName}>
          {featuredContent}
        </NextLink>
      );
    }
    return <div className={featuredClassName}>{featuredContent}</div>;
  }

  return (
    <div className="border-border-light bg-surface-light flex h-full flex-col overflow-hidden rounded-md border transition-shadow hover:shadow-md">
      <div className="relative aspect-video shrink-0">
        <EventCardMedia
          src={imageSrc}
          alt={imageAlt ?? title}
          colorSeed={colorSeed}
        />
        {headerLabel && (
          <div className="absolute top-3 left-3">
            <Badge variant="solid" tone="neutral">
              {headerLabel}
            </Badge>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag.label}
              variant="outline"
              tone={tag.tone ?? "neutral"}
              size="sm"
            >
              {tag.label}
            </Badge>
          ))}
        </div>
        <EventCardTitle
          title={title}
          href={href}
          className="text-large text-text-primary font-semibold"
        />
        <div className="space-y-1">
          <p className="text-small text-text-secondary flex items-center gap-2">
            <Icon icon={Calendar} size="sm" />
            {date}
          </p>
          {location && (
            <p className="text-small text-text-secondary flex items-center gap-2">
              <Icon icon={MapPin} size="sm" />
              {location}
            </p>
          )}
        
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          {urgencyLabel && (
            <span className="text-small text-warning font-medium">
              {urgencyLabel}
            </span>
          )}
          <span className="ml-auto">{action}</span>
        </div>
      </div>
    </div>
  );
}

// Mirrors the "default" variant's layout (image, tags, title, two info lines,
// action button) so the loading state doesn't visually jump once real cards
// arrive — used by both /events and /my-organized-events while data loads.
export function EventCardSkeleton() {
  return (
    <div className="border-border-light bg-surface-light flex h-full flex-col overflow-hidden rounded-md border">
      <Skeleton className="aspect-video w-full shrink-0 rounded-none" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
        <Skeleton className="h-5 w-3/4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="mt-auto flex justify-end pt-1">
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
    </div>
  );
}
