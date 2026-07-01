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
    <div className="rounded-md border border-border-light bg-surface-light p-4 transition-shadow hover:shadow-md">
      <p className="text-small font-medium uppercase tracking-wide text-text-secondary">{label}</p>
      <div className="mt-1 flex items-baseline justify-between gap-2">
        <span className="text-heading font-extrabold text-text-primary">{value}</span>
        {trend && (
          <Badge size="sm" variant="muted" tone={trend.tone === "danger" ? "danger" : "success"}>
            {trend.value}
          </Badge>
        )}
      </div>
      {sub && <p className="mt-1 text-small text-text-secondary">{sub}</p>}
    </div>
  );
}
