import { ReactNode } from "react";
import { Badge, BadgeTone } from "@/components/atoms";

export interface ProblemCardTag {
  label: string;
  tone?: BadgeTone;
}

export interface ProblemCardProps {
  tags: ProblemCardTag[];
  matchedReason: string;
  title: string;
  snippetLabel?: string;
  snippet: string;
  actions: ReactNode;
}

export function ProblemCard({
  tags,
  matchedReason,
  title,
  snippetLabel = "What I've tried:",
  snippet,
  actions,
}: ProblemCardProps) {
  return (
    <div className="border-border-light bg-surface-light flex flex-col gap-3 rounded-md border p-4 transition-shadow hover:shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag.label} tone={tag.tone ?? "neutral"} size="sm">
              {tag.label}
            </Badge>
          ))}
        </div>
        <span className="text-small text-text-secondary">
          Why matched: {matchedReason}
        </span>
      </div>

      <h4 className="text-body text-text-primary font-semibold">{title}</h4>

      <p className="text-body text-text-secondary">
        <strong className="text-text-primary font-semibold">
          {snippetLabel}
        </strong>{" "}
        {snippet}
      </p>

      <div className="flex flex-wrap gap-2">{actions}</div>
    </div>
  );
}
