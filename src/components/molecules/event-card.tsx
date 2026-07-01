import { Calendar, Image as ImageIcon, MapPin } from "lucide-react";
import { Badge, BadgeTone, Button, Icon } from "@/components/atoms";
import { AvatarGroup, AvatarGroupItem } from "./avatar-group";

export interface EventCardTag {
  label: string;
  tone?: BadgeTone;
}

export interface EventCardProps {
  variant?: "compact" | "featured";
  imageSrc?: string;
  imageAlt?: string;
  headerLabel?: string;
  tags: EventCardTag[];
  title: string;
  date: string;
  location?: string;
  attendees?: AvatarGroupItem[];
  attendeesLabel?: string;
  urgencyLabel?: string;
  actionLabel?: string;
  onAction?: () => void;
}

function EventCardMedia({ src, alt }: { src?: string; alt: string }) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} className="h-full w-full object-cover" />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-bg-light text-text-secondary">
      <Icon icon={ImageIcon} size="lg" />
    </div>
  );
}

export function EventCard({
  variant = "compact",
  imageSrc,
  imageAlt,
  headerLabel,
  tags,
  title,
  date,
  location,
  attendees,
  attendeesLabel,
  urgencyLabel,
  actionLabel = "Register",
  onAction,
}: EventCardProps) {
  if (variant === "featured") {
    return (
      <div className="flex h-full flex-col overflow-hidden rounded-md border border-border-light bg-surface-light transition-shadow hover:shadow-md">
        <div className="relative aspect-video shrink-0">
          <EventCardMedia src={imageSrc} alt={imageAlt ?? title} />
          {headerLabel && (
            <div className="absolute left-3 top-3">
              <Badge variant="solid" tone="neutral">
                {headerLabel}
              </Badge>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag.label} variant="outline" tone={tag.tone ?? "neutral"} size="sm">
                {tag.label}
              </Badge>
            ))}
          </div>
          <h4 className="text-large font-semibold text-text-primary">{title}</h4>
          <div className="space-y-1">
            <p className="flex items-center gap-2 text-small text-text-secondary">
              <Icon icon={Calendar} size="sm" />
              {date}
            </p>
            {location && (
              <p className="flex items-center gap-2 text-small text-text-secondary">
                <Icon icon={MapPin} size="sm" />
                {location}
              </p>
            )}
          </div>
          {attendees && attendees.length > 0 && (
            <AvatarGroup items={attendees} size="sm" overflowLabel={attendeesLabel} />
          )}
          <div className="mt-auto flex items-center justify-between gap-2 pt-1">
            {urgencyLabel && (
              <span className="text-small font-medium text-warning">{urgencyLabel}</span>
            )}
            <Button variant="primary" onClick={onAction} className="ml-auto">
              {actionLabel} →
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-md border border-border-light bg-surface-light transition-shadow hover:shadow-md">
      <div className="aspect-video shrink-0">
        <EventCardMedia src={imageSrc} alt={imageAlt ?? title} />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag.label} variant="solid" tone={tag.tone ?? "neutral"} size="sm">
              {tag.label}
            </Badge>
          ))}
        </div>
        <h4 className="text-body font-semibold text-text-primary">{title}</h4>
        <p className="flex items-center gap-2 text-small text-text-secondary">
          <Icon icon={Calendar} size="sm" />
          {date}
        </p>
        <Button variant="primary" onClick={onAction} className="mt-auto w-full">
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}
