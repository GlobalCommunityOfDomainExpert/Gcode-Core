import { Button, ButtonVariant } from "@/components/atoms";

export interface BulkActionBarAction {
  label: string;
  onClick: () => void;
  variant?: ButtonVariant;
}

export interface BulkActionBarProps {
  selectedCount: number;
  actions: BulkActionBarAction[];
  onClear: () => void;
}

export function BulkActionBar({
  selectedCount,
  actions,
  onClear,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-primary-light border-primary/30 flex flex-wrap items-center justify-between gap-3 rounded-md border px-4 py-3">
      <span className="text-small text-text-primary font-semibold">
        {selectedCount} selected
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            size="sm"
            variant={action.variant ?? "secondary"}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        ))}
        <Button size="sm" variant="ghost" onClick={onClear}>
          Clear
        </Button>
      </div>
    </div>
  );
}
