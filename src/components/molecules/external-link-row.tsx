import { ExternalLink, LucideIcon } from "lucide-react";
import { Icon, Link } from "@/components/atoms";

export interface ExternalLinkRowProps {
  href: string;
  label: string;
  icon?: LucideIcon;
}

export function ExternalLinkRow({
  href,
  label,
  icon = ExternalLink,
}: ExternalLinkRowProps) {
  return (
    <Link href={href} variant="secondary" className="flex w-fit items-center gap-2">
      <Icon icon={icon} size="sm" /> {label}
    </Link>
  );
}
