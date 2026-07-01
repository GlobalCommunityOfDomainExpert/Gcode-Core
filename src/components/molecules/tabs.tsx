"use client";

import { useState } from "react";

export interface TabItem {
  value: string;
  label: string;
}

export interface TabsProps {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

export function Tabs({ items, value, defaultValue, onChange }: TabsProps) {
  const [internal, setInternal] = useState(defaultValue ?? items[0]?.value);
  const active = value ?? internal;

  function select(next: string) {
    if (value === undefined) setInternal(next);
    onChange?.(next);
  }

  return (
    <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-border-light">
      {items.map((item) => {
        const isActive = item.value === active;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => select(item.value)}
            className={`shrink-0 whitespace-nowrap border-b-2 px-4 py-2 text-body font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
