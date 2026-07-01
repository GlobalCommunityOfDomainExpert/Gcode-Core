"use client";

import { ReactNode, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Icon } from "@/components/atoms";

export interface AccordionItem {
  title: string;
  content: ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  defaultOpen?: number;
}

export function Accordion({ items, defaultOpen }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpen ?? null);

  return (
    <div className="divide-y divide-border-light rounded-md border border-border-light">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.title}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-body font-medium text-text-primary hover:bg-bg-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {item.title}
              <Icon
                icon={ChevronDown}
                size="sm"
                className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isOpen && (
              <div className="px-4 pb-4 text-body text-text-secondary">{item.content}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
