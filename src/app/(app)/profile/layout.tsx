"use client";

import { ReactNode } from "react";
import { AuthedShell } from "@/components/layout";
import { useSession } from "@/hooks/use-session";

export default function ProfileLayout({ children }: { children: ReactNode }) {
  const session = useSession();

  if (!session) return null;

  return <AuthedShell session={session}>{children}</AuthedShell>;
}
