import { ReactNode } from "react";

export interface QuoteBlockProps {
  children: ReactNode;
}

export function QuoteBlock({ children }: QuoteBlockProps) {
  return (
    <p className="text-body text-text-primary border-primary border-l-4 pl-4 italic">
      {children}
    </p>
  );
}
