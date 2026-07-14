export interface StaticInfoCardProps {
  title: string;
  subtitle: string;
}

export function StaticInfoCard({ title, subtitle }: StaticInfoCardProps) {
  return (
    <div className="border-border-light bg-bg-light flex flex-col gap-1 rounded-md border p-4">
      <p className="text-body text-text-primary font-semibold">{title}</p>
      <p className="text-small text-text-secondary">{subtitle}</p>
    </div>
  );
}
