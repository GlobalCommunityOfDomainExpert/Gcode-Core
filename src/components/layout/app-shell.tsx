import { ReactNode } from "react";
import { AskAiButton } from "./ask-ai-button";
import { Footer } from "./footer";

export interface AppShellProps {
  navbar: ReactNode;
  sidebar: ReactNode;
  children: ReactNode;
}

export function AppShell({ navbar, sidebar, children }: AppShellProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {navbar}
      <div className="flex min-h-0 flex-1 ">
        {sidebar}
        <main
          id="app-scroll-region"
          className="flex flex-1 flex-col  overflow-y-auto"
        >
          <div className="mx-auto w-full max-w-7xl flex-1 px-4 pb-8 sm:px-6 lg:px-8">
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
