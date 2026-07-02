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
    <div className="border-border-light bg-surface-light flex flex-col gap-3 rounded-md border p-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="text-body text-text-secondary flex items-center justify-between"
        >
          <span>{item.label}</span>
          <span>{item.value}</span>
        </div>
      ))}
      <Divider />
      <div className="text-large text-text-primary flex items-center justify-between font-semibold">
        <span>Total</span>
        <span>{total}</span>
      </div>
      <Button
        variant="primary"
        onClick={onAction}
        loading={processing}
        className="w-full"
      >
        {actionLabel}
      </Button>
    </div>
  );
}
