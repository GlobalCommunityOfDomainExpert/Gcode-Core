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
  const [openIndex, setOpenIndex] = useState<number | null>(
    defaultOpen ?? null,
  );

  return (
    <div className="divide-border-light border-border-light divide-y rounded-md border">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.title}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="text-body text-text-primary hover:bg-bg-light focus-visible:ring-primary flex w-full items-center justify-between px-4 py-3 text-left font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              {item.title}
              <Icon
                icon={ChevronDown}
                size="sm"
                className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isOpen && (
              <div className="text-body text-text-secondary px-4 pb-4">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
