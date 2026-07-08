"use client";

import { useControllableState } from "@/hooks/use-controllable-state";

export interface ToggleGroupOption {
  value: string;
  label: string;
}

export interface ToggleGroupProps {
  options: ToggleGroupOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

export function ToggleGroup({
  options,
  value,
  defaultValue,
  onChange,
}: ToggleGroupProps) {
  const [active, select] = useControllableState(
    value,
    defaultValue ?? options[0]?.value,
    onChange,
  );

  return (
    <div
      role="radiogroup"
      className="border-border-light bg-bg-light inline-flex rounded-sm border p-1"
    >
      {options.map((option) => {
        const isActive = option.value === active;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => select(option.value)}
            className={`text-small focus-visible:ring-primary rounded-sm px-3 py-1.5 font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${
              isActive
                ? "bg-surface-light text-text-primary shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
