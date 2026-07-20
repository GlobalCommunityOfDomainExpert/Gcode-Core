import { SectionLabel } from "@/components/atoms";
import { EventSocialLink } from "@/lib/event";

export function EventLinksCard({ links }: { links: EventSocialLink[] }) {
  if (links.length === 0) return null;

  return (
    <div className="border-border-light bg-surface-light space-y-3 rounded-md border p-6">
      <SectionLabel>Social Links</SectionLabel>
      <div className="flex flex-wrap gap-2">
        {links.map((link, index) => (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="border-border-light text-body text-text-primary hover:bg-bg-light rounded-sm border px-3 py-1.5 font-medium"
          >
            {link.platform || link.url}
          </a>
        ))}
      </div>
    </div>
  );
}
