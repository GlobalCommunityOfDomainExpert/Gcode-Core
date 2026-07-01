"use client";

import { useState } from "react";

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

export function ToggleGroup({ options, value, defaultValue, onChange }: ToggleGroupProps) {
  const [internal, setInternal] = useState(defaultValue ?? options[0]?.value);
  const active = value ?? internal;

  function select(next: string) {
    if (value === undefined) setInternal(next);
    onChange?.(next);
  }

  return (
    <div role="radiogroup" className="inline-flex rounded-sm border border-border-light bg-bg-light p-1">
      {options.map((option) => {
        const isActive = option.value === active;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => select(option.value)}
            className={`rounded-sm px-3 py-1.5 text-small font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
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
