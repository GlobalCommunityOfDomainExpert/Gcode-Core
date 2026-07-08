import { Badge, BadgeTone } from "@/components/atoms";
import { priceTone } from "@/lib/event";

export interface EventBadgeRowProps {
  type: string;
  mode: string;
  price: string;
  typeTone?: BadgeTone;
}

export function EventBadgeRow({
  type,
  mode,
  price,
  typeTone,
}: EventBadgeRowProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge size="sm" tone={typeTone}>
        {type}
      </Badge>
      <Badge size="sm" tone="neutral">
        {mode}
      </Badge>
      <Badge size="sm" tone={priceTone(price)}>
        {price}
      </Badge>
    </div>
  );
}
