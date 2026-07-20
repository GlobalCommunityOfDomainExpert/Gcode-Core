import { Avatar, AvatarSize } from "@/components/atoms";

export interface AvatarGroupItem {
  alt: string;
  src?: string;
  initials?: string;
  bgColor?: string;
}

export interface AvatarGroupProps {
  items: AvatarGroupItem[];
  max?: number;
  size?: AvatarSize;
  overflowLabel?: string;
}

export function AvatarGroup({
  items,
  max = 3,
  size = "md",
  overflowLabel,
}: AvatarGroupProps) {
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
            bgColor={item.bgColor}
            size={size}
            className="ring-border-hover rounded-full ring-2"
          />
        ))}
      </div>
      {overflow > 0 && (
        <span className="text-small text-text-secondary ml-3">
          {overflowLabel ?? `+${overflow}`}
        </span>
      )}
    </div>
  );
}
