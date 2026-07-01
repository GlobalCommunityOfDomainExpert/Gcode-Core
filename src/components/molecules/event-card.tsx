import { Calendar, Image as ImageIcon, MapPin } from "lucide-react";
import NextLink from "next/link";
import { Badge, BadgeTone, Button, ButtonLink, Icon } from "@/components/atoms";
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
  href?: string;
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

function EventCardTitle({ title, href, className }: { title: string; href?: string; className: string }) {
  if (href) {
    return (
      <NextLink href={href} className={`${className} hover:underline`}>
        {title}
      </NextLink>
    );
  }
  return <h4 className={className}>{title}</h4>;
}

export function EventCard({
  variant = "compact",
  imageSrc,
  imageAlt,
  headerLabel,
  tags,
  title,
  href,
  date,
  location,
  attendees,
  attendeesLabel,
  urgencyLabel,
  actionLabel = "Register",
  onAction,
}: EventCardProps) {
  const action = href ? (
    <ButtonLink href={href} variant="primary">
      {actionLabel} →
    </ButtonLink>
  ) : (
    <Button variant="primary" onClick={onAction}>
      {actionLabel} →
    </Button>
  );

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
          <EventCardTitle title={title} href={href} className="text-large font-semibold text-text-primary" />
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
            <span className="ml-auto">{action}</span>
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
        <EventCardTitle title={title} href={href} className="text-body font-semibold text-text-primary" />
        <p className="flex items-center gap-2 text-small text-text-secondary">
          <Icon icon={Calendar} size="sm" />
          {date}
        </p>
        <div className="mt-auto [&>a]:w-full [&>button]:w-full">{action}</div>
      </div>
    </div>
  );
}
