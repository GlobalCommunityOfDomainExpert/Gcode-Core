import { ReactNode } from "react";

export interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="w-full max-w-md">
      <div className="bg-surface-light border-border-light rounded-lg border p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-heading text-text-primary font-bold">{title}</h1>
          {subtitle && (
            <p className="text-body text-text-secondary mt-1">{subtitle}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
