import { Avatar, Badge, Button } from "@/components/atoms";
import { StakeholderCategory } from "@/lib/community-requests";

export interface StakeholderCardProps {
  avatarInitials: string;
  avatarSrc?: string;
  name: string;
  category: StakeholderCategory;
  org?: string;
  bio?: string;
  tags?: string[];
  selected?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

export function StakeholderCard({
  avatarInitials,
  avatarSrc,
  name,
  category,
  org,
  bio,
  tags = [],
  selected = false,
  actionLabel = "Select",
  onAction,
}: StakeholderCardProps) {
  return (
    <div
      className={`flex flex-col gap-4 rounded-md border p-5 transition-colors ${
        selected
          ? "border-primary bg-primary-light"
          : "border-border-light bg-surface-light hover:border-border-hover"
      }`}
    >
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
          {org && (
            <p className="text-small text-text-secondary truncate">{org}</p>
          )}
          <Badge variant="muted" tone="primary" size="sm" className="mt-1">
            {category}
          </Badge>
        </div>
      </div>

      {bio && <p className="text-body text-text-secondary">{bio}</p>}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="outline" tone="neutral" size="sm">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <Button
        type="button"
        variant={selected ? "secondary" : "primary"}
        size="sm"
        onClick={onAction}
        className="w-full"
      >
        {selected ? "✓ Selected" : actionLabel}
      </Button>
    </div>
  );
}
