"use client";

import { ReactNode } from "react";
import { AppShell } from "./app-shell";
import { Navbar } from "./navbar";

export interface GuestShellProps {
  children: ReactNode;
}

export function GuestShell({ children }: GuestShellProps) {
  return (
    <AppShell navbar={<Navbar links={[]} />} sidebar={null}>
      {children}
    </AppShell>
  );
}
