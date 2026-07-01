import { Button, Divider } from "@/components/atoms";

export interface CheckoutLineItem {
  label: string;
  value: string;
}

export interface CheckoutSummaryProps {
  items: CheckoutLineItem[];
  total: string;
  actionLabel?: string;
  onAction?: () => void;
  processing?: boolean;
}

export function CheckoutSummary({
  items,
  total,
  actionLabel = "Register",
  onAction,
  processing = false,
}: CheckoutSummaryProps) {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-border-light bg-surface-light p-4">
      {items.map((item) => (
        <div key={item.label} className="flex items-center justify-between text-body text-text-secondary">
          <span>{item.label}</span>
          <span>{item.value}</span>
        </div>
      ))}
      <Divider />
      <div className="flex items-center justify-between text-large font-semibold text-text-primary">
        <span>Total</span>
        <span>{total}</span>
      </div>
      <Button variant="primary" onClick={onAction} loading={processing} className="w-full">
        {actionLabel}
      </Button>
    </div>
  );
}
