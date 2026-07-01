import { Avatar, AvatarSize } from "@/components/atoms";

export interface AvatarGroupItem {
  alt: string;
  src?: string;
  initials?: string;
}

export interface AvatarGroupProps {
  items: AvatarGroupItem[];
  max?: number;
  size?: AvatarSize;
  overflowLabel?: string;
}

export function AvatarGroup({ items, max = 3, size = "md", overflowLabel }: AvatarGroupProps) {
  const visible = items.slice(0, max);
  const overflow = items.length - visible.length;

  return (
    <div className="flex items-center">
      <div className="flex -space-x-3">
        {visible.map((item, index) => (
          <Avatar
            key={index}
            alt={item.alt}
            src={item.src}
            initials={item.initials}
            size={size}
            className="ring-2 ring-border-hover rounded-full"
          />
        ))}
      </div>
      {overflow > 0 && (
        <span className="ml-3 text-small text-text-secondary">
          {overflowLabel ?? `+${overflow}`}
        </span>
      )}
    </div>
  );
}
