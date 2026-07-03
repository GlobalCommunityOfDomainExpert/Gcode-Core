import { ReactNode } from "react";
import { AskAiButton } from "./ask-ai-button";

export interface AppShellProps {
  navbar: ReactNode;
  sidebar: ReactNode;
  children: ReactNode;
}

export function AppShell({ navbar, sidebar, children }: AppShellProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {navbar}
      <div className="flex min-h-0 flex-1">
        {sidebar}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
      <AskAiButton />
    </div>
  );
}
