import { Badge } from "@/components/atoms";

export interface StatCardTrend {
  value: string;
  tone?: "success" | "danger";
}

export interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  trend?: StatCardTrend;
}

export function StatCard({ label, value, sub, trend }: StatCardProps) {
  return (
    <div className="border-border-light bg-surface-light rounded-md border p-4 transition-shadow hover:shadow-md">
      <p className="text-small text-text-secondary font-medium tracking-wide uppercase">
        {label}
      </p>
      <div className="mt-1 flex items-baseline justify-between gap-2">
        <span className="text-heading text-text-primary font-extrabold">
          {value}
        </span>
        {trend && (
          <Badge
            size="sm"
            variant="muted"
            tone={trend.tone === "danger" ? "danger" : "success"}
          >
            {trend.value}
          </Badge>
        )}
      </div>
      {sub && <p className="text-small text-text-secondary mt-1">{sub}</p>}
    </div>
  );
}
