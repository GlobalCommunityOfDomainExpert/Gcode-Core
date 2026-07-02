import { Checkbox } from "@/components/atoms";

export interface ChecklistItemProps {
  label: string;
  subtext?: string;
  completed?: boolean;
}

export function ChecklistItem({
  label,
  subtext,
  completed = false,
}: ChecklistItemProps) {
  return (
    <div className="flex items-start gap-3">
      <Checkbox
        checked={completed}
        readOnly
        tabIndex={-1}
        aria-label={label}
        className="pointer-events-none mt-0.5"
      />
      <div>
        <p
          className={`text-body font-medium ${
            completed ? "text-text-primary" : "text-text-secondary"
          }`}
        >
          {label}
        </p>
        {subtext && <p className="text-small text-text-secondary">{subtext}</p>}
      </div>
    </div>
  );
}
