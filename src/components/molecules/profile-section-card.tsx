import { ReactNode } from "react";
import { SectionLabel } from "@/components/atoms";

export interface ProfileSectionCardProps {
  title?: string;
  children: ReactNode;
}

export function ProfileSectionCard({ title, children }: ProfileSectionCardProps) {
  return (
    <div className="border-border-light bg-surface-light flex flex-col gap-3 rounded-md border p-6">
      {title && <SectionLabel>{title}</SectionLabel>}
      {children}
    </div>
  );
}
