"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "./app-shell";
import { Navbar } from "./navbar";

export interface GuestShellProps {
  children: ReactNode;
}

export function GuestShell({ children }: GuestShellProps) {
  const router = useRouter();

  return (
    <AppShell
      navbar={
        <Navbar
          ctaLabel="Register"
          onCtaClick={() => router.push("/sign-up")}
          secondaryCtaLabel="Sign In"
          onSecondaryCtaClick={() => router.push("/sign-in")}
        />
      }
      sidebar={null}
    >
      {children}
    </AppShell>
  );
}
