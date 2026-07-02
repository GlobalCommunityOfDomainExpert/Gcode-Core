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
    <div
      role="tablist"
      className="border-border-light flex gap-1 overflow-x-auto border-b"
    >
      {items.map((item) => {
        const isActive = item.value === active;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => select(item.value)}
            className={`text-body focus-visible:ring-primary shrink-0 border-b-2 px-4 py-2 font-medium whitespace-nowrap transition-colors hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${
              isActive
                ? "border-primary text-primary"
                : "text-text-secondary hover:text-text-primary border-transparent"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
