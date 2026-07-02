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
    <div className="border-border-light bg-surface-light flex flex-col gap-5 rounded-md border p-5 transition-shadow hover:shadow-md">
      <div className="flex items-center gap-4">
        <Avatar
          alt={name}
          src={avatarSrc}
          initials={avatarInitials}
          size="lg"
        />
        <div className="min-w-0">
          <h4 className="text-body text-text-primary truncate font-semibold">
            {name}
          </h4>
          <p className="text-small text-text-secondary truncate">{title}</p>
          <div className="text-small text-text-secondary mt-1 flex items-center gap-1">
            <Icon icon={Star} size="sm" className="text-warning fill-current" />
            <span className="text-text-primary font-medium">
              {rating.toFixed(1)}
            </span>
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
        <p className="text-small text-text-secondary flex items-center gap-2">
          <Icon icon={Calendar} size="sm" />
          {availability}
        </p>
        <p className="text-small text-text-secondary flex items-center gap-2">
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
