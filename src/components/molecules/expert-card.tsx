import { Calendar, CreditCard, Star } from "lucide-react";
import { Avatar, Badge, Button, Icon } from "@/components/atoms";

export interface ExpertCardProps {
  avatarInitials: string;
  avatarSrc?: string;
  name: string;
  title: string;
  rating: number;
  ratingCount: number;
  bio: string;
  tags: string[];
  availability: string;
  rateRange: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function ExpertCard({
  avatarInitials,
  avatarSrc,
  name,
  title,
  rating,
  ratingCount,
  bio,
  tags,
  availability,
  rateRange,
  actionLabel = "Book Engagement",
  onAction,
}: ExpertCardProps) {
  return (
    <div className="flex flex-col gap-5 rounded-md border border-border-light bg-surface-light p-5 transition-shadow hover:shadow-md">
      <div className="flex items-center gap-4">
        <Avatar alt={name} src={avatarSrc} initials={avatarInitials} size="lg" />
        <div className="min-w-0">
          <h4 className="truncate text-body font-semibold text-text-primary">{name}</h4>
          <p className="truncate text-small text-text-secondary">{title}</p>
          <div className="mt-1 flex items-center gap-1 text-small text-text-secondary">
            <Icon icon={Star} size="sm" className="fill-current text-warning" />
            <span className="font-medium text-text-primary">{rating.toFixed(1)}</span>
            <span>({ratingCount})</span>
          </div>
        </div>
      </div>

      <p className="text-body text-text-secondary">{bio}</p>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge key={tag} variant="muted" tone="primary" size="sm">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="space-y-2">
        <p className="flex items-center gap-2 text-small text-text-secondary">
          <Icon icon={Calendar} size="sm" />
          {availability}
        </p>
        <p className="flex items-center gap-2 text-small text-text-secondary">
          <Icon icon={CreditCard} size="sm" />
          {rateRange}
        </p>
      </div>

      <Button variant="primary" size="sm" onClick={onAction} className="w-full">
        {actionLabel}
      </Button>
    </div>
  );
}
