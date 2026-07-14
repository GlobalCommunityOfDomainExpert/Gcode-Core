import { Avatar, Badge, BadgeTone, BadgeVariant } from "@/components/atoms";

export interface ProfileHeaderBadge {
  label: string;
  variant?: BadgeVariant;
  tone?: BadgeTone;
}

export interface ProfileHeaderProps {
  avatarInitials: string;
  avatarShape?: "circle" | "square";
  name: string;
  subtitle?: string;
  badges?: ProfileHeaderBadge[];
}

export function ProfileHeader({
  avatarInitials,
  avatarShape = "circle",
  name,
  subtitle,
  badges = [],
}: ProfileHeaderProps) {
  return (
    <div className="border-border-light bg-surface-light flex flex-col gap-4 rounded-md border p-6 sm:flex-row sm:items-center">
      {avatarShape === "circle" ? (
        <Avatar alt={name} initials={avatarInitials} size="lg" />
      ) : (
        <div className="bg-bg-light text-text-secondary flex size-12 shrink-0 items-center justify-center rounded-md font-medium">
          {avatarInitials}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <h2 className="text-large text-text-primary font-bold">{name}</h2>
        {subtitle && (
          <p className="text-body text-text-secondary">{subtitle}</p>
        )}
        {badges.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {badges.map((badge) => (
              <Badge
                key={badge.label}
                variant={badge.variant ?? "muted"}
                tone={badge.tone ?? "primary"}
                size="sm"
              >
                {badge.label}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
