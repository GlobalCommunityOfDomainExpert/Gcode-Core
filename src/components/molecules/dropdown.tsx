"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

export interface DropdownItem {
  label: string;
  href?: string;
  onSelect?: () => void;
  divider?: boolean;
}

export interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
}

export function Dropdown({ trigger, items, align = "left" }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClick(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative inline-block">
      <div onClick={() => setOpen((prev) => !prev)}>{trigger}</div>
      {open && (
        <div
          role="menu"
          className={`absolute z-10 mt-1 min-w-40 rounded-md border border-border-light bg-surface-light py-1 shadow-md ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {items.map((item, index) =>
            item.divider ? (
              <div key={index} role="separator" className="my-1 h-px bg-border-light" />
            ) : (
              <a
                key={item.label}
                href={item.href ?? "#"}
                role="menuitem"
                onClick={(event) => {
                  if (!item.href) event.preventDefault();
                  item.onSelect?.();
                  setOpen(false);
                }}
                className="block px-3 py-2 text-body text-text-primary hover:bg-bg-light focus-visible:bg-bg-light focus-visible:outline-none"
              >
                {item.label}
              </a>
            )
          )}
        </div>
      )}
    </div>
  );
}
