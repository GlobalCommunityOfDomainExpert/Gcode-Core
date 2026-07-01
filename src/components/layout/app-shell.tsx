import { ReactNode } from "react";

export interface AppShellProps {
  navbar: ReactNode;
  sidebar: ReactNode;
  children: ReactNode;
}

export function AppShell({ navbar, sidebar, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {navbar}
      <div className="flex flex-1">
        {sidebar}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
